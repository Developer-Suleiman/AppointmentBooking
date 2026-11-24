import { useEffect, useState } from 'react'
import AvailabilityManager from '../components/AvailabilityManager'
import TopBar from '../components/TopBar'
import '../styles/home.css'
import '../styles/admin-dashboard.css'

function AdminDashboard() {
  const [appointments, setAppointments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [updateErrorMessage, setUpdateErrorMessage] = useState('')
  const [updatingAppointmentId, setUpdatingAppointmentId] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function loadAppointments() {
      try {
        setIsLoading(true)
        setErrorMessage('')

        const response = await fetch('http://localhost:5000/api/appointments', {
          credentials: 'include',
          signal: controller.signal,
        })

        const responseData = await response.json()

        if (!response.ok) {
          throw new Error(responseData.message || 'Unable to load appointments.')
        }

        const sortedAppointments = [...(responseData.appointments || [])].sort(
          (leftAppointment, rightAppointment) => {
            const leftDate = new Date(leftAppointment.createdAt || 0).getTime()
            const rightDate = new Date(rightAppointment.createdAt || 0).getTime()

            return rightDate - leftDate
          }
        )

        setAppointments(sortedAppointments)
      } catch (error) {
        if (error.name !== 'AbortError') {
          setErrorMessage(error.message || 'Network error. Please try again.')
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadAppointments()

    return () => controller.abort()
  }, [])

  async function handleStatusUpdate(appointmentId, status) {
    setUpdateErrorMessage('')
    setUpdatingAppointmentId(appointmentId)

    try {
      const response = await fetch(
        `http://localhost:5000/api/appointments/${appointmentId}/status`,
        {
          method: 'PATCH',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status }),
        }
      )

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.message || 'Unable to update appointment status.')
      }

      const updatedAppointment = responseData.appointment

      if (status === 'cancelled') {
        const deleteResponse = await fetch(
          `http://localhost:5000/api/appointments/${appointmentId}`,
          {
            method: 'DELETE',
            credentials: 'include',
          }
        )

        if (!deleteResponse.ok) {
          throw new Error('Appointment was cancelled but could not be removed.')
        }

        setAppointments((currentAppointments) =>
          currentAppointments.filter((appointment) => appointment._id !== appointmentId)
        )
        return
      }

      setAppointments((currentAppointments) =>
        currentAppointments.map((appointment) =>
          appointment._id === updatedAppointment._id ? updatedAppointment : appointment
        )
      )
    } catch (error) {
      setUpdateErrorMessage(error.message || 'Network error. Please try again.')
    } finally {
      setUpdatingAppointmentId('')
    }
  }

  async function handleDelete(appointmentId) {
    if (!window.confirm('Delete this appointment permanently?')) return

    setUpdateErrorMessage('')
    setUpdatingAppointmentId(appointmentId)

    try {
      const response = await fetch(`http://localhost:5000/api/appointments/${appointmentId}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.message || 'Unable to delete appointment.')
      }

      setAppointments((currentAppointments) =>
        currentAppointments.filter((appointment) => appointment._id !== appointmentId)
      )
    } catch (error) {
      setUpdateErrorMessage(error.message || 'Network error. Please try again.')
    } finally {
      setUpdatingAppointmentId('')
    }
  }

  async function handleLogout() {
    await fetch('http://localhost:5000/api/auth/logout', { method: 'POST', credentials: 'include' })
    navigate('/admin/login', { replace: true })
  }

  return (
    <main className="home-page admin-page">
      <TopBar />

      <section className="admin-dashboard" aria-labelledby="admin-title">
        <p className="eyebrow">Admin Dashboard</p>
        <h1 id="admin-title">Upcoming bookings</h1>
        <p className="admin-intro">
          Review all submitted appointments in one place. Bookings are shown newest first.
        </p>

        <AvailabilityManager />

        {isLoading ? <p className="admin-state">Loading bookings...</p> : null}

        {!isLoading && errorMessage ? (
          <p className="admin-state admin-state-error" role="alert">
            {errorMessage}
          </p>
        ) : null}

        {!isLoading && !errorMessage && appointments.length === 0 ? (
          <p className="admin-state">No bookings yet.</p>
        ) : null}

        {!isLoading && !errorMessage && appointments.length > 0 ? (
          <>
            {updateErrorMessage ? (
              <p className="admin-state admin-state-error" role="alert">
                {updateErrorMessage}
              </p>
            ) : null}

            <div className="booking-card-grid">
            {appointments.map((appointment) => (
              <article className="booking-card" key={appointment._id}>
                <div className="booking-card-header">
                  <h2>{appointment.fullName}</h2>
                  <span className={`status-badge status-${appointment.status || 'pending'}`}>
                    {appointment.status || 'pending'}
                  </span>
                </div>

                <dl className="booking-details">
                  <div>
                    <dt>Email</dt>
                    <dd>{appointment.email}</dd>
                  </div>
                  <div>
                    <dt>Phone</dt>
                    <dd>{appointment.phone}</dd>
                  </div>
                  <div>
                    <dt>Service</dt>
                    <dd>{appointment.service}</dd>
                  </div>
                  <div>
                    <dt>Date</dt>
                    <dd>{appointment.date}</dd>
                  </div>
                  <div>
                    <dt>Time</dt>
                    <dd>{appointment.time}</dd>
                  </div>
                  <div>
                    <dt>Status</dt>
                    <dd>{appointment.status || 'pending'}</dd>
                  </div>
                </dl>

                {(appointment.status || 'pending') === 'pending' ? (
                  <div className="booking-actions">
                    <button
                      type="button"
                      className="booking-action-button booking-action-confirm"
                      onClick={() => handleStatusUpdate(appointment._id, 'confirmed')}
                      disabled={updatingAppointmentId === appointment._id}
                    >
                      {updatingAppointmentId === appointment._id ? 'Updating...' : 'Confirm'}
                    </button>
                    <button
                      type="button"
                      className="booking-action-button booking-action-cancel"
                      onClick={() => handleStatusUpdate(appointment._id, 'cancelled')}
                      disabled={updatingAppointmentId === appointment._id}
                    >
                      {updatingAppointmentId === appointment._id ? 'Updating...' : 'Cancel'}
                    </button>
                  </div>
                ) : null}

                {appointment.status === 'confirmed' ? (
                  <div className="booking-actions">
                    <button
                      type="button"
                      className="booking-action-button booking-action-cancel"
                      onClick={() => handleStatusUpdate(appointment._id, 'cancelled')}
                      disabled={updatingAppointmentId === appointment._id}
                    >
                      {updatingAppointmentId === appointment._id ? 'Updating...' : 'Cancel appointment'}
                    </button>
                  </div>
                ) : null}

                {(appointment.status === 'cancelled' || new Date(appointment.startAt) <= new Date()) ? (
                  <div className="booking-actions">
                    <button
                      type="button"
                      className="booking-action-button booking-action-cancel"
                      onClick={() => handleDelete(appointment._id)}
                      disabled={updatingAppointmentId === appointment._id}
                    >
                      {updatingAppointmentId === appointment._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                ) : null}
              </article>
            ))}
            </div>
          </>
        ) : null}
      </section>
    </main>
  )
}

export default AdminDashboard