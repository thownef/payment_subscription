import _ from 'lodash'
import { Tenant } from '@prisma/client-master'
import { masterPrisma } from '@/index'
import databaseService from './database.service'
import { TRegisterTenant } from '@/validations/tenant.validation'
import ApiError from '@/utils/ApiError'
import httpStatus from 'http-status'

const create = async (data: TRegisterTenant): Promise<Tenant> => {
  const existingTenant = await masterPrisma.tenant.findUnique({
    where: { contractId: data.contractId }
  })

  if (existingTenant) {
    throw new ApiError(httpStatus.UNPROCESSABLE_ENTITY, 'Tenant with this contract id already exists', [
      { field: 'contractId', message: 'Tenant with this contract id already exists' }
    ])
  }

  const tenant = await masterPrisma.tenant.create({ data: _.omit(data, ['password', 'confirmPassword']) })
  await databaseService.createTenantDatabase(data, tenant.id)

  return _.omit(tenant, ['createdAt', 'updatedAt', 'database']) as Tenant
}

export default {
  create
}
