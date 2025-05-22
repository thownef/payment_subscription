import http from 'http'
import dotenv from 'dotenv'
import app from '@/app.js'
import { PrismaClient } from '@prisma/client'
export const prisma = new PrismaClient()

dotenv.config()

const server = http.createServer(app)
const PORT = process.env.PORT || 3000

prisma.$connect().then(() => {
  console.log(`Connected DB success`)
})

server.listen(PORT, () => {
  console.log(`Server started success`)
})
