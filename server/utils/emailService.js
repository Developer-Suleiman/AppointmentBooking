const nodemailer = require('nodemailer')

function getTransporter() {
  const { MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASSWORD } = process.env

  if (!MAIL_HOST || !MAIL_PORT || !MAIL_USER || !MAIL_PASSWORD) {
    throw new Error('Email is not configured. Set MAIL_HOST, MAIL_PORT, MAIL_USER, and MAIL_PASSWORD.')
  }

  return nodemailer.createTransport({
    host: MAIL_HOST,
    port: Number(MAIL_PORT),
    secure: process.env.MAIL_SECURE === 'true',
    auth: {
      user: MAIL_USER,
      pass: MAIL_PASSWORD,
    },
  })
}

function formatAppointment(appointment) {
  return `${appointment.date} at ${appointment.time}`
}

async function sendEmail({ to, subject, text, html }) {
  if (process.env.MAIL_MODE === 'development') {
    console.log(`[DEV EMAIL] To: ${to}\nSubject: ${subject}\n${text}`)
    return { messageId: `development-${Date.now()}` }
  }

  const transporter = getTransporter()

  return transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.MAIL_USER,
    to,
    subject,
    text,
    html,
  })
}

async function sendConfirmationEmail(appointment) {
  const appointmentTime = formatAppointment(appointment)

  return sendEmail({
    to: appointment.email,
    subject: 'Your FreshCut Barbers appointment is confirmed',
    text: `Hi ${appointment.fullName},\n\nYour ${appointment.service} appointment is confirmed for ${appointmentTime}. We look forward to seeing you.`,
    html: `<p>Hi ${appointment.fullName},</p><p>Your <strong>${appointment.service}</strong> appointment is confirmed for <strong>${appointmentTime}</strong>.</p><p>We look forward to seeing you.</p>`,
  })
}

async function sendCancellationEmail(appointment) {
  const appointmentTime = formatAppointment(appointment)

  return sendEmail({
    to: appointment.email,
    subject: 'Your FreshCut Barbers appointment was cancelled',
    text: `Hi ${appointment.fullName},\n\nYour ${appointment.service} appointment for ${appointmentTime} was cancelled. Please contact us if you need help booking another time.`,
    html: `<p>Hi ${appointment.fullName},</p><p>Your <strong>${appointment.service}</strong> appointment for <strong>${appointmentTime}</strong> was cancelled.</p><p>Please contact us if you need help booking another time.</p>`,
  })
}

async function sendReminderEmail(appointment) {
  const appointmentTime = formatAppointment(appointment)

  return sendEmail({
    to: appointment.email,
    subject: 'Reminder: your FreshCut Barbers appointment is tomorrow',
    text: `Hi ${appointment.fullName},\n\nThis is a reminder that your ${appointment.service} appointment is tomorrow at ${appointmentTime}.`,
    html: `<p>Hi ${appointment.fullName},</p><p>This is a reminder that your <strong>${appointment.service}</strong> appointment is tomorrow at <strong>${appointmentTime}</strong>.</p>`,
  })
}

module.exports = {
  sendConfirmationEmail,
  sendCancellationEmail,
  sendReminderEmail,
}
