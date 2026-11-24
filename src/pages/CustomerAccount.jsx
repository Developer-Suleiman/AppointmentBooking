import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import TopBar from '../components/TopBar'
import '../styles/home.css'

function CustomerAccount() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [appointments, setAppointments] = useState([])
  const [user, setUser] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    async function loadAccount() {
      try {
        const [meResponse, notificationResponse, appointmentResponse] = await Promise.all([
          fetch('http://localhost:5000/api/auth/me', { credentials: 'include' }),
          fetch('http://localhost:5000/api/notifications', { credentials: 'include' }),
          fetch('http://localhost:5000/api/appointments/mine', { credentials: 'include' }),
        ])

        if (!meResponse.ok) {
          navigate('/login', { replace: true })
          return
        }

        const meData = await meResponse.json()
        const notificationData = await notificationResponse.json()
        const appointmentData = await appointmentResponse.json()
        setUser(meData.user)
        setNotifications(notificationData.notifications || [])
        setAppointments(appointmentData.appointments || [])
      } catch {
        setErrorMessage('Unable to load your account right now.')
      }
    }

    loadAccount()
  }, [navigate])

  async function markRead(notificationId) {
    await fetch(`http://localhost:5000/api/notifications/${notificationId}/read`, {
      method: 'PATCH',
      credentials: 'include',
    })
    setNotifications((current) => current.map((notification) => notification._id === notificationId ? { ...notification, readAt: new Date().toISOString() } : notification))
  }

  return (
    <main className="home-page">
      <TopBar />
      <section className="booking-page" aria-labelledby="account-title">
        <p className="eyebrow">My Account</p>
        <h1 id="account-title">{user ? `Welcome, ${user.email}.` : 'Your bookings.'}</h1>
        {errorMessage ? <p className="form-message form-message-error">{errorMessage}</p> : null}
        <div className="confirmation"><h2>Notifications</h2>{notifications.length ? notifications.map((notification) => <button className="account-notification" type="button" key={notification._id} onClick={() => markRead(notification._id)}><strong>{notification.title}</strong><span>{notification.message}</span><small>{notification.readAt ? 'Read' : 'New'}</small></button>) : <p className="form-message">No notifications yet.</p>}</div>
        <div className="confirmation"><h2>Your appointments</h2>{appointments.length ? appointments.map((appointment) => <article className="account-appointment" key={appointment._id}><strong>{appointment.service}</strong><span>{appointment.date} at {appointment.time}</span><span>Status: {appointment.status}</span></article>) : <p className="form-message">You have no appointments yet. <Link to="/book">Book one now</Link></p>}</div>
      </section>
    </main>
  )
}

export default CustomerAccount
