const mongoose = require('mongoose')
const { VALID_SERVICES } = require('../utils/bookingRules')

const availabilitySchema = new mongoose.Schema(
  {
    service: {
      type: String,
      required: true,
      enum: VALID_SERVICES,
    },
    startAt: {
      type: Date,
      required: true,
      index: true,
    },
    endAt: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
)

availabilitySchema.index({ service: 1, startAt: 1 }, { unique: true })

module.exports = mongoose.model('Availability', availabilitySchema)
