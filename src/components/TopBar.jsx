import { Link, useNavigate } from 'react-router-dom'
import { useAuthStatus } from '../hooks/useAuthStatus'

// Shared nav that reflects the real signed-in state instead of showing every link always.
function TopBar() {
  const navigate = useNavigate()
  const { authState, logout } = useAuthStatus()

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  const isAdmin = authState.status === 'authenticated' && authState.role === 'admin'
  const isCustomer = authState.status === 'authenticated' && authState.role !== 'admin'

  return (
    <header className="topbar">
      <Link className="brand" to="/" aria-label="FreshCut Barbers home">
        FreshCut Barbers
      </Link>

      <nav className="nav" aria-label="Primary">
        <Link to="/">Home</Link>
        <Link to="/services">Services</Link>
        <Link to="/book">Book Now</Link>

        {isCustomer ? <Link to="/account">My Account</Link> : null}
        {isAdmin ? <Link to="/admin">Admin Dashboard</Link> : null}

        {authState.status === 'guest' ? (
          <>
            <Link to="/login">Sign In</Link>
            <Link to="/admin/login">Admin</Link>
          </>
        ) : null}

        {authState.status === 'authenticated' ? (
          <button type="button" className="nav-signout" onClick={handleLogout}>
            Sign Out
          </button>
        ) : null}
      </nav>
    </header>
  )
}

export default TopBar
