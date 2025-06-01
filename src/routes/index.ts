import express from 'express'
import authRoute from '@/routes/auth.route'
import uploadRoute from '@/routes/upload.route'

const router = express.Router()

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute
  },
  {
    path: '/uploads',
    route: uploadRoute
  }
]

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route)
})

export default router
