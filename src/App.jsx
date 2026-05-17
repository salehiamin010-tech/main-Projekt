import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import AuftraegePage from './pages/AuftraegePage'
import ApartmentsPage from './pages/ApartmentsPage'
import QualityCheckPage from './pages/QualityCheckPage'
import RechnungenPage from './pages/RechnungenPage'
import MitarbeiterPage from './pages/MitarbeiterPage'
import KundenPage from './pages/KundenPage'
import SOPPage from './pages/SOPPage'
import StatistikenPage from './pages/StatistikenPage'

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="auftraege" element={<AuftraegePage />} />
        <Route path="apartments" element={<ApartmentsPage />} />
        <Route path="quality-check" element={<QualityCheckPage />} />
        <Route path="rechnungen" element={<RechnungenPage />} />
        <Route path="mitarbeiter" element={<MitarbeiterPage />} />
        <Route path="kunden" element={<KundenPage />} />
        <Route path="sop" element={<SOPPage />} />
        <Route path="statistiken" element={<StatistikenPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
