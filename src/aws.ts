import type { ReadStream } from 'fs'

import type aws from 'aws-sdk'
import type { AWSError } from 'aws-sdk'
import {
    Credentials,
    S3,
} from 'aws-sdk'
import type {
    ListObjectsV2Request,
    ManagedUpload,
} from 'aws-sdk/clients/s3'
import type { Context } from 'semantic-release'

import type {
    AWSConfig,
    PluginConfig,
} from './types'

export class AWS {
    public static loadConfig(config: PluginConfig, context: Context): AWSConfig {
        let accessKey: string | null
        let secretAccessKey: string | null

        accessKey = context.env[config.accessKeyName ?? 'AWS_ACCESS_KEY_ID'] ?? null
        secretAccessKey = context.env[config.secretAccessKeyName ?? 'AWS_SECRET_ACCESS_KEY'] ?? null

        return {
            accessKey,
            secretAccessKey,
        }
    }

    public readonly awsS3: InstanceType<typeof aws.S3>

    constructor(accessKey: string, secretAccessKey: string) {
        this.awsS3 = new S3({
            computeChecksums: true,
            credentials: new Credentials(accessKey, secretAccessKey),
            sslEnabled: true,
        })
    }

    public async deleteFile(bucket: string, pathToDelete: string) {
        return new Promise((_resolve, reject) => {
            const deleteParam = {
                Bucket: bucket,
                Key: pathToDelete,
            }

            this.awsS3.deleteObject(deleteParam, (error: AWSError | null) => {
                if (error) {
                    reject(error)
                }
            })
        })
    }

    public async getExistingFiles(bucket: string) {
        async function existingFilesKeys(
            s3: S3,
            param: ListObjectsV2Request,
            allKeys: string[] = [],
        ): Promise<string[]> {
            return new Promise((resolve, reject) => {
                s3.listObjectsV2(param, async (error: AWSError | null, data) => {
                    if (error) {
                        reject(error)
                    } else {
                        if (data.Contents) {
                            allKeys.push(...data.Contents.map((content) => {
                                return content.Key as string
                            }))
                        }

                        if (data.IsTruncated) {
                            resolve(await existingFilesKeys(
                                s3,
                                {
                                    ...param,
                                    ContinuationToken: data.NextContinuationToken,
                                },
                                allKeys
                            ))
                        } else {
                            resolve(allKeys)
                        }
                    }
                })
            })
        }

        return existingFilesKeys(
            this.awsS3,
            {
                Bucket: bucket,
            }
        )
    }

    public async uploadFile(bucket: string, key: string, body: ReadStream) {
        const uploadParams = {
            Body: body,
            Bucket: bucket,
            Key: key,
        }

        return new Promise((resolve, reject) => {
            this.awsS3.upload(uploadParams, (error: Error | null, data: ManagedUpload.SendData) => {
                if (error) {
                    reject(error)
                } else {
                    resolve(data.Location)
                }
            })
        })
    }
}
