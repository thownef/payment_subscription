import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import routes from '@/routes'
import multer from 'multer'
import { configurePassport } from '@/config/passport.config'
import rateLimit from 'express-rate-limit'
import passport from 'passport'
import { errorHandler } from '@/middleware/error.middleware'

const app = express()
const upload = multer()

// Security middleware
app.use(helmet())
app.use(cors())
app.use(express.json())

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
})
app.use(limiter)

// Configure Passport
configurePassport(passport)
app.use(passport.initialize())

// Multer middleware
app.use(upload.none())

// URL-encoded middleware
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api', routes)

// Error handler
app.use(errorHandler)

export default app
