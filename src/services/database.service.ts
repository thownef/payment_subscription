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

    // Check if TENANT_DATABASE_URL is set
    if (!process.env.TENANT_DATABASE_URL) {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'TENANT_DATABASE_URL environment variable is not set')
    }

    const tenantDatabaseUrl = `${process.env.TENANT_DATABASE_URL}/${databaseName}`

    try {
      // Create database using master database connection
      await masterPrisma.$executeRawUnsafe(`CREATE DATABASE IF NOT EXISTS \`${databaseName}\`;`)

      // Run migrations for tenant database
      await execAsync(
        `set "TENANT_DATABASE_URL=${tenantDatabaseUrl}" && npx prisma migrate deploy --schema ./prisma/schema.prisma`
      )

      // Create tenant Prisma client
      const tenantPrisma = new PrismaClient({
        datasources: {
          db: {
            url: tenantDatabaseUrl
          }
        }
      })

      // Create admin user for the tenant
      await tenantPrisma.user.create({
        data: {
          email,
          password: await encryptPassword(password),
          name,
          uid: contractId,
          role: 1
        }
      })

      // Run seed data if available
      try {
        await execAsync(`set "TENANT_DATABASE_URL=${tenantDatabaseUrl}" && npx ts-node prisma/seed.ts`)
      } catch (seedError) {
        console.warn('Seed data failed, continuing without seed:', seedError)
      }

      await tenantPrisma.$disconnect()

      return databaseName
    } catch (error) {
      // Cleanup: drop database if creation failed
      try {
        await masterPrisma.$executeRawUnsafe(`DROP DATABASE IF EXISTS \`${databaseName}\`;`)
      } catch (cleanupError) {
        console.warn('Failed to cleanup database:', cleanupError)
      }
      throw error
    }
  } catch (error) {
    if (error instanceof ApiError) throw error
    console.error('Tenant database creation error:', error)
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
