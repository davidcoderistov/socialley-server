import { Request, Response, NextFunction } from 'express'
import { processRequest } from 'graphql-upload-ts'


export function graphQLUploadMiddleware (req: Request, res: Response, next: NextFunction) {
    if (!req.is('multipart/form-data')) {
        return next()
    }
    processRequest(req, res)
        .then((body) => {
            req.body = body
            next()
        })
        .catch((error) => {
            if (error.status && error.expose) res.status(error.status)
            next(error)
        })
}