import { useState } from 'react'
import { isAuthenticated, login, logout } from '../services/authService'

export function useAuth() {
  const [authenticated, setAuthenticated] = useState(isAuthenticated)

  return {
    authenticated,
    login: (username: string, password: string) => {
      const valid = login(username, password)
      setAuthenticated(valid)
      return valid
    },
    logout: () => {
      logout()
      setAuthenticated(false)
    },
  }
}
