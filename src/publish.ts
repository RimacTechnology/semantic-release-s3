import fs from 'fs'
import * as path from 'path'

import globby from 'globby'
import mime from 'mime-types'
import type { Context } from 'semantic-release'

import { AWS } from './aws'
import type {
    AWSConfig,
    PluginConfig,
    WithoutNullableKeys,
} from './types'

export async function publish(config: PluginConfig, context: Context) {
    const awsConfig = AWS.loadConfig(config, context) as WithoutNullableKeys<AWSConfig>

    const s3 = new AWS(awsConfig.awsAccessKey, awsConfig.awsSecretAccessKey)

    const filePaths = await globby(config.directoryPath)

    let s3Bucket: string | undefined

    if (typeof config.s3Bucket === 'string') {
        s3Bucket = config.s3Bucket
    } else if (typeof config.s3Bucket === 'object') {
        s3Bucket = config.s3Bucket[context.branch.name]
    }

    const [
        bucketName,
        ...bucketPrefixes
    ] = s3Bucket?.split(path.sep) ?? []

    const bucketPrefix = bucketPrefixes.join(path.sep).replace(/\$([_a-z]+\w*)|\$\{(\w*)\}/giu, (match, p1, p2) => {
        return process.env[p1 || p2] ?? match
    })

    if (!bucketName) {
        throw new Error('Missing s3 bucket configuration. ' +
            'Please check your plugin configuration and add a valid ' +
            's3 bucket name or s3 bucket configuration for one or more git branches.')
    }

    let removedRootFilesPaths: string[] = []

    if (config.removeDirectoryRoot) {
        removedRootFilesPaths = filePaths.map((filePath) => {
            return filePath.slice(filePath.indexOf('/') + 1)
        })
    }

    const publishPromises = []

    if (config.removeDiff) {
        const existingFiles = await s3.getExistingFiles(bucketName, bucketPrefix)

        const fileDifference = existingFiles.filter((file) => {
            if (config.removeDirectoryRoot) {
                return !removedRootFilesPaths.includes(file)
            }

            return !filePaths.includes(file)
        })

        publishPromises.push(...fileDifference.map(async (pathToDelete) => {
            return s3.deleteFile(
                bucketName,
                pathToDelete,
            )
        }))
    }

    publishPromises.push(...filePaths.map(async (filePath, index) => {
        const fileName = path.basename(filePath)
        // 'application/octet-stream' is the default s3 content type for object uploads
        const mimeType = mime.lookup(fileName) || 'application/octet-stream'

        return s3.uploadFile(
            bucketName,
            path.join(bucketPrefix, removedRootFilesPaths[index] ?? filePath),
            fs.createReadStream(filePath),
            mimeType,
            config.objectACL
        )
    }),
    )

    await Promise.allSettled(publishPromises)
}
