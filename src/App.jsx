import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AdminDashboard from './pages/AdminDashboard'
import AdminLogin from './pages/AdminLogin'
import BookAppointment from './pages/BookAppointment'
import Home from './pages/Home'
import Services from './pages/Services'
import CustomerAccount from './pages/CustomerAccount'
import CustomerAuth from './pages/CustomerAuth'

function ProtectedAdminRoute() {
  const [isChecking, setIsChecking] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    async function verifyAuth() {
      try {
        const response = await fetch('http://localhost:5000/api/auth/me', {
          credentials: 'include',
        })

        if (!response.ok) {
          setIsAuthenticated(false)
          return
        }

        const data = await response.json()
        setIsAuthenticated(data.user?.role === 'admin')
      } catch {
        setIsAuthenticated(false)
      } finally {
        setIsChecking(false)
      }
    }

    verifyAuth()
  }, [])

  if (isChecking) {
    return <div className="home-page"><p className="admin-state">Checking admin access...</p></div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  return <AdminDashboard />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/book" element={<BookAppointment />} />
        <Route path="/admin" element={<ProtectedAdminRoute />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/login" element={<CustomerAuth />} />
        <Route path="/signup" element={<CustomerAuth mode="signup" />} />
        <Route path="/account" element={<CustomerAccount />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
