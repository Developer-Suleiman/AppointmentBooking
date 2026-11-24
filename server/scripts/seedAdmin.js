require('dotenv').config({ override: true })
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const User = require('../models/User')

async function seedAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminEmail || !adminPassword) {
    console.error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in the environment.')
    process.exit(1)
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI)

    const existingAdmin = await User.findOne({ email: adminEmail.toLowerCase() })

    if (existingAdmin) {
      existingAdmin.passwordHash = await bcrypt.hash(adminPassword, 12)
      existingAdmin.role = 'admin'
      await existingAdmin.save()
      console.log('Admin account password synchronized.')
      return process.exit(0)
    }

    const passwordHash = await bcrypt.hash(adminPassword, 12)
    await User.create({ email: adminEmail.toLowerCase(), passwordHash, role: 'admin' })

    console.log('Admin user created successfully.')
    return process.exit(0)
  } catch (error) {
    console.error('Failed to seed admin user:', error.message)
    return process.exit(1)
  }
}

seedAdmin()
