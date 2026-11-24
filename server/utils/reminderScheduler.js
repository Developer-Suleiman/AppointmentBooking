const { DateTime } = require('luxon')
const Appointment = require('../models/Appointment')
const { BUSINESS_TIMEZONE } = require('./bookingRules')
const { sendReminderEmail } = require('./emailService')
const createNotification = require('./createNotification')

function reminderDetails(appointment) {
  const start = DateTime.fromJSDate(appointment.startAt, { zone: BUSINESS_TIMEZONE })

  return {
    ...appointment.toObject(),
    date: start.toFormat('yyyy-MM-dd'),
    time: start.toFormat('HH:mm'),
  }
}

async function sendDueReminders() {
  const now = DateTime.now().setZone(BUSINESS_TIMEZONE)
  const windowStart = now.plus({ hours: 23, minutes: 45 }).toJSDate()
  const windowEnd = now.plus({ hours: 24, minutes: 15 }).toJSDate()
  const dueAppointments = await Appointment.find({
    status: 'confirmed',
    reminderSentAt: null,
    startAt: { $gte: windowStart, $lt: windowEnd },
  }).select('_id')

  for (const dueAppointment of dueAppointments) {
    const appointment = await Appointment.findOneAndUpdate(
      { _id: dueAppointment._id, status: 'confirmed', reminderSentAt: null },
      { $set: { reminderSentAt: new Date() } },
      { new: true }
    )

    if (!appointment) {
      continue
    }

    try {
      await sendReminderEmail(reminderDetails(appointment))
      await createNotification({
        userId: appointment.userId,
        appointmentId: appointment._id,
        type: 'reminder',
        title: 'Appointment reminder',
        message: `Your ${appointment.service} appointment is tomorrow at ${reminderDetails(appointment).time}.`,
      })
    } catch (error) {
      console.error(`Reminder email failed for appointment ${appointment._id}:`, error.message)
    }
  }
}

function startReminderScheduler() {
  const intervalMs = 15 * 60 * 1000

  sendDueReminders().catch((error) => {
    console.error('Initial appointment reminder check failed:', error.message)
  })

  return setInterval(() => {
    sendDueReminders().catch((error) => {
      console.error('Appointment reminder check failed:', error.message)
    })
  }, intervalMs)
}

module.exports = { startReminderScheduler, sendDueReminders }
