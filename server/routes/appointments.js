const express = require('express')
const { DateTime } = require('luxon')
const Appointment = require('../models/Appointment')
const Availability = require('../models/Availability')
const requireAdmin = require('../middleware/requireAdmin')
const requireAuth = require('../middleware/requireAuth')
const createNotification = require('../utils/createNotification')
const {
  sendCancellationEmail,
  sendConfirmationEmail,
} = require('../utils/emailService')
const {
  BUSINESS_TIMEZONE,
  VALID_SERVICES,
  SERVICE_DURATIONS,
  validateStatusTransition,
} = require('../utils/bookingRules')

const router = express.Router()
const allowedStatuses = new Set(['pending', 'confirmed', 'cancelled', 'no-show', 'completed'])

function serializeAppointment(appointment, includePrivate = false) {
  const appointmentObject = appointment.toObject ? appointment.toObject() : appointment
  const safeAppointment = { ...appointmentObject }

  if (!includePrivate) {
    delete safeAppointment.fullName
    delete safeAppointment.email
    delete safeAppointment.phone
  }

  const startAtDate = appointmentObject.startAt
    ? DateTime.fromJSDate(new Date(appointmentObject.startAt), { zone: BUSINESS_TIMEZONE })
    : null
  const hasValidStart = startAtDate?.isValid === true

  return {
    ...safeAppointment,
    date: hasValidStart ? startAtDate.toFormat('yyyy-MM-dd') : appointmentObject.date || '',
    time: hasValidStart ? startAtDate.toFormat('HH:mm') : appointmentObject.time || '',
    startAt: appointmentObject.startAt,
    endAt: appointmentObject.endAt,
  }
}

router.post('/', requireAuth, async (req, res) => {
  const { fullName, email, phone, service, slotId } = req.body

  if (!fullName || !email || !phone || !service || !slotId) {
    return res.status(400).json({
      message: 'All appointment fields are required.',
    })
  }

  if (typeof fullName !== 'string' || !fullName.trim()) {
    return res.status(400).json({ message: 'Full name is required.' })
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
    return res.status(400).json({ message: 'Please enter a valid email address.' })
  }

  if (!/^[+()\-\d\s]{7,20}$/.test(String(phone).trim())) {
    return res.status(400).json({ message: 'Please enter a valid phone number.' })
  }

  if (!VALID_SERVICES.includes(service)) {
    return res.status(400).json({ message: 'Selected service is not available.' })
  }

  try {
    const slot = await Availability.findOne({
      _id: slotId,
      service,
      isActive: true,
      startAt: { $gt: new Date() },
    })

    if (!slot) {
      return res.status(400).json({ message: 'That time is no longer available. Please choose another slot.' })
    }

    const start = DateTime.fromJSDate(slot.startAt, { zone: BUSINESS_TIMEZONE })
    const end = DateTime.fromJSDate(slot.endAt, { zone: BUSINESS_TIMEZONE })

    const overlappingAppointment = await Appointment.findOne({
      startAt: { $lt: end.toJSDate() },
      endAt: { $gt: start.toJSDate() },
      status: { $ne: 'cancelled' },
    })

    if (overlappingAppointment) {
      return res.status(400).json({
        message: 'This time slot is already booked. Please choose another appointment time.',
      })
    }

    const appointment = await Appointment.create({
      userId: req.user.role === 'customer' ? req.user.userId : undefined,
      availabilityId: slot._id,
      fullName: fullName.trim(),
      email: String(email).trim().toLowerCase(),
      phone: String(phone).trim(),
      service,
      startAt: slot.startAt,
      endAt: slot.endAt,
      durationMinutes: SERVICE_DURATIONS[service],
      status: 'pending',
    })

    await createNotification({
      userId: appointment.userId,
      appointmentId: appointment._id,
      type: 'booking_submitted',
      title: 'Booking submitted',
      message: `Your ${service} appointment for ${start.toFormat('yyyy-MM-dd')} at ${start.toFormat('HH:mm')} was submitted and is waiting for barber approval.`,
    })

    return res.status(201).json({
      message: 'Your appointment was booked successfully.',
      appointment: serializeAppointment(appointment),
    })
  } catch (error) {
    const message = error && error.message ? error.message : 'Unable to create appointment.'

    if (error && error.code === 11000) {
      return res.status(400).json({
        message: 'That appointment time was just booked by another customer. Please choose another slot.',
      })
    }

    return res.status(400).json({
      message,
    })
  }
})

