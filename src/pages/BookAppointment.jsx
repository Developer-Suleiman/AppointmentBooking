import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import TopBar from '../components/TopBar'
import '../styles/home.css'

const formControlStyle = {
  backgroundColor: '#fff',
  color: '#1f2937',
  borderColor: '#94a3b8',
  colorScheme: 'light',
}

function BookAppointment() {
  const location = useLocation()
  const [formValues, setFormValues] = useState({
    fullName: '',
    email: '',
    phone: '',
    service: location.state?.service || '',
    slotId: '',
  })
  const [availableSlots, setAvailableSlots] = useState([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [confirmation, setConfirmation] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [account, setAccount] = useState(null)

  useEffect(() => {
    async function loadAccount() {
      try {
        const response = await fetch('http://localhost:5000/api/auth/me', { credentials: 'include' })
        if (!response.ok) return

        const data = await response.json()
        setAccount(data.user)
        setFormValues((currentValues) => ({
          ...currentValues,
          fullName: data.user?.fullName || currentValues.fullName,
          email: data.user?.email || currentValues.email,
        }))
      } catch {
        setAccount(null)
      }
    }

    loadAccount()
  }, [])

  useEffect(() => {
    if (!formValues.service) {
      return
    }

    async function loadAvailableSlots() {
      setIsLoadingSlots(true)
      try {
        const response = await fetch(`http://localhost:5000/api/availability?service=${encodeURIComponent(formValues.service)}`)
        const data = await response.json()
        if (!response.ok) throw new Error(data.message || 'Unable to load available times.')
        setAvailableSlots(data.slots || [])
      } catch (error) {
        setAvailableSlots([])
        setErrorMessage(error.message || 'Unable to load available times.')
      } finally {
        setIsLoadingSlots(false)
      }
    }

    loadAvailableSlots()
    const refreshTimer = window.setInterval(loadAvailableSlots, 15000)

    return () => window.clearInterval(refreshTimer)
  }, [formValues.service])

  function handleChange(event) {
    const { name, value } = event.target

    if (name === 'service') {
      setAvailableSlots([])
    }

    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: value,
      ...(name === 'service' ? { slotId: '' } : {}),
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const hasEmptyField = Object.values(formValues).some((value) => value.trim() === '')

    if (hasEmptyField) {
      setErrorMessage('Please complete all fields before submitting your booking.')
      setConfirmation(null)
      return
    }

    setErrorMessage('')
    setConfirmation(null)
    setIsSubmitting(true)

    try {
      const response = await fetch('http://localhost:5000/api/appointments', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formValues),
      })

      const responseData = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please sign in to your customer account before booking.')
        }
        throw new Error(responseData.message || 'Unable to book appointment right now.')
      }

      const savedAppointment = {
        ...(responseData.appointment || formValues),
        fullName: formValues.fullName,
      }

      setAvailableSlots((currentSlots) =>
        currentSlots.filter((slot) => slot._id !== formValues.slotId)
      )
      setConfirmation(savedAppointment)
      setFormValues({
        fullName: account?.fullName || '',
        email: account?.email || '',
        phone: '',
        service: '',
        slotId: '',
      })
    } catch (error) {
      setErrorMessage(error.message || 'Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="home-page">
      <TopBar />

      <section className="booking-page" aria-labelledby="booking-title">
        <p className="eyebrow">Book Now</p>
        <h1 id="booking-title">Choose a service to begin your booking.</h1>

        {account ? (
          <p className="form-message booking-as">
            Booking as <strong>{account.fullName || account.email}</strong> ({account.email})
          </p>
        ) : null}

        <form className="booking-form" onSubmit={handleSubmit} noValidate>
          <div className="form-grid">
            {!account ? (
              <label className="field">
                <span>Full name</span>
                <input
                  style={formControlStyle}
                  type="text"
                  name="fullName"
                  value={formValues.fullName}
                  onChange={handleChange}
                  autoComplete="name"
                />
              </label>
            ) : null}

            {!account ? (
              <label className="field">
                <span>Email address</span>
                <input
                  style={formControlStyle}
                  type="email"
                  name="email"
                  value={formValues.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </label>
            ) : null}

            <label className="field">
              <span>Phone number</span>
              <input
                style={formControlStyle}
                type="tel"
                name="phone"
                value={formValues.phone}
                onChange={handleChange}
                autoComplete="tel"
              />
            </label>

            <label className="field">
              <span>Service</span>
              <select
                style={formControlStyle}
                name="service"
                value={formValues.service}
                onChange={handleChange}
              >
                <option value="">Select a service</option>
                <option value="Haircut">Haircut</option>
                <option value="Beard Trim">Beard Trim</option>
                <option value="Haircut + Beard">Haircut + Beard</option>
              </select>
            </label>

            <label className="field">
              <span>Available appointment time</span>
              <select
                style={formControlStyle}
                name="slotId"
                value={formValues.slotId}
                onChange={handleChange}
                disabled={!formValues.service || isLoadingSlots}
              >
                <option value="">{isLoadingSlots ? 'Loading times...' : 'Choose an available time'}</option>
                {availableSlots.map((slot) => (
                  <option key={slot._id} value={slot._id}>
                    {slot.date} at {slot.time}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <button className="booking-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Booking appointment...' : 'Confirm Booking'}
          </button>

          {errorMessage ? (
            <p className="form-message form-message-error" role="alert">
              {errorMessage}
            </p>
          ) : null}

          {confirmation ? (
            <div className="confirmation" role="status" aria-live="polite">
              <h2>Your appointment is ready</h2>
              <p>
                Thanks, {confirmation.fullName}. Your {confirmation.service} booking is submitted
                and waiting for barber approval. Status updates will appear in your account.
              </p>
            </div>
          ) : null}
        </form>
      </section>
    </main>
  )
}

export default BookAppointment