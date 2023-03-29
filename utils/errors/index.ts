import { GraphQLError } from 'graphql'
import { Error } from 'mongoose'


interface ValidationErrors {
    [path: string]: string
}

export function getValidationErrors (err: Error.ValidationError): ValidationErrors {
    return Object.values(err.errors).reduce((errors, err) => {
        if (err instanceof Error.ValidatorError) {
            return {
                ...errors,
                [err.path]: err.properties.message,
            }
        }
        return errors
    }, {})
}

export const GRAPHQL_ERROR_CODES = {
    MONGODB_VALIDATION_FAILED: 'MONGODB_VALIDATION_FAILED',
    MONGODB_SERVER_ERROR: 'MONGODB_SERVER_ERROR',
    INVALID_SESSION: 'INVALID_SESSION',
}

export function getValidationError (err: Error.ValidationError): GraphQLError {
    return new GraphQLError('Validation error', {
        extensions: {
            code: GRAPHQL_ERROR_CODES.MONGODB_VALIDATION_FAILED,
            errors: getValidationErrors(err),
        }
    })
}

export function getCustomValidationError (path: string, message: string): GraphQLError {
    return new GraphQLError('Validation error', {
        extensions: {
            code: GRAPHQL_ERROR_CODES.MONGODB_VALIDATION_FAILED,
            errors: { [path]: message },
        }
    })
}

export function getMongoDBServerError (message) {
    return new GraphQLError(message, {
        extensions: {
            code: GRAPHQL_ERROR_CODES.MONGODB_SERVER_ERROR,
        }
    })
}

export function getInvalidSessionError () {
    return new GraphQLError('Invalid session', {
        extensions: {
            code: GRAPHQL_ERROR_CODES.INVALID_SESSION,
        }
    })
}