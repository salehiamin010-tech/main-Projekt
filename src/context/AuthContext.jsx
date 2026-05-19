import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

const DEMO_USERS = {
  admin: { password: 'admin123', role: 'admin', name: 'Amin Salehi', username: 'admin' },
  mitarbeiter: { password: 'ma123', role: 'mitarbeiter', name: 'Maria Müller', username: 'mitarbeiter' },
  kunde: { password: 'kunde123', role: 'kunde', name: 'Monica Flauto', username: 'kunde' },
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('mc_user')
    return stored ? JSON.parse(stored) : null
  })

  const login = (username, password) => {
    const found = DEMO_USERS[username]
    if (found && found.password === password) {
      const u = { username, role: found.role, name: found.name }
      setUser(u)
      localStorage.setItem('mc_user', JSON.stringify(u))
      return { success: true }
    }
    return { success: false, error: 'Ungültige Anmeldedaten' }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('mc_user')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin: user?.role === 'admin', isMitarbeiter: user?.role === 'mitarbeiter', isKunde: user?.role === 'kunde' }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
