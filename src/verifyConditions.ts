import AggregateError from 'aggregate-error'
import type { Context } from 'semantic-release'

import { AWS } from './aws'
import { getError } from './error'

export function verifyConditions(context: Context): void {
    const errors = []
    const awsConfig = AWS.loadConfig(context)

    if (!awsConfig.accessKeyId) {
        errors.push(getError('ENOACCESSKEYID'))
    }

    if (!awsConfig.secretAccessKey) {
        errors.push(getError('ENOSECRETACCESSKEY'))
    }

    if (errors.length > 0) {
        throw new AggregateError(errors)
    }
}