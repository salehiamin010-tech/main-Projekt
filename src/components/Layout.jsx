import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, CalendarCheck, Building2, CheckSquare, FileText,
  Users, UserCircle, BookOpen, BarChart3, LogOut, Menu, X, ChevronRight
} from 'lucide-react'

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true, roles: ['admin', 'mitarbeiter', 'kunde'] },
  { path: '/auftraege', label: 'Aufträge', icon: CalendarCheck, roles: ['admin', 'mitarbeiter'] },
  { path: '/apartments', label: 'Apartments', icon: Building2, roles: ['admin', 'mitarbeiter'] },
  { path: '/quality-check', label: 'Quality-Check', icon: CheckSquare, roles: ['admin', 'mitarbeiter'] },
  { path: '/rechnungen', label: 'Rechnungen', icon: FileText, roles: ['admin', 'kunde'] },
  { path: '/mitarbeiter', label: 'Mitarbeiter', icon: Users, roles: ['admin'] },
  { path: '/kunden', label: 'Kunden', icon: UserCircle, roles: ['admin'] },
  { path: '/sop', label: 'SOP', icon: BookOpen, roles: ['admin', 'mitarbeiter'] },
  { path: '/statistiken', label: 'Statistiken', icon: BarChart3, roles: ['admin'] },
]

const BOTTOM_NAV = [
  { path: '/', label: 'Home', icon: LayoutDashboard, exact: true },
  { path: '/auftraege', label: 'Aufträge', icon: CalendarCheck },
  { path: '/quality-check', label: 'Quality', icon: CheckSquare },
  { path: '/rechnungen', label: 'Rechnung', icon: FileText },
]

function MCLogo({ size = 'md' }) {
  const s = size === 'sm' ? 'w-8 h-8 text-sm' : 'w-10 h-10 text-base'
  return (
    <div className={`${s} bg-gold-400 rounded-xl flex items-center justify-center font-bold text-navy-900 flex-shrink-0`}>
      MC
    </div>
  )
}

export default function Layout() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const visibleNav = NAV_ITEMS.filter(item => item.roles.includes(user?.role))

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-navy-900 text-white flex-shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
          <MCLogo />
          <div>
            <div className="font-bold text-gold-400 leading-tight">Mainexo Clean</div>
            <div className="text-xs text-white/50">Premium Reinigung</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 overflow-y-auto">
          {visibleNav.map(item => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gold-400 text-navy-900'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <Icon size={18} />
                {item.label}
              </NavLink>
            )
          })}
        </nav>

        {/* User */}
        <div className="border-t border-white/10 p-3">
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-gold-400/20 flex items-center justify-center text-gold-400 text-xs font-bold flex-shrink-0">
              {user?.name?.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">{user?.name}</div>
              <div className="text-xs text-white/50 capitalize">{user?.role}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg text-sm transition-all"
          >
            <LogOut size={16} />
            Abmelden
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header (Mobile + Desktop) */}
        <header className="bg-navy-900 text-white px-4 py-3 flex items-center justify-between flex-shrink-0 md:bg-white md:text-navy-900 md:border-b md:border-gray-200 md:shadow-sm">
          <div className="flex items-center gap-3">
            <div className="md:hidden">
              <MCLogo size="sm" />
            </div>
            <div className="md:hidden">
              <div className="font-bold text-gold-400 text-sm leading-tight">Mainexo Clean</div>
            </div>
            <div className="hidden md:block text-sm text-gray-500">
              Willkommen, <span className="font-semibold text-navy-900">{user?.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gold-400/20 flex items-center justify-center text-gold-500 text-xs font-bold">
                {user?.name?.slice(0, 2).toUpperCase()}
              </div>
            </div>
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
            >
              <Menu size={20} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="flex items-center justify-around px-2 py-1">
          {BOTTOM_NAV.filter(item => {
            const full = NAV_ITEMS.find(n => n.path === item.path)
            return full?.roles.includes(user?.role)
          }).map(item => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl text-xs transition-all ${
                    isActive ? 'text-gold-500' : 'text-gray-400'
                  }`
                }
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl text-xs text-gray-400"
          >
            <Menu size={20} />
            <span>Menü</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-navy-900 text-white flex flex-col">
            <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <MCLogo size="sm" />
                <div className="font-bold text-gold-400 text-sm">Mainexo Clean</div>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="text-white/60 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 py-4 px-3 overflow-y-auto">
              {visibleNav.map(item => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.exact}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-3 rounded-xl mb-1 text-sm font-medium transition-all ${
                        isActive ? 'bg-gold-400 text-navy-900' : 'text-white/70 hover:bg-white/10 hover:text-white'
                      }`
                    }
                  >
                    <Icon size={18} />
                    {item.label}
                    <ChevronRight size={14} className="ml-auto opacity-40" />
                  </NavLink>
                )
              })}
            </nav>
            <div className="border-t border-white/10 p-3">
              <div className="flex items-center gap-3 px-2 py-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-gold-400/20 flex items-center justify-center text-gold-400 text-xs font-bold">
                  {user?.name?.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-medium">{user?.name}</div>
                  <div className="text-xs text-white/50 capitalize">{user?.role}</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-3 py-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg text-sm transition-all"
              >
                <LogOut size={16} />
                Abmelden
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
