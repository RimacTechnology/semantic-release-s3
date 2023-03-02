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
    PutObjectRequest,
} from 'aws-sdk/clients/s3'
import type { Context } from 'semantic-release'

import type {
    AWSConfig,
    PluginConfig,
} from './types'

export class AWS {
    public static loadConfig(config: PluginConfig, context: Context): AWSConfig {
        return {
            awsAccessKey: context.env[config.awsAccessKeyName ?? 'AWS_ACCESS_KEY_ID'] ?? null,
            awsSecretAccessKey: context.env[config.awsSecretAccessKeyName ?? 'AWS_SECRET_ACCESS_KEY'] ?? null,
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

    public async getExistingFiles(bucket: string, prefix?: string) {
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
                                allKeys,
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
                Prefix: prefix,
            },
        )
    }

    public async uploadFile(bucket: string, key: string, body: ReadStream, objectMimeType: string) {
        const uploadParams: PutObjectRequest = {
            Body: body,
            Bucket: bucket,
            ContentType: objectMimeType,
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
