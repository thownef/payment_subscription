import { Request, Response, NextFunction } from 'express'

/**
 * Debug middleware to log request details
 * Only works in development mode
 */
export const debugMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('=== Request Debug ===')
    console.log('Method:', req.method)
    console.log('URL:', req.url)
    console.log('Headers:', req.headers)
    console.log('Body:', req.body)
    console.log('Query:', req.query)
    console.log('Params:', req.params)
    console.log('====================')
  }
  next()
}

/**
 * Debug middleware for tenant registration
 */
export const debugTenantRegister = (req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('=== Tenant Register Debug ===')
    console.log('Request body:', JSON.stringify(req.body, null, 2))
    console.log('Environment variables:')
    console.log('- DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET')
    console.log('- TENANT_DATABASE_URL:', process.env.TENANT_DATABASE_URL ? 'SET' : 'NOT SET')
    console.log('- JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET')
    console.log('============================')
  }
  next()
}
