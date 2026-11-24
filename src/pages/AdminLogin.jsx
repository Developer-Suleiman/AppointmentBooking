import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import TopBar from '../components/TopBar'
import '../styles/home.css'
import '../styles/admin-dashboard.css'

function AdminLogin() {
  const navigate = useNavigate()
  const [formValues, setFormValues] = useState({
    email: '',
    password: '',
  })
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()

    if (!formValues.email || !formValues.password) {
      setErrorMessage('Email and password are required.')
      return
    }

    setErrorMessage('')
    setIsSubmitting(true)

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formValues, portal: 'admin' }),
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.message || 'Unable to log in.')
      }

      setIsAuthenticated(true)
      navigate('/admin')
    } catch (error) {
      setErrorMessage(error.message || 'Login failed.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />
  }

  return (
    <main className="home-page admin-page">
      <TopBar />

      <section className="admin-dashboard" aria-labelledby="admin-login-title">
        <p className="eyebrow">Admin Login</p>
        <h1 id="admin-login-title">Sign in to manage bookings</h1>

        <form className="booking-form admin-login-form" onSubmit={handleSubmit} noValidate>
          <label className="field">
            <span>Email address</span>
            <input
              type="email"
              name="email"
              value={formValues.email}
              onChange={(event) => setFormValues({ ...formValues, email: event.target.value })}
              autoComplete="email"
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              type="password"
              name="password"
              value={formValues.password}
              onChange={(event) => setFormValues({ ...formValues, password: event.target.value })}
              autoComplete="current-password"
            />
          </label>

          <button className="booking-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Log in'}
          </button>

          {errorMessage ? (
            <p className="form-message form-message-error" role="alert">
              {errorMessage}
            </p>
          ) : null}
        </form>
      </section>
    </main>
  )
}

export default AdminLogin
