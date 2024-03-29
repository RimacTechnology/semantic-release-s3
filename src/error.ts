import type { ErrorCodes } from './types'

class SemanticReleaseError extends Error {
    // @ts-expect-error
    private code?: string

    // @ts-expect-error
    private details?: string

    constructor(message: string, code?: string, details?: string) {
        super(message)
        Error.captureStackTrace(this, this.constructor)
        this.name = 'SemanticReleaseError'
        this.code = code
        this.details = details
    }
}

export function getError(code: ErrorCodes): SemanticReleaseError {
    switch (code) {
    case 'ENOACCESSKEYID': {
        return new SemanticReleaseError(
            'No aws access key id specified.',
            'ENOACCESSKEYID',
            'An aws access key id must be created and set ' +
                'in the `S3_ACCESS_KEY` environment variable on your CI environment.'
        )
    }

    case 'ENOSECRETACCESSKEY': {
        return new SemanticReleaseError(
            'No aws secret access key specified.',
            'ENOSECRETACCESSKEY',
            'An aws secret access key id must be created and set ' +
                'in the `S3_SECRET_ACCESS_KEY` environment variable on your CI environment.'
        )
    }

    case 'ENOS3BUCKET': {
        return new SemanticReleaseError(
            'No aws bucket specified.',
            'ENOS3BUCKET',
            'An aws bucket configuration must be specified or configured for at least one branch to successfully upload files.'
        )
    }

    case 'ENODIRECTORYPATH': {
        return new SemanticReleaseError(
            'No directory path for upload specified.',
            'ENODIRECTORYPATH',
            'Directory path must be specified to successfully upload files to aws bucket.'
        )
    }

    default: {
        return new SemanticReleaseError(
            'Unknown error occurred.'
        )
    }
    }
}
