import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import routes from '@/routes'
import multer from 'multer'

const app = express()
const upload = multer()

app.use(helmet())
app.use(upload.none())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())

app.use('/api', routes)

export default app
