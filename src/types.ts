import type { Config } from 'semantic-release'

export interface PluginConfig extends Config {
    /**
     * Access key env variable name
     *
     * @default ""
     */
    readonly awsAccessKeyName?: string
    /**
     * Secret access key env variable name
     *
     * @default ""
     */
    readonly awsSecretAccessKeyName?: string
    /**
     * Path to directory
     *
     * @default ""
     */
    readonly directoryPath: string
    /**
     * If true, root directory of the given [directoryPath] will be removed
     *
     * @default "false"
     */
    readonly removeDirectoryRoot?: boolean
    /**
     * if true, all files which are on remote but not staged for upload will be deleted
     *
     * @default "false"
     */
    readonly removeDiff?: boolean
    /**
     * Bucket configuration
     *
     * @default ""
     */
    readonly s3Bucket: Record<string, string> | string
}

export type WithoutNullableKeys<Type> = {
    [Key in keyof Type]-?: WithoutNullableKeys<NonNullable<Type[Key]>>
}

export type AWSConfig = {
    /**
     * AWS access key
     *
     * @default ""
     */
    awsAccessKey: string | null
    /**
     * AWS secret access key
     *
     * @default ""
     */
    awsSecretAccessKey: string | null
}

export type ErrorCodes =
    'ENOACCESSKEYID' | 'ENODIRECTORYPATH' | 'ENOS3BUCKET' | 'ENOSECRETACCESSKEY'
