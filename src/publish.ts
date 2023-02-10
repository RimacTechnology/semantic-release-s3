import fs from 'fs'

import globby from 'globby'
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

    let bucketName: string | undefined

    if (typeof config.s3Bucket === 'string') {
        bucketName = config.s3Bucket
    } else if (typeof config.s3Bucket === 'object') {
        bucketName = config.s3Bucket[context.branch.name]
    }

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

    const existingFiles = await s3.getExistingFiles(bucketName)

    const fileDifference = existingFiles.filter((file) => {
        if (config.removeDirectoryRoot) {
            return !removedRootFilesPaths.includes(file)
        }

        return !filePaths.includes(file)
    })

    await Promise.all(
        filePaths.map(async (filePath, index) => {
            return s3.uploadFile(
                bucketName as string,
                removedRootFilesPaths[index] ?? filePath,
                fs.createReadStream(filePath),
            )
        }),
    )

    await Promise.all(
        fileDifference.map(async (pathToDelete) => {
            return s3.deleteFile(
                bucketName as string,
                pathToDelete,
            )
        }),
    )
}
