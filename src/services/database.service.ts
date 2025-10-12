import { exec } from 'child_process'
import { promisify } from 'util'
import httpStatus from 'http-status'
import ApiError from '@/utils/ApiError'
import { masterPrisma, prisma } from '@/index'
import { PrismaClient } from '@prisma/client'
import { TRegisterTenant } from '@/validations/tenant.validation'
import { encryptPassword } from '@/utils/encryption'
import { seedTenantData } from '../../prisma/seed'

const execAsync = promisify(exec)

const createTenantDatabase = async (data: TRegisterTenant, tenantId: number) => {
  const { contractId, name, email, password } = data
  try {
    const databaseName = `payment_${tenantId}`

    await masterPrisma.tenant.update({
      where: { id: tenantId },
      data: { database: databaseName }
    })

    const tenantDatabaseUrl = `${process.env.TENANT_DATABASE_URL!}/${databaseName}`

    try {
      await prisma.$executeRawUnsafe(`CREATE DATABASE IF NOT EXISTS ${databaseName};`)
      await prisma.$disconnect()

      await execAsync(
        `set "TENANT_DATABASE_URL=${tenantDatabaseUrl}" && npx prisma migrate deploy --schema ./prisma/schema.prisma`
      )

      const tenantPrisma = new PrismaClient({
        datasources: {
          db: {
            url: tenantDatabaseUrl
          }
        }
      })

      await tenantPrisma.user.create({
        data: {
          email,
          password: await encryptPassword(password),
          name,
          uid: contractId,
          role: 1
        }
      })

      await execAsync(`set "TENANT_DATABASE_URL=${tenantDatabaseUrl}" && npx ts-node prisma/seed.ts`)

      await tenantPrisma.$disconnect()

      return databaseName
    } catch (error) {
      await prisma.$executeRawUnsafe(`DROP DATABASE IF EXISTS \`${databaseName}\`;`)
      await prisma.$disconnect()
      throw error
    }
  } catch (error) {
    if (error instanceof ApiError) throw error
    console.log(error)
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to create tenant database')
  }
}

const getTenantDatabase = async (tenantId: number) => {
  const tenant = await masterPrisma.tenant.findUnique({
    where: { id: tenantId }
  })

  if (!tenant) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Tenant database not found')
  }

  return {
    database: tenant.database,
    databaseUrl: `${process.env.TENANT_DATABASE_URL!}/${tenant.database}`
  }
}

export default {
  createTenantDatabase,
  getTenantDatabase
}
