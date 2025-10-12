import { PrismaClient } from '@prisma/client'
import { masterPrisma } from '@/index'
import ApiError from '@/utils/ApiError'
import httpStatus from 'http-status'

// Cache for tenant database connections
const tenantConnections = new Map<number, PrismaClient>()

/**
 * Get or create a Prisma client for a specific tenant
 * @param tenantId - The tenant ID
 * @returns PrismaClient instance for the tenant's database
 */
export const getTenantPrisma = async (tenantId: number): Promise<PrismaClient> => {
  try {
    // Check if connection already exists in cache
    if (tenantConnections.has(tenantId)) {
      return tenantConnections.get(tenantId)!
    }

    // Get tenant info from master database
    const tenant = await masterPrisma.tenant.findUnique({
      where: { id: tenantId }
    })

    if (!tenant || !tenant.database) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Tenant database not found')
    }

    if (!tenant.isActive) {
      throw new ApiError(httpStatus.FORBIDDEN, 'Tenant is inactive')
    }

    // Create tenant-specific database URL
    const tenantDatabaseUrl = `${process.env.TENANT_DATABASE_URL!}/${tenant.database}`

    // Create new Prisma client for tenant
    const tenantPrisma = new PrismaClient({
      datasources: {
        db: {
          url: tenantDatabaseUrl
        }
      }
    })

    // Test connection
    await tenantPrisma.$connect()

    // Cache the connection
    tenantConnections.set(tenantId, tenantPrisma)

    return tenantPrisma
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to connect to tenant database')
  }
}

/**
 * Close tenant database connection
 * @param tenantId - The tenant ID
 */
export const closeTenantConnection = async (tenantId: number): Promise<void> => {
  const connection = tenantConnections.get(tenantId)
  if (connection) {
    await connection.$disconnect()
    tenantConnections.delete(tenantId)
  }
}

/**
 * Close all tenant database connections
 */
export const closeAllTenantConnections = async (): Promise<void> => {
  const promises = Array.from(tenantConnections.values()).map(connection => 
    connection.$disconnect()
  )
  await Promise.all(promises)
  tenantConnections.clear()
}

/**
 * Execute a function with tenant database context
 * @param tenantId - The tenant ID
 * @param fn - Function to execute with tenant Prisma client
 * @returns Result of the function
 */
export const withTenantDatabase = async <T>(
  tenantId: number,
  fn: (prisma: PrismaClient) => Promise<T>
): Promise<T> => {
  const tenantPrisma = await getTenantPrisma(tenantId)
  try {
    return await fn(tenantPrisma)
  } catch (error) {
    throw error
  }
}

/**
 * Health check for tenant database
 * @param tenantId - The tenant ID
 * @returns Health status
 */
export const checkTenantDatabaseHealth = async (tenantId: number): Promise<boolean> => {
  try {
    const tenantPrisma = await getTenantPrisma(tenantId)
    await tenantPrisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    return false
  }
}
