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
      await schema.query.parseAsync(camelizeKeys(req.query))
    }
    if (schema.body) {
      req.body = await schema.body.parseAsync(camelizeKeys(req.body))
    }
    next()
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessages = error.errors.map((err) => ({
        field: _.snakeCase(err.path[0] as string),
        message: err.message
      }))
      return httpUnprocessable(res, errorMessages)
    }
    return next(error)
  }
}

export default validate
