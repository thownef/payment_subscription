import { NextFunction, Request, Response } from 'express'
import { AnyZodObject, ZodEffects, ZodError } from 'zod'
import { camelizeKeys } from 'humps'
import { httpUnprocessable } from '@/utils/apiHandler'

type ZodSchema = {
  params?: AnyZodObject
  query?: AnyZodObject
  body?: AnyZodObject | ZodEffects<AnyZodObject>
  headers?: AnyZodObject
}

const validate = (schema: ZodSchema) => async (req: Request, res: Response, next: NextFunction) => {
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
        field: err.path[0] as string,
        message: err.message
      }))
      return httpUnprocessable(res, errorMessages)
    }
    return next(error)
  }
}

export default validate
