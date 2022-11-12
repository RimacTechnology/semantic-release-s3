import type aws from 'aws-sdk'
import {
    Credentials,
    S3,
} from 'aws-sdk'
import type { Context } from 'semantic-release'

import type { AWSConfig } from './types'

export class AWS {
    public static loadConfig(context: Context): AWSConfig {
        let accessKeyId: string | null = null
        let secretAccessKey: string | null = null

        if (context.env.AWS_ACCESS_KEY_ID) {
            accessKeyId = context.env.AWS_ACCESS_KEY_ID
        }

        if (context.env.AWS_SECRET_ACCESS_KEY) {
            secretAccessKey = context.env.AWS_SECRET_ACCESS_KEY
        }

        return {
            accessKeyId,
            secretAccessKey,
        }
    }

    public readonly awsS3: InstanceType<typeof aws.S3>

    constructor(accessKeyId: string, secretAccessKey: string) {
        this.awsS3 = new S3({
            computeChecksums: true,
            credentials: new Credentials(accessKeyId, secretAccessKey),
            sslEnabled: true,
        })
    }
}