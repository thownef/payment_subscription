import express from 'express'
import authRoute from '@/routes/auth.route'
import uploadRoute from '@/routes/upload.route'
import templateRoute from '@/routes/template.route'
import tenantRoute from '@/routes/tenant.route'

const router = express.Router()

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute
  },
  {
    path: '/uploads',
    route: uploadRoute
  },
  {
    path: '/templates',
    route: templateRoute
  },
  {
    path: '/tenants',
    route: tenantRoute
  }
]

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route)
})

export default router
