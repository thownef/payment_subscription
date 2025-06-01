import { Request, Response } from 'express'
import _ from 'lodash'
import { httpError } from '@/utils/apiHandler'
import ApiError from '@/utils/ApiError'
import { httpUnprocessable } from '@/utils/apiHandler'

const getList = async (req: Request, res: Response) => {
  try {
    res.send('Hello World')
  } catch (error) {
    if (error instanceof ApiError) {
      return httpUnprocessable(res, error.errors)
    } else {
      return httpError(res, error)
    }
  }
}

export default {
  getList
}
