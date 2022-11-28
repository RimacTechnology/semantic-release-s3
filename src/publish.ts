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

    const bucketName = config.bucketName[context.branch.name]

    if(!bucketName) {
        throw new Error(`Missing bucket name for ${context.branch.name} branch.
        Please check your plugin configuration and add a valid bucket name.`)
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
                bucketName,
                removedRootFilesPaths[index] ?? filePath,
                fs.createReadStream(filePath),
            )
        })
    )

    await Promise.all(
        fileDifference.map(async (pathToDelete) => {
            return s3.deleteFile(
                bucketName,
                pathToDelete,
            )
        })
    )
}
