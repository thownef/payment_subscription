import { Request, Response, NextFunction } from 'express'
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken'
import { Prisma } from '@prisma/client'
import httpStatus from 'http-status'
import ApiError from '@/utils/ApiError'
import { httpError, httpNotFound, httpUnauthorized, httpUnprocessable, httpBadRequest } from '@/utils/apiHandler'

export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction): void => {
  // Log error for debugging (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.error('Error occurred:', {
      message: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      timestamp: new Date().toISOString()
    })
  }

  // Handle custom ApiError
  if (err instanceof ApiError) {
    switch (err.statusCode) {
      case httpStatus.UNPROCESSABLE_ENTITY:
        return httpUnprocessable(res, err.errors, err.message)
      case httpStatus.NOT_FOUND:
        return httpNotFound(res, err.message)
      case httpStatus.UNAUTHORIZED:
        return httpUnauthorized(res, err.message)
      case httpStatus.BAD_REQUEST:
        return httpBadRequest(res, err.message)
      default:
        return httpError(res, err, err.message)
    }
  }

  // Handle JWT errors
  if (err instanceof JsonWebTokenError || err instanceof TokenExpiredError) {
    return httpUnauthorized(res, 'Invalid or expired token')
  }

  // Handle Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': {
        // Unique constraint violation
        const field = (err.meta?.target as string[])?.[0] || 'field'
        return httpUnprocessable(res, [{ field, message: `${field} already exists` }], 'Validation failed')
      }
      case 'P2025':
        return httpNotFound(res, 'Record not found')
      case 'P2003':
        return httpBadRequest(res, 'Foreign key constraint failed')
      case 'P2014':
        return httpBadRequest(res, 'Invalid ID provided')
      case 'P2001':
        return httpNotFound(res, 'Record not found')
      case 'P2016':
        return httpBadRequest(res, 'Query interpretation error')
      case 'P2017':
        return httpBadRequest(res, 'Required relation not found')
      default:
        return httpError(res, err, 'Database operation failed')
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return httpBadRequest(res, 'Invalid data provided')
  }

  if (err instanceof Prisma.PrismaClientInitializationError) {
    return httpError(res, err, 'Database connection failed')
  }

  if (err instanceof Prisma.PrismaClientRustPanicError) {
    return httpError(res, err, 'Database engine crashed')
  }

  // Handle validation errors from other sources
  if (err.name === 'ValidationError') {
    return httpBadRequest(res, err.message)
  }

  // Handle syntax errors
  if (err instanceof SyntaxError && 'body' in err) {
    return httpBadRequest(res, 'Invalid JSON in request body')
  }

  // Default error handler
  return httpError(res, err)
}
