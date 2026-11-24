import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import '../styles/home.css'

function VerifyAppointment() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [message, setMessage] = useState('Verifying your appointment...')
  const [isError, setIsError] = useState(false)
  const [isResending, setIsResending] = useState(false)

  useEffect(() => {
    if (!token) {
      return
    }

    async function verifyAppointment() {
      try {
        const response = await fetch(
          `http://localhost:5000/api/appointments/verify?token=${encodeURIComponent(token)}`
        )
        const responseData = await response.json()

        if (!response.ok) {
          throw new Error(responseData.message || 'Unable to verify appointment.')
        }

        setMessage(responseData.message)
      } catch (error) {
        setMessage(error.message || 'Unable to verify appointment.')
        setIsError(true)
      }
    }

    verifyAppointment()
  }, [token])

  async function handleResendVerification() {
    setIsResending(true)

    try {
      const response = await fetch('http://localhost:5000/api/appointments/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.message || 'Unable to resend verification email.')
      }

      setMessage(responseData.message)
    } catch (error) {
      setMessage(error.message || 'Unable to resend verification email.')
    } finally {
      setIsResending(false)
    }
  }

  const displayedMessage = token ? message : 'This verification link is missing its token.'
  const displayedError = !token || isError

  return (
    <main className="home-page">
      <header className="topbar">
        <Link className="brand" to="/" aria-label="FreshCut Barbers home">
          FreshCut Barbers
        </Link>
        <nav className="nav" aria-label="Primary">
          <Link to="/">Home</Link>
          <Link to="/services">Services</Link>
          <Link to="/book">Book Now</Link>
        </nav>
      </header>

      <section className="booking-page" aria-labelledby="verification-title">
        <p className="eyebrow">Appointment Verification</p>
        <h1 id="verification-title">{displayedError ? 'Verification unsuccessful' : 'Appointment verified'}</h1>
        <p className="form-message">{displayedMessage}</p>
        {token && isError ? (
          <button className="booking-submit" type="button" onClick={handleResendVerification} disabled={isResending}>
            {isResending ? 'Sending...' : 'Resend verification email'}
          </button>
        ) : null}
        <Link className="booking-submit inline-link" to="/">
          Return home
        </Link>
      </section>
    </main>
  )
}

export default VerifyAppointment
