import fs from 'fs'
import globby from 'globby'
import path from 'path'
import { Context } from 'semantic-release'
import { AWS } from './src/aws'
import {
    AWSConfig,
    PluginConfig,
    WithoutNullableKeys,
} from './src/types'


const config = {
    directoryPath: 'bom.json',
    s3Bucket: 'mario-temp-123/oem-dashboard/test',
} as unknown as PluginConfig

const context = {
    env: {
        AWS_ACCESS_KEY_ID: 'AKIA2KAZGUNJKHJ2VSPA',
        AWS_SECRET_ACCESS_KEY: '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',
    },
} as unknown as Context

export async function publish() {
    const awsConfig = AWS.loadConfig(config, context) as WithoutNullableKeys<AWSConfig>

    console.log(awsConfig)
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

    const bucketPrefix = bucketPrefixes.join(path.sep).replace(/\$([A-Z_]+[A-Z0-9_]*)|\${([A-Z0-9_]*)}/ig, (match, p1, p2) => {
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

    const existingFiles = await s3.getExistingFiles(bucketName, '')

    console.log('Existing files: ', existingFiles)

    const fileDifference = existingFiles.filter((file) => {
        if (config.removeDirectoryRoot) {
            return !removedRootFilesPaths.includes(file)
        }

        return !filePaths.includes(file)
    })

    console.log('Files to delete: ', fileDifference)

    const result = await Promise.allSettled([
        ...fileDifference.map(async (pathToDelete) => {
            return s3.deleteFile(
                bucketName as string,
                pathToDelete,
            )
        }),
        ...filePaths.map(async (filePath, index) => {
            return s3.uploadFile(
                bucketName as string,
                path.join(bucketPrefix, removedRootFilesPaths[index] ?? filePath),
                fs.createReadStream(filePath),
            )
        }),
    ]).then((res) => console.log(res))

    console.log(result)

    // await Promise.all(
    //     fileDifference.map(async (pathToDelete) => {
    //         return s3.deleteFile(
    //             bucketName as string,
    //             pathToDelete,
    //         )
    //     }),
    // )
    //
    // console.log('Files to upload: ', filePaths)
    // await Promise.all(
    //     filePaths.map(async (filePath, index) => {
    //         return s3.uploadFile(
    //             bucketName as string,
    //             path.join(bucketPrefix, removedRootFilesPaths[index] ?? filePath),
    //             fs.createReadStream(filePath),
    //         )
    //     }),
    // )
}

publish()
