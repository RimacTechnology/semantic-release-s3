# @rimac-technology/semantic-release-s3

[**semantic-release**](https://github.com/semantic-release/semantic-release) plugin to push files and folders to AWS S3 bucket

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![Conventional Changelog](https://img.shields.io/badge/changelog-conventional-brightgreen.svg)](http://conventional-changelog.github.io)
[![semantic-release: angular](https://img.shields.io/badge/semantic--release-conventionalcommits-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)

| Step               | Description                                                                                                                                               |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `verifyConditions` | Verify the presence of the `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` environment variables and `bucketConfiguration` and `directoryPath`plugin options |
| `publish`          | [Upload selected files and directories](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html) to the S3 bucket                                 |

```bash
# For npm users
$ npm install --save-dev @rimac-technology/semantic-release-s3

# For yarn users
$ yarn add --dev @rimac-technology/semantic-release-s3
```

## Usage

The plugin can be configured in the
[**semantic-release ** configuration file](https://github.com/semantic-release/semantic-release/blob/master/docs/usage/configuration.md#configuration):

```json
{
    "plugins": [
        "@semantic-release/commit-analyzer",
        "@semantic-release/release-notes-generator",
        "@semantic-release/npm",
        [
            "@rimac-technology/semantic-release-s3",
            {
                "s3Bucket": {
                    "branchName": "s3-bucket-name"
                },
                "directoryPath": "directoryName/**/*"
            }
        ]
    ]
}
```

## Configuration

### Environment variables

| Variable                | Description       | Required |
| ----------------------- | ----------------- | :------: |
| `AWS_ACCESS_KEY_ID`     | AWS access key id |    ✓     |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key    |    ✓     |

If `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` can not be set, you can set custom variables and override them in plugin
options with `accessKeyName` and `secretAccessKeyName`.

### Options

| Options                  | Description                                                                                             | Default | Required |
| ------------------------ | ------------------------------------------------------------------------------------------------------- | :-----: | :------: |
| `awsAccessKeyName`       | Environmental variable name that is used to override `AWS_ACCESS_KEY_ID`                                |         |          |
| `awsSecretAccessKeyName` | Environmental variable name that is used to override `AWS_SECRET_ACCESS_KEY`                            |         |          |
| `s3Bucket`               | S3 bucket configuration can be defined per git branch or a single bucket                                |         |    ✓     |
| `objectACL`              | S3 object ACL ("private"|"public-read"|"public-read-write"|"authenticated-read"...)                     |         |          |
| `directoryPath`          | Path to directory which will be uploaded to the bucket                                                  |         |    ✓     |
| `removeDirectoryRoot`    | Flag that determines will the root directory of the given `directoryPath` be removed                    |  false  |          |
| `removeDiff`             | Flag that determines will the file diff which should be uploaded vs files already on s3 will be deleted |  true   |          |

### Example

```json
{
    "plugins": [
        "@semantic-release/commit-analyzer",
        "@semantic-release/release-notes-generator",
        "@semantic-release/npm",
        [
            "@rimac-technology/semantic-release-s3",
            {
                "awsAccessKeyName": "ACCESS_KEY_ENV_VARIABLE_NAME",
                "awsSecretAccessKeyName": "SECRET_ACCESS_KEY_ENV_VARIABLE_NAME",
                "s3Bucket": "s3-bucket-name",
                "objectACL": "public-read",
                "directoryPath": "directoryName/**/*",
                "removeDirectoryRoot": true,
                "removeDiff": false
            }
        ]
    ]
}
```
