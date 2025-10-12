import { User } from '@prisma/client'
import { Tenant } from '@prisma/client-master'

declare global {
  namespace Express {
    interface Request {
      user?: User
      tenant?: Tenant
      tenantId?: number
    }
  }
}

export {}
