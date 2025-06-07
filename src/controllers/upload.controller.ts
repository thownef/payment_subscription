import { Request, Response } from 'express'

const getList = async (req: Request, res: Response) => {
  res.send('Hello World')
}

export default {
  getList
}
