import { Request, Response } from 'express'
import { httpOk } from '@/utils/apiHandler'

const getList = async (req: Request, res: Response) => {
  // TODO: Implement upload list with tenant context
  const tenantId = req.tenantId!
  res.send('Hello World')
}

export default {
  getList
}
