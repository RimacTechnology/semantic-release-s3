import type { Config } from 'semantic-release'

export interface PluginConfig extends Config {
    /**
     * Access key env variable name
     *
     * @default ""
     */
    readonly accessKeyName?: string
    /**
     * Bucket configuration
     *
     * @default ""
     */
    readonly bucketName: Bucket
    /**
     * Path to directory
     *
     * @default ""
     */
    readonly directoryPath: string
    /**
     * If true, root directory of the given [directoryPath] will be removed
     *
     * @default ""
     */
    readonly removeDirectoryRoot?: boolean
    /**
     * Secret access key env variable name
     *
     * @default ""
     */
    readonly secretAccessKeyName?: string
}

export type WithoutNullableKeys<Type> = {
    [Key in keyof Type]-?: WithoutNullableKeys<NonNullable<Type[Key]>>
}

export type Bucket = {
    /**
     * Bucket name to upload alpha branch
     *
     * @default ""
     */
    alpha: string
    /**
     * Bucket name to upload master branch
     *
     * @default ""
     */
    master: string
}

export type AWSConfig = {
    /**
     * AWS access key
     *
     * @default ""
     */
    accessKey: string | null
    /**
     * AWS secret access key
     *
     * @default ""
     */
    secretAccessKey: string | null
}

export type ErrorCodes =
    'ENOACCESSKEYID' | 'ENOBUCKETNAME' | 'ENODIRECTORYPATH' | 'ENOSECRETACCESSKEY'