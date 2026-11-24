const express = require('express')
const { DateTime } = require('luxon')
const Availability = require('../models/Availability')
const Appointment = require('../models/Appointment')
const requireAdmin = require('../middleware/requireAdmin')
const {
  BUSINESS_TIMEZONE,
  SERVICE_DURATIONS,
  validateAppointmentRequest,
} = require('../utils/bookingRules')

const router = express.Router()

function serializeSlot(slot) {
  const start = DateTime.fromJSDate(slot.startAt, { zone: BUSINESS_TIMEZONE })
  return {
    _id: slot._id,
    service: slot.service,
    date: start.toFormat('yyyy-MM-dd'),
    time: start.toFormat('HH:mm'),
    startAt: slot.startAt,
    endAt: slot.endAt,
  }
}

async function getOpenSlots(service) {
  const query = { isActive: true }
  if (service) query.service = service

  const slots = await Availability.find(query).sort({ startAt: 1 })
  const now = new Date()
  const openSlots = []

  for (const slot of slots) {
    if (slot.startAt <= now) continue

    const booking = await Appointment.findOne({
      startAt: { $lt: slot.endAt },
      endAt: { $gt: slot.startAt },
      status: { $ne: 'cancelled' },
    })

    if (!booking) openSlots.push(serializeSlot(slot))
  }

  return openSlots
}

router.get('/', async (req, res) => {
  try {
    return res.json({ slots: await getOpenSlots(req.query.service) })
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load available times.' })
  }
})

router.get('/admin', requireAdmin, async (_req, res) => {
  try {
    const slots = await Availability.find().sort({ startAt: 1 })
    return res.json({ slots: slots.map(serializeSlot) })
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load availability.' })
  }
})

router.post('/', requireAdmin, async (req, res) => {
  const { date, time, service } = req.body

  if (!date || !time || !service || !SERVICE_DURATIONS[service]) {
    return res.status(400).json({ message: 'Date, time, and a valid service are required.' })
  }

  try {
    const { start, end } = validateAppointmentRequest(date, time, service)
    const slot = await Availability.create({
      service,
      startAt: start.toJSDate(),
      endAt: end.toJSDate(),
    })

    return res.status(201).json({ slot: serializeSlot(slot) })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'That availability slot already exists.' })
    }
    return res.status(400).json({ message: error.message || 'Unable to create availability.' })
  }
})

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const slot = await Availability.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    )

    if (!slot) return res.status(404).json({ message: 'Availability slot not found.' })
    return res.json({ message: 'Availability slot removed.' })
  } catch (error) {
    return res.status(400).json({ message: 'Unable to remove availability slot.' })
  }
})

module.exports = router
