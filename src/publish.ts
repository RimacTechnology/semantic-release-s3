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

    const existingFiles = await s3.getExistingFiles(config.bucketName)

    const fileDifference = existingFiles.filter((file) => {
        if (config.removeDirectoryRoot) {
            return !removedRootFilesPaths.includes(file)
        }

        return !filePaths.includes(file)
    })

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
