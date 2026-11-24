import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import TopBar from '../components/TopBar'
import '../styles/home.css'

function CustomerAuth({ mode = 'login' }) {
  const navigate = useNavigate()
  const location = useLocation()
  const isSignup = mode === 'signup'
  const [values, setValues] = useState({ fullName: '', email: '', phone: '', password: '' })
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      const response = await fetch(`http://localhost:5000/api/auth/${isSignup ? 'signup' : 'login'}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to sign in.')
      }

      navigate(location.state?.from || '/account')
    } catch (error) {
      setErrorMessage(error.message || 'Unable to sign in.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="home-page">
      <TopBar />
      <section className="booking-page" aria-labelledby="customer-auth-title">
        <p className="eyebrow">Customer Account</p>
        <h1 id="customer-auth-title">{isSignup ? 'Create your account.' : 'Welcome back.'}</h1>
        <form className="booking-form admin-login-form" onSubmit={handleSubmit}>
          {isSignup ? (
            <label className="field"><span>Full name</span><input required value={values.fullName} onChange={(event) => setValues({ ...values, fullName: event.target.value })} /></label>
          ) : null}
          <label className="field"><span>Email address</span><input required type="email" value={values.email} onChange={(event) => setValues({ ...values, email: event.target.value })} autoComplete="email" /></label>
          {isSignup ? (
            <label className="field"><span>Phone number</span><input type="tel" value={values.phone} onChange={(event) => setValues({ ...values, phone: event.target.value })} /></label>
          ) : null}
          <label className="field"><span>Password</span><input required type="password" minLength="8" value={values.password} onChange={(event) => setValues({ ...values, password: event.target.value })} autoComplete={isSignup ? 'new-password' : 'current-password'} /></label>
          <button className="booking-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Please wait...' : isSignup ? 'Create account' : 'Sign in'}</button>
          {errorMessage ? <p className="form-message form-message-error" role="alert">{errorMessage}</p> : null}
        </form>
        <p className="form-message">
          {isSignup ? 'Already have an account? ' : 'Need an account? '}
          <Link to={isSignup ? '/login' : '/signup'}>{isSignup ? 'Sign in' : 'Sign up'}</Link>
        </p>
      </section>
    </main>
  )
}

export default CustomerAuth
