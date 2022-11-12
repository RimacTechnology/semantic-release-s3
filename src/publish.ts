import fs from 'fs'

import type { ManagedUpload } from 'aws-sdk/lib/s3/managed_upload'
import globby from 'globby'
import type { Context } from 'semantic-release'

import { AWS } from './aws'
import type {
    AWSConfig,
    Config,
    WithoutNullableKeys,
} from './types'

export function publish(config: Config, context: Context) {
    const awsConfig = AWS.loadConfig(context) as WithoutNullableKeys<AWSConfig>

    const s3 = new AWS(awsConfig.accessKeyId, awsConfig.secretAccessKey)

    void config.directories.map(async (directory) => {
        const files = await globby(directory.path)

        const uploads = files.map(async (filePath) => {
            const fileStream = fs.createReadStream(filePath)
            const uploadParams = {
                Body: fileStream,
                Bucket: config.bucket,
                Key: directory.removeRoot ? filePath.slice(Math.max(0, filePath.indexOf('/') + 1)) : filePath,
            }

            return new Promise((resolve, reject) => {
                s3.awsS3.upload(uploadParams, (error: Error, data: ManagedUpload.SendData) => {
                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                    if (error) {
                        // eslint-disable-next-line no-console
                        console.log('Error ', error, ' for path ', filePath)
                        reject(error)
                    } else {
                        // eslint-disable-next-line no-console
                        console.log('Upload Success ', data.Location, ' for path ', filePath)
                        resolve(data.Location)
                    }
                })
            })
        })

        await Promise.allSettled(uploads)
    })
}