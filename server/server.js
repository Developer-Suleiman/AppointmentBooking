const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
require('dotenv').config({ override: true })
const appointmentsRouter = require('./routes/appointments')
const authRouter = require('./routes/auth')
const notificationsRouter = require('./routes/notifications')
const availabilityRouter = require('./routes/availability')
const { startReminderScheduler } = require('./utils/reminderScheduler')

const app = express()
const port = process.env.PORT || 5000
const { MONGODB_URI, FRONTEND_URL } = process.env

const allowedOrigins = [FRONTEND_URL || 'http://localhost:5173', 'http://127.0.0.1:5173']

app.set('trust proxy', 1)
app.use(helmet())
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
        return
      }

      callback(new Error('Not allowed by CORS'))
    },
    credentials: true,
  })
)
app.use(express.json())
app.use(cookieParser())

app.get('/api/health', (_req, res) => {
  res.json({ message: 'Appointment Booking API is running' })
})

app.use('/api/auth', authRouter)
app.use('/api/appointments', appointmentsRouter)
app.use('/api/notifications', notificationsRouter)
app.use('/api/availability', availabilityRouter)

async function startServer() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('MongoDB connected successfully')
    startReminderScheduler()

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`)
    })
  } catch (error) {
    console.error('MongoDB connection failed:', error.message)
    process.exit(1)
  }
}

startServer()