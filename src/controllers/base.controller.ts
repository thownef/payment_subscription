import { Request, Response, NextFunction } from 'express'
import { getTenantPrisma } from '@/services/tenantDatabase.service'
import { PrismaClient } from '@prisma/client'

/**
 * Base controller class that provides tenant-aware database access
 * All tenant-specific controllers should extend this class
 */
export abstract class BaseController {
  protected getTenantPrisma(req: Request): Promise<PrismaClient> {
    if (!req.tenantId) {
      throw new Error('Tenant context is required')
    }
    return getTenantPrisma(req.tenantId)
  }

  /**
   * Wrapper method to execute tenant-specific operations
   * @param req - Express request object
   * @param operation - Function to execute with tenant Prisma client
   * @returns Result of the operation
   */
  protected async withTenantDatabase<T>(
    req: Request,
    operation: (prisma: PrismaClient) => Promise<T>
  ): Promise<T> {
    const tenantPrisma = await this.getTenantPrisma(req)
    return operation(tenantPrisma)
  }

  /**
   * Validate that user belongs to the tenant
   * @param req - Express request object
   * @param userId - User ID to validate
   * @returns Promise<boolean>
   */
  protected async validateUserBelongsToTenant(req: Request, userId: number): Promise<boolean> {
    try {
      const tenantPrisma = await this.getTenantPrisma(req)
      const user = await tenantPrisma.user.findUnique({
        where: { id: userId }
      })
      return !!user
    } catch (error) {
      return false
    }
  }
}
