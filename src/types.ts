export interface Config {
    readonly bucket: string
    readonly directories: ReadonlyArray<Directory>
}

export interface Directory {
    readonly path: string
    readonly removeRoot: boolean
}

export type WithoutNullableKeys<Type> = {
    [Key in keyof Type]-?: WithoutNullableKeys<NonNullable<Type[Key]>>
}

export type AWSConfig = {
    /**
     * AWS access key id
     *
     * @default ""
     */
    accessKeyId: string | null
    /**
     * AWS secret key
     *
     * @default ""
     */
    secretAccessKey: string | null
}

export type ErrorCodes =
    | 'ENOACCESSKEYID'
    | 'ENOSECRETACCESSKEY'