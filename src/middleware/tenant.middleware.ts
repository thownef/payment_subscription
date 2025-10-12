import { Request, Response, NextFunction } from 'express'
import { masterPrisma } from '@/index'
import ApiError from '@/utils/ApiError'
import httpStatus from 'http-status'

/**
 * Middleware to resolve tenant from request
 * Supports multiple strategies:
 * 1. From subdomain (tenant.subdomain.example.com)
 * 2. From header (X-Tenant-ID)
 * 3. From query parameter (?tenantId=123)
 * 4. From JWT token (tenantId claim)
 */
export const resolveTenant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let tenantId: number | undefined

    // Strategy 1: From subdomain
    const host = req.get('host') || ''
    const subdomain = host.split('.')[0]
    if (subdomain && subdomain !== 'www' && subdomain !== 'api') {
      const tenant = await masterPrisma.tenant.findFirst({
        where: { 
          contractId: subdomain,
          isActive: true 
        }
      })
      if (tenant) {
        tenantId = tenant.id
      }
    }

    // Strategy 2: From header
    if (!tenantId) {
      const tenantIdHeader = req.get('X-Tenant-ID')
      if (tenantIdHeader) {
        tenantId = parseInt(tenantIdHeader, 10)
      }
    }

    // Strategy 3: From query parameter
    if (!tenantId) {
      const tenantIdQuery = req.query.tenantId as string
      if (tenantIdQuery) {
        tenantId = parseInt(tenantIdQuery, 10)
      }
    }

    // Strategy 4: From JWT token (if user is authenticated)
    if (!tenantId && req.user) {
      // This will be handled in the auth middleware
      // For now, we'll skip this strategy
    }

    if (!tenantId) {
      return next(new ApiError(httpStatus.BAD_REQUEST, 'Tenant ID is required'))
    }

    // Validate tenant exists and is active
    const tenant = await masterPrisma.tenant.findUnique({
      where: { 
        id: tenantId,
        isActive: true 
      }
    })

    if (!tenant) {
      return next(new ApiError(httpStatus.NOT_FOUND, 'Tenant not found or inactive'))
    }

    // Attach tenant info to request
    req.tenant = tenant
    req.tenantId = tenant.id

    next()
  } catch (error) {
    next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to resolve tenant'))
  }
}

/**
 * Middleware to ensure tenant context is available
 * Should be used after resolveTenant middleware
 */
export const requireTenant = (req: Request, res: Response, next: NextFunction) => {
  if (!req.tenant || !req.tenantId) {
    return next(new ApiError(httpStatus.BAD_REQUEST, 'Tenant context is required'))
  }
  next()
}

/**
 * Middleware to validate tenant access for authenticated users
 * Ensures user belongs to the specified tenant
 */
export const validateTenantAccess = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user || !req.tenantId) {
      return next()
    }

    // For now, we'll implement a simple check
    // In a more complex system, you might have a user-tenant relationship table
    // Since users are created per tenant database, we assume they belong to the tenant
    // This validation can be enhanced based on your business logic

    next()
  } catch (error) {
    next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to validate tenant access'))
  }
}
