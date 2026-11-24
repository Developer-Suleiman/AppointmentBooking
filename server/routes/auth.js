const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const rateLimit = require('express-rate-limit')
const User = require('../models/User')
const requireAdmin = require('../middleware/requireAdmin')
const requireAuth = require('../middleware/requireAuth')

const router = express.Router()

// Throttle brute-force attempts against login/signup regardless of outcome.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please try again later.' },
})

function setAuthCookie(res, user) {
  const token = jwt.sign(
    { userId: user._id.toString(), email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  )

  res.cookie('token', token, {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 8 * 60 * 60 * 1000,
  })
}

router.post('/signup', authLimiter, async (req, res) => {
  const { fullName, email, phone, password } = req.body

  if (!fullName || !email || !password) {
    return res.status(400).json({ message: 'Full name, email, and password are required.' })
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
    return res.status(400).json({ message: 'Please enter a valid email address.' })
  }

  if (String(password).length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters.' })
  }

  try {
    const normalizedEmail = String(email).trim().toLowerCase()
    const existingUser = await User.findOne({ email: normalizedEmail })

    if (existingUser) {
      return res.status(409).json({ message: 'An account already exists for this email.' })
    }

    const user = await User.create({
      fullName: String(fullName).trim(),
      email: normalizedEmail,
      phone: phone ? String(phone).trim() : undefined,
      passwordHash: await bcrypt.hash(password, 12),
      role: 'customer',
    })

    setAuthCookie(res, user)
    return res.status(201).json({
      message: 'Account created successfully.',
      user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role },
    })
  } catch (error) {
    return res.status(500).json({ message: 'Unable to create account.', error: error.message })
  }
})

router.post('/login', authLimiter, async (req, res) => {
  const { email, password, portal } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' })
  }

  try {
    const user = await User.findOne({ email: String(email).trim().toLowerCase() })

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }

    // The admin portal must never authenticate a non-admin account.
    if (portal === 'admin' && user.role !== 'admin') {
      return res.status(403).json({ message: 'This account does not have admin access.' })
    }

    setAuthCookie(res, user)

    return res.status(200).json({
      message: user.role === 'admin' ? 'Admin login successful.' : 'Signed in successfully.',
      user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role },
    })
  } catch (error) {
    return res.status(500).json({ message: 'Unable to log in.', error: error.message })
  }
})

router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)

    if (!user) {
      return res.status(401).json({ message: 'Your session is invalid or expired.' })
    }

    return res.status(200).json({
      user: { fullName: user.fullName, email: user.email, phone: user.phone, role: user.role },
    })
  } catch {
    return res.status(500).json({ message: 'Unable to load account details.' })
  }
})

router.post('/logout', (_req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    secure: process.env.NODE_ENV === 'production',
  })

  return res.status(200).json({ message: 'Logged out successfully.' })
})

module.exports = router
