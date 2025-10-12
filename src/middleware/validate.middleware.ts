import { NextFunction, Request, Response } from 'express'
import { AnyZodObject, ZodEffects, ZodError } from 'zod'
import { camelizeKeys } from 'humps'
import _ from 'lodash'
import { httpUnprocessable } from '@/utils/apiHandler'

interface ValidateSchema {
  params?: AnyZodObject | ZodEffects<AnyZodObject>
  query?: AnyZodObject | ZodEffects<AnyZodObject>
  body?: AnyZodObject | ZodEffects<AnyZodObject>
  headers?: AnyZodObject | ZodEffects<AnyZodObject>
}

const validate = (schema: ValidateSchema) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (schema.params) {
      req.params = await schema.params.parseAsync(camelizeKeys(req.params))
    }
    if (schema.query && Object.keys(req.query).length > 0) {
      req.query = await schema.query.parseAsync(camelizeKeys(req.query))
    }
    if (schema.body) {
      req.body = await schema.body.parseAsync(camelizeKeys(req.body))
    }
    if (schema.headers) {
      req.headers = await schema.headers.parseAsync(camelizeKeys(req.headers))
    }
    next()
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessages = error.errors.map((err) => ({
        field: _.snakeCase(err.path.join('.')),
        message: err.message
      }))
      return httpUnprocessable(res, errorMessages, 'Validation failed')
    }
    return next(error)
  }
}

export default validate
