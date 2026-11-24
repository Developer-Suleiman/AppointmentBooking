import { useEffect, useState } from 'react'

const services = ['Haircut', 'Beard Trim', 'Haircut + Beard']

function AvailabilityManager() {
  const [slots, setSlots] = useState([])
  const [values, setValues] = useState({ service: 'Haircut', date: '', time: '' })
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    async function loadInitialSlots() {
      try {
        const response = await fetch('http://localhost:5000/api/availability/admin', { credentials: 'include' })
        const data = await response.json()
        if (!response.ok) throw new Error(data.message || 'Unable to load availability.')
        setSlots(data.slots || [])
      } catch {
        setSlots([])
      }
    }

    loadInitialSlots()
  }, [])

  async function addSlot(event) {
    event.preventDefault()
    setIsSubmitting(true)
    setMessage('')

    try {
      const response = await fetch('http://localhost:5000/api/availability', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Unable to add slot.')
      setSlots((current) => [...current, data.slot].sort((left, right) => left.startAt.localeCompare(right.startAt)))
      setValues({ ...values, date: '', time: '' })
      setMessage('Available time added.')
    } catch (error) {
      setMessage(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function removeSlot(slotId) {
    const response = await fetch(`http://localhost:5000/api/availability/${slotId}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    const data = await response.json()
    if (!response.ok) {
      setMessage(data.message || 'Unable to remove slot.')
      return
    }
    setSlots((current) => current.filter((slot) => slot._id !== slotId))
  }

  return (
    <div className="confirmation">
      <h2>Available appointment times</h2>
      <p className="form-message">Publish the times customers are allowed to choose.</p>
      <form className="form-grid" onSubmit={addSlot}>
        <label className="field"><span>Service</span><select value={values.service} onChange={(event) => setValues({ ...values, service: event.target.value })}>{services.map((service) => <option key={service}>{service}</option>)}</select></label>
        <label className="field"><span>Date</span><input type="date" required value={values.date} onChange={(event) => setValues({ ...values, date: event.target.value })} /></label>
        <label className="field"><span>Time</span><input type="time" required value={values.time} onChange={(event) => setValues({ ...values, time: event.target.value })} /></label>
        <button className="booking-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Adding...' : 'Publish time'}</button>
      </form>
      {message ? <p className="form-message" role="status">{message}</p> : null}
      <div className="availability-list">
        {slots.map((slot) => <div className="account-appointment" key={slot._id}><strong>{slot.service}</strong><span>{slot.date} at {slot.time}</span><button className="booking-action-button booking-action-cancel" type="button" onClick={() => removeSlot(slot._id)}>Remove</button></div>)}
        {!slots.length ? <p className="form-message">No published times yet.</p> : null}
      </div>
    </div>
  )
}

export default AvailabilityManager
