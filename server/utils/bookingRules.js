const { DateTime } = require('luxon')

const BUSINESS_TIMEZONE = 'Europe/Dublin'
const SLOT_MINUTES = 30
const OPENING_HOUR = 9
const CLOSING_HOUR = 18
const VALID_SERVICES = ['Haircut', 'Beard Trim', 'Haircut + Beard']
const SERVICE_DURATIONS = {
  Haircut: 30,
  'Beard Trim': 20,
  'Haircut + Beard': 60,
}

function getBusinessDateTime(dateString, timeString) {
  if (!dateString || !timeString) {
    throw new Error('Appointment date and time are required.')
  }

  const combined = `${dateString}T${timeString}`
  const value = DateTime.fromISO(combined, { zone: BUSINESS_TIMEZONE })

  if (!value.isValid) {
    throw new Error('Invalid appointment date or time selected.')
  }

  return value
}

function validateService(service) {
  if (!VALID_SERVICES.includes(service)) {
    throw new Error('Selected service is not available.')
  }

  return SERVICE_DURATIONS[service]
}

function validateAppointmentRequest(dateString, timeString, service) {
  const start = getBusinessDateTime(dateString, timeString)
  const durationMinutes = validateService(service)
  const now = DateTime.now().setZone(BUSINESS_TIMEZONE)

  if (start < now) {
    throw new Error('Appointments cannot be booked in the past.')
  }

  const weekday = start.weekday
  if (weekday === 1 || weekday === 7) {
    throw new Error('FreshCut Barbers is closed on Mondays and Sundays.')
  }

  if (weekday < 2 || weekday > 6) {
    throw new Error('Bookings are only available Tuesday to Saturday.')
  }

  if (start.minute % SLOT_MINUTES !== 0) {
    throw new Error('Appointments must start on 30-minute intervals.')
  }

  if (start.hour < OPENING_HOUR || start.hour > 17 || (start.hour === 17 && start.minute > 30)) {
    throw new Error('Bookings are only available between 09:00 and 18:00.')
  }

  const closingTime = start.set({ hour: CLOSING_HOUR, minute: 0, second: 0, millisecond: 0 })
  const end = start.plus({ minutes: durationMinutes })

  if (end > closingTime) {
    throw new Error('This appointment would run past the business closing time.')
  }

  return { start, end }
}

function getStatusLabel(status) {
  const labels = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    cancelled: 'Cancelled',
    'no-show': 'No-show',
    completed: 'Completed',
  }

  return labels[status] || status
}

function validateStatusTransition(currentStatus, nextStatus, appointmentStart) {
  const allowedTransitions = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['cancelled', 'completed', 'no-show'],
    cancelled: [],
    'no-show': [],
    completed: [],
  }

  if (!allowedTransitions[currentStatus] || !allowedTransitions[currentStatus].includes(nextStatus)) {
    throw new Error(`Status cannot change from ${getStatusLabel(currentStatus)} to ${getStatusLabel(nextStatus)}.`)
  }

  if (nextStatus === 'no-show') {
    const now = DateTime.now().setZone(BUSINESS_TIMEZONE)
    const noShowCutoff = appointmentStart.plus({ minutes: 15 })

    if (now < noShowCutoff) {
      throw new Error('No-show can only be recorded 15 minutes after the appointment start time.')
    }
  }
}

module.exports = {
  BUSINESS_TIMEZONE,
  VALID_SERVICES,
  SERVICE_DURATIONS,
  SLOT_MINUTES,
  OPENING_HOUR,
  CLOSING_HOUR,
  validateAppointmentRequest,
  getStatusLabel,
  validateStatusTransition,
}
