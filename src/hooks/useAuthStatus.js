import { useEffect, useState } from 'react'

// Shared "who is signed in" check so every nav renders the same real auth state.
export function useAuthStatus() {
  const [authState, setAuthState] = useState({ status: 'loading', role: null })

  useEffect(() => {
    let isMounted = true

    async function loadAuth() {
      try {
        const response = await fetch('http://localhost:5000/api/auth/me', {
          credentials: 'include',
        })

        if (!isMounted) return

        if (!response.ok) {
          setAuthState({ status: 'guest', role: null })
          return
        }

        const data = await response.json()
        setAuthState({ status: 'authenticated', role: data.user?.role || 'customer' })
      } catch {
        if (isMounted) setAuthState({ status: 'guest', role: null })
      }
    }

    loadAuth()

    return () => {
      isMounted = false
    }
  }, [])

  async function logout() {
    await fetch('http://localhost:5000/api/auth/logout', { method: 'POST', credentials: 'include' })
    setAuthState({ status: 'guest', role: null })
  }

  return { authState, logout }
}
