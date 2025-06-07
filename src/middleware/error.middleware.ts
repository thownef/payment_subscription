import { Request, Response, NextFunction } from 'express'
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken'
import httpStatus from 'http-status'
import ApiError from '@/utils/ApiError'
import { httpError, httpNotFound, httpUnprocessable } from '@/utils/apiHandler'

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ApiError) {
    switch (err.statusCode) {
      case httpStatus.UNPROCESSABLE_ENTITY:
        return httpUnprocessable(res, err.errors, err.message)
      case httpStatus.NOT_FOUND:
        return httpNotFound(res)
      default:
        return httpError(res, err, err.message)
    }
  }

  // jwt
  if (err instanceof JsonWebTokenError || err instanceof TokenExpiredError) {
    return httpError(res, err, 'Invalid or expired token')
  }

  return httpError(res, err)
}
