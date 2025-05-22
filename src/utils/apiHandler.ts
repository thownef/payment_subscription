import { Response } from 'express'
import httpStatus from 'http-status'

export const httpOk = <T>(res: Response, data?: T, message?: string) => {
  res.status(httpStatus.OK).json({
    status: httpStatus.OK,
    success: true,
    data,
    message
  })
}

export const httpUnauthorized = (res: Response) => {
  res.status(httpStatus.UNAUTHORIZED).json({
    status: httpStatus.UNAUTHORIZED,
    message: 'Unauthorized'
  })
}

export const httpNoContent = (res: Response) => {
  res.status(httpStatus.NO_CONTENT).json({
    status: httpStatus.NO_CONTENT
  })
}

export const httpNotFound = (res: Response) => {
  res.status(httpStatus.NOT_FOUND).json({
    status: httpStatus.NOT_FOUND,
    message: 'Not found'
  })
}

export const httpUnprocessable = (
  res: Response,
  errors: {
    field: string
    message: string
  }[]
) => {
  res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
    status: httpStatus.UNPROCESSABLE_ENTITY,
    message: 'Unprocessable entity',
    errors: errors
  })
}

export const httpError = (res: Response, error: any) => {
  res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
    status: httpStatus.INTERNAL_SERVER_ERROR,
    success: false,
    message: 'Internal server error',
    errors: error
  })
}
