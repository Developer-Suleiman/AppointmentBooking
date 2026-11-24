const mongoose = require('mongoose')
const { VALID_SERVICES, SERVICE_DURATIONS } = require('../utils/bookingRules')

const appointmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    availabilityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Availability',
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address.'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [/^[+()\-\d\s]{7,20}$/, 'Please enter a valid phone number.'],
    },
    service: {
      type: String,
      required: [true, 'Service is required'],
      trim: true,
      enum: {
        values: VALID_SERVICES,
        message: 'Selected service is not available.',
      },
    },
    startAt: {
      type: Date,
      required: [true, 'Appointment start date and time are required.'],
      index: true,
    },
    endAt: {
      type: Date,
      required: [true, 'Appointment end date and time are required.'],
      index: true,
    },
    durationMinutes: {
      type: Number,
      required: true,
      min: [20, 'Service duration is invalid.'],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'no-show', 'completed'],
      default: 'pending',
    },
    confirmationSentAt: {
      type: Date,
    },
    cancellationSentAt: {
      type: Date,
    },
    reminderSentAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
)

appointmentSchema.index(
  { startAt: 1, service: 1 },
  { unique: false }
)

appointmentSchema.index(
  { availabilityId: 1 },
  {
    name: 'active_availability_unique',
    unique: true,
    partialFilterExpression: {
      availabilityId: { $exists: true },
      status: { $in: ['pending', 'confirmed'] },
    },
  }
)

appointmentSchema.pre('validate', function validateDuration() {
  if (this.service && !SERVICE_DURATIONS[this.service]) {
    this.invalidate('service', 'Selected service is not available.')
  }

  if (this.service && !this.durationMinutes) {
    this.durationMinutes = SERVICE_DURATIONS[this.service]
  }

  if (this.durationMinutes && this.service && this.durationMinutes !== SERVICE_DURATIONS[this.service]) {
    this.invalidate('durationMinutes', 'Duration does not match the selected service.')
  }

})

const Appointment = mongoose.model('Appointment', appointmentSchema)

module.exports = Appointment