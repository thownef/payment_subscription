import { Response } from 'express'
import httpStatus from 'http-status'

interface ApiResponse<T = any> {
  status: number
  success: boolean
  message?: string
  data?: T
  errors?: ValidationError[]
}
interface ValidationError {
  readonly field: string
  readonly message: string
}

/**
 * Base function to send API response
 */
const sendResponse = <T>(
  res: Response,
  statusCode: number,
  success: boolean,
  data?: T,
  message?: string,
  errors?: ValidationError[]
): void => {
  const response: ApiResponse<T> = {
    status: statusCode,
    success,
    ...(message && { message }),
    ...(data && { data }),
    ...(errors && { errors })
  }

  res.status(statusCode).json(response)
}
// Handle success response
export const httpOk = <T>(res: Response, data?: T, message = 'Success'): void => {
  sendResponse(res, httpStatus.OK, true, data, message)
}

export const httpCreated = <T>(res: Response, data?: T, message = 'Created'): void => {
  sendResponse(res, httpStatus.CREATED, true, data, message)
}

export const httpNoContent = (res: Response): void => {
  sendResponse(res, httpStatus.NO_CONTENT, true)
}

// Handle error response
export const httpBadRequest = (res: Response, message = 'Bad Request'): void => {
  sendResponse(res, httpStatus.BAD_REQUEST, false, undefined, message)
}

export const httpUnauthorized = (res: Response, message = 'Unauthorized'): void => {
  sendResponse(res, httpStatus.UNAUTHORIZED, false, undefined, message)
}

export const httpForbidden = (res: Response, message = 'Forbidden'): void => {
  sendResponse(res, httpStatus.FORBIDDEN, false, undefined, message)
}

export const httpNotFound = (res: Response, message = 'Not Found'): void => {
  sendResponse(res, httpStatus.NOT_FOUND, false, undefined, message)
}

export const httpUnprocessable = (res: Response, errors: ValidationError[], message = 'Validation Failed'): void => {
  sendResponse(res, httpStatus.UNPROCESSABLE_ENTITY, false, undefined, message, errors)
}

export const httpError = (res: Response, error: Error | unknown, message = 'Internal Server Error'): void => {
  const errorResponse = process.env.NODE_ENV === 'development' ? error : undefined
  sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, false, errorResponse, message)
}
