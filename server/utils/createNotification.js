const Notification = require('../models/Notification')

async function createNotification({ userId, appointmentId, type, title, message }) {
  if (!userId) {
    return null
  }

  return Notification.create({ userId, appointmentId, type, title, message })
}

module.exports = createNotification
