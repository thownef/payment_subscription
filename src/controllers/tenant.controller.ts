import { Request, Response } from 'express'
import tenantService from '@/services/tenant.service'
import { httpOk } from '@/utils/apiHandler'

const register = async (req: Request, res: Response) => {
  const tenant = await tenantService.create(req.body)
  return httpOk(res, tenant)
}

export default {
  register
}