router.get('/mine', requireAuth, async (req, res) => {
  try {
    const appointments = await Appointment.find({ userId: req.user.userId }).sort({ startAt: -1 })

    return res.json({
      appointments: appointments.map((appointment) => serializeAppointment(appointment, true)),
    })
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load your appointments.' })
  }
})

router.get('/', requireAdmin, async (_req, res) => {
  try {
    const appointments = await Appointment.find().sort({ startAt: -1 })

    return res.status(200).json({
      appointments: appointments.map((appointment) => serializeAppointment(appointment, true)),
    })
  } catch (error) {
    return res.status(500).json({
      message: 'Unable to fetch appointments.',
      error: error.message,
    })
  }
})

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found.' })
    }

    const isPast = appointment.startAt <= new Date()
    const isCancelled = appointment.status === 'cancelled'

    if (!isPast && !isCancelled) {
      return res.status(400).json({
        message: 'Only cancelled or past appointments can be deleted.',
      })
    }

    await appointment.deleteOne()

    return res.json({ message: 'Appointment deleted successfully.' })
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid appointment ID.' })
    }

    return res.status(500).json({ message: 'Unable to delete appointment.' })
  }
})

router.patch('/:id/status', requireAdmin, async (req, res) => {
  const { id } = req.params
  const { status } = req.body

  if (!status || !allowedStatuses.has(status)) {
    return res.status(400).json({
      message: 'Status must be one of: pending, confirmed, cancelled, no-show, completed.',
    })
  }

  try {
    const appointment = await Appointment.findById(id)

    if (!appointment) {
      return res.status(404).json({
        message: 'Appointment not found.',
      })
    }

    if (
      status === 'confirmed' &&
      appointment.status !== 'pending'
    ) {
      return res.status(400).json({
        message: 'Only a pending appointment can be confirmed.',
      })
    }

    validateStatusTransition(appointment.status || 'pending', status, appointment.startAt)

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      appointment._id,
      { $set: { status } },
      { new: true, runValidators: false }
    )

    if (!updatedAppointment) {
      return res.status(404).json({ message: 'Appointment no longer exists.' })
    }

    await createNotification({
      userId: updatedAppointment.userId,
      appointmentId: updatedAppointment._id,
      type: status,
      title: status === 'confirmed' ? 'Appointment confirmed' : 'Appointment cancelled',
      message:
        status === 'confirmed'
          ? `Your ${updatedAppointment.service} appointment is confirmed.`
          : `We are sorry, but your ${updatedAppointment.service} appointment has been cancelled. Please choose another available time.`,
    })

    let notificationWarning = ''
    if (status === 'confirmed' && !updatedAppointment.confirmationSentAt) {
      try {
        await sendConfirmationEmail(serializeAppointment(updatedAppointment, true))
        await Appointment.updateOne(
          { _id: updatedAppointment._id },
          { $set: { confirmationSentAt: new Date() } }
        )
      } catch {
        notificationWarning = ' Appointment updated, but the confirmation email could not be sent.'
      }
    }

    if (status === 'cancelled' && !updatedAppointment.cancellationSentAt) {
      try {
        await sendCancellationEmail(serializeAppointment(updatedAppointment, true))
        await Appointment.updateOne(
          { _id: updatedAppointment._id },
          { $set: { cancellationSentAt: new Date() } }
        )
      } catch {
        notificationWarning = ' Appointment updated, but the cancellation email could not be sent.'
      }
    }

    return res.status(200).json({
      message: `Appointment status updated successfully.${notificationWarning}`,
      appointment: serializeAppointment(updatedAppointment, true),
    })
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid appointment ID.',
      })
    }

    return res.status(400).json({
      message: error.message || 'Unable to update appointment status.',
    })
  }
})

module.exports = router