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

    const s3 = new AWS(awsConfig.accessKey, awsConfig.secretAccessKey)

    const filePaths = await globby(config.directoryPath)

    let removedRootFilesPaths: string[] = []

    if (config.removeDirectoryRoot) {
        removedRootFilesPaths = filePaths.map((filePath) => {
            return filePath.slice(filePath.indexOf('/') + 1)
        })
    }

    // eslint-disable-next-line no-console
    console.log('filePaths', filePaths)

    // eslint-disable-next-line no-console
    console.log('context branch', context.branch.name)

    const existingFiles = await s3.getExistingFiles(config.bucketName).catch((error: unknown) => {
        // eslint-disable-next-line no-console
        console.log('error', error)
    })

    // eslint-disable-next-line no-console
    console.log('existingFiles', existingFiles)

    if(!existingFiles) {
        throw new Error('error')
    }

    const fileDifference = existingFiles.filter((file) => {
        if (config.removeDirectoryRoot) {
            return !removedRootFilesPaths.includes(file)
        }

        return !filePaths.includes(file)
    })

    // eslint-disable-next-line no-console
    console.log('fileDifference', fileDifference)

    await Promise.all(
        filePaths.map(async (filePath, index) => {
            return s3.uploadFile(
                config.bucketName,
                removedRootFilesPaths[index] ?? filePath,
                fs.createReadStream(filePath),
            )
        })
    )

    await Promise.all(
        fileDifference.map(async (pathToDelete) => {
            return s3.deleteFile(
                config.bucketName,
                pathToDelete,
            )
        })
    )
}
