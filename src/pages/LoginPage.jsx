import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, Heart } from 'lucide-react'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    await new Promise(r => setTimeout(r, 400))
    const result = login(username, password)
    if (result.success) {
      navigate('/')
    } else {
      setError(result.error)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-navy-900 flex flex-col items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gold-400/5 rounded-full" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-gold-400/5 rounded-full" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo + Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gold-400 rounded-2xl mb-4 shadow-lg shadow-gold-400/30">
            <span className="font-bold text-navy-900 text-2xl">MC</span>
          </div>
          <h1 className="text-3xl font-bold text-gold-400 mb-1">Mainexo Clean</h1>
          <p className="text-white/50 text-sm">Premium Reinigung aus der Pflege</p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl">
          <h2 className="text-white font-semibold text-lg mb-5">Anmelden</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Benutzername</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="admin / mitarbeiter / kunde"
                className="w-full px-3 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Passwort</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-all pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg px-3 py-2 text-red-300 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold-400 hover:bg-gold-500 text-navy-900 font-bold py-3 rounded-xl text-sm transition-all disabled:opacity-60 mt-2"
            >
              {loading ? 'Wird angemeldet...' : 'Anmelden'}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-white/30 text-xs text-center">Demo: admin / admin123</p>
          </div>
        </div>

        {/* Badge */}
        <div className="mt-6 flex items-center justify-center gap-2 text-white/30 text-xs">
          <Heart size={12} className="text-gold-400/50" />
          <span>Geleitet von einem Gesundheits- und Krankenpfleger</span>
        </div>
      </div>
    </div>
  )
}
