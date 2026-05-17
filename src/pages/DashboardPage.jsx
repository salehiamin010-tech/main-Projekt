import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import {
  CalendarCheck, TrendingUp, CheckCircle, Users, Plus, Star,
  ClipboardCheck, FileText, Building2, Heart, ArrowRight, Clock
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format, isToday, isThisMonth, subDays } from 'date-fns'
import { de } from 'date-fns/locale'

const STATUS_COLORS = {
  geplant: 'bg-blue-100 text-blue-700',
  in_bearbeitung: 'bg-yellow-100 text-yellow-700',
  erledigt: 'bg-green-100 text-green-700',
}
const STATUS_LABELS = {
  geplant: 'Geplant',
  in_bearbeitung: 'In Bearbeitung',
  erledigt: 'Erledigt',
}
const TYP_LABELS = {
  grundreinigung: 'Grundreinigung',
  unterhaltsreinigung: 'Unterhaltsreinigung',
  treppenhaus: 'Treppenhaus',
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Guten Morgen'
  if (h < 17) return 'Guten Tag'
  return 'Guten Abend'
}

function formatEur(v) {
  return v.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })
}

export default function DashboardPage() {
  const { user, isAdmin } = useAuth()
  const { auftraege, apartments, mitarbeiter } = useData()
  const navigate = useNavigate()

  const today = new Date().toISOString().slice(0, 10)
  const todayAuftraege = auftraege.filter(a => a.datum === today)
  const monthAuftraege = auftraege.filter(a => isThisMonth(new Date(a.datum)))
  const monthRevenue = monthAuftraege.filter(a => a.status === 'erledigt').reduce((s, a) => s + (a.preis || 0), 0)
  const activeMitarbeiter = mitarbeiter.filter(m => m.aktiv).length
  const nextFive = auftraege.filter(a => a.datum >= today && a.status !== 'erledigt')
    .sort((a, b) => a.datum.localeCompare(b.datum) || a.uhrzeit.localeCompare(b.uhrzeit))
    .slice(0, 5)
  const lastFive = auftraege.filter(a => a.status === 'erledigt')
    .sort((a, b) => b.datum.localeCompare(a.datum)).slice(0, 5)

  // Revenue chart - last 7 days
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i)
    const dateStr = d.toISOString().slice(0, 10)
    const rev = auftraege
      .filter(a => a.datum === dateStr && a.status === 'erledigt')
      .reduce((s, a) => s + (a.preis || 0), 0)
    return { tag: format(d, 'EEE', { locale: de }), umsatz: rev }
  })

  const getApartment = (id) => apartments.find(a => a.id === id)

  const kpiCards = [
    { label: 'Heute geplant', value: todayAuftraege.length, icon: CalendarCheck, color: 'bg-blue-50 text-blue-600' },
    { label: 'Umsatz diesen Monat', value: formatEur(monthRevenue), icon: TrendingUp, color: 'bg-green-50 text-green-600' },
    { label: 'Reinigungen Monat', value: monthAuftraege.filter(a => a.status === 'erledigt').length, icon: CheckCircle, color: 'bg-gold-50 text-gold-600' },
    { label: 'Aktive Mitarbeiter', value: activeMitarbeiter, icon: Users, color: 'bg-purple-50 text-purple-600' },
  ]

  const quickActions = [
    { label: 'Neue Reinigung', icon: Plus, action: () => navigate('/auftraege'), color: 'bg-navy-900 text-white' },
    { label: 'Quality-Check', icon: ClipboardCheck, action: () => navigate('/quality-check'), color: 'bg-gold-400 text-navy-900' },
    { label: 'Rechnung erstellen', icon: FileText, action: () => navigate('/rechnungen'), color: 'bg-white text-navy-900 border border-gray-200' },
    { label: 'Apartment hinzufügen', icon: Building2, action: () => navigate('/apartments'), color: 'bg-white text-navy-900 border border-gray-200' },
  ]

  return (
    <div className="p-4 max-w-5xl mx-auto">
      {/* Welcome */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-navy-900">{getGreeting()}, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-sm text-gray-500 mt-0.5">{format(new Date(), 'EEEE, dd. MMMM yyyy', { locale: de })}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {kpiCards.map(card => {
          const Icon = card.icon
          return (
            <div key={card.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className={`inline-flex p-2 rounded-xl mb-2 ${card.color}`}>
                <Icon size={18} />
              </div>
              <div className="text-xl font-bold text-navy-900">{card.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{card.label}</div>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="mb-5">
        <h2 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">Schnellzugriff</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {quickActions.map(action => {
            const Icon = action.icon
            return (
              <button
                key={action.label}
                onClick={action.action}
                className={`flex items-center gap-2 px-3 py-3 rounded-xl text-sm font-medium transition-all hover:opacity-90 ${action.color}`}
              >
                <Icon size={16} />
                {action.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        {/* Today's planned */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-navy-900">Heute geplante Reinigungen</h2>
            <button onClick={() => navigate('/auftraege')} className="text-gold-500 text-xs flex items-center gap-1">
              Alle <ArrowRight size={12} />
            </button>
          </div>
          {nextFive.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Keine Aufträge heute</p>
          ) : (
            <div className="space-y-2">
              {nextFive.map(auftrag => {
                const apt = getApartment(auftrag.apartmentId)
                return (
                  <div key={auftrag.id} className="flex items-center gap-3 p-2 rounded-xl bg-gray-50">
                    <div className="flex items-center gap-1 text-xs text-gray-500 w-12 flex-shrink-0">
                      <Clock size={11} />
                      {auftrag.uhrzeit}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-navy-900 truncate">{apt?.nummer || auftrag.apartmentId}</div>
                      <div className="text-xs text-gray-500">{TYP_LABELS[auftrag.typ]} · {apt?.groesse}m²</div>
                    </div>
                    <span className={`badge ${STATUS_COLORS[auftrag.status]}`}>{STATUS_LABELS[auftrag.status]}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Last completed */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-navy-900">Zuletzt abgeschlossen</h2>
            <button onClick={() => navigate('/auftraege')} className="text-gold-500 text-xs flex items-center gap-1">
              Alle <ArrowRight size={12} />
            </button>
          </div>
          {lastFive.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Noch keine erledigten Aufträge</p>
          ) : (
            <div className="space-y-2">
              {lastFive.map(auftrag => {
                const apt = getApartment(auftrag.apartmentId)
                return (
                  <div key={auftrag.id} className="flex items-center gap-3 p-2 rounded-xl bg-gray-50">
                    <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-navy-900 truncate">{apt?.nummer || auftrag.apartmentId}</div>
                      <div className="text-xs text-gray-500">{format(new Date(auftrag.datum), 'dd.MM.yyyy')} · {TYP_LABELS[auftrag.typ]}</div>
                    </div>
                    <div className="text-sm font-semibold text-gold-600">{auftrag.preis}€</div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Revenue Chart (admin only) */}
      {isAdmin && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
          <h2 className="font-semibold text-navy-900 mb-4">Umsatz letzte 7 Tage</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="tag" tick={{ fontSize: 11, fill: '#6B7A8C' }} />
              <YAxis tick={{ fontSize: 11, fill: '#6B7A8C' }} />
              <Tooltip
                formatter={(v) => [formatEur(v), 'Umsatz']}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
              />
              <Bar dataKey="umsatz" fill="#D4AF37" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Pending tasks */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
        <h2 className="font-semibold text-navy-900 mb-3">Anstehende Aufgaben</h2>
        <div className="space-y-2">
          {auftraege.filter(a => a.status === 'in_bearbeitung').length > 0 && (
            <div className="flex items-center gap-3 p-2 rounded-xl bg-yellow-50 border border-yellow-100">
              <div className="w-2 h-2 rounded-full bg-yellow-400 flex-shrink-0" />
              <span className="text-sm text-yellow-800">
                {auftraege.filter(a => a.status === 'in_bearbeitung').length} Reinigung(en) noch in Bearbeitung
              </span>
            </div>
          )}
          {apartments.filter(a => a.status === 'reinigung_erforderlich').length > 0 && (
            <div className="flex items-center gap-3 p-2 rounded-xl bg-red-50 border border-red-100">
              <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
              <span className="text-sm text-red-800">
                {apartments.filter(a => a.status === 'reinigung_erforderlich').length} Apartments benötigen Reinigung
              </span>
            </div>
          )}
          <div className="flex items-center gap-3 p-2 rounded-xl bg-blue-50 border border-blue-100">
            <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
            <span className="text-sm text-blue-800">
              {auftraege.filter(a => a.status === 'geplant' && a.datum >= today).length} Aufträge geplant
            </span>
          </div>
        </div>
      </div>

      {/* Medical badge */}
      <div className="bg-navy-900 rounded-2xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gold-400/20 flex items-center justify-center flex-shrink-0">
          <Heart size={20} className="text-gold-400" />
        </div>
        <div>
          <div className="text-gold-400 font-semibold text-sm">Pflegequalität in der Reinigung</div>
          <div className="text-white/50 text-xs mt-0.5">Geleitet von einem Gesundheits- und Krankenpfleger – Hygiene auf medizinischem Niveau</div>
        </div>
      </div>
    </div>
  )
}
