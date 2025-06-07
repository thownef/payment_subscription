import { RequestHandler } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import * as qs from 'qs'

/**
 * Higher-order function that wraps an async Express request handler to catch any errors
 * and pass them to the Express error handling middleware.
 *
 * @param fn - The async Express request handler to wrap
 * @returns A wrapped request handler that catches and forwards errors
 */
const catchAsync = <
  P = ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = qs.ParsedQs,
  Locals extends Record<string, any> = Record<string, any>
>(
  fn: RequestHandler<P, ResBody, ReqBody, ReqQuery, Locals>
): RequestHandler<P, ResBody, ReqBody, ReqQuery, Locals> => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

export default catchAsync
