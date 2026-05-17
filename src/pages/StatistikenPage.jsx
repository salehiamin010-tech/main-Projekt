import React from 'react'
import { useData } from '../context/DataContext'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { TrendingUp, TrendingDown, Euro, BarChart3, Users, Star } from 'lucide-react'
import { format, subMonths, isThisMonth, isSameMonth, startOfMonth } from 'date-fns'
import { de } from 'date-fns/locale'

function formatEur(v) {
  return Number(v).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })
}

const COLORS = ['#001F3F', '#D4AF37', '#16A34A', '#DC2626', '#7C3AED', '#0EA5E9']

export default function StatistikenPage() {
  const { auftraege, mitarbeiter, kunden, rechnungen } = useData()

  // Last 6 months revenue
  const revenueData = Array.from({ length: 6 }, (_, i) => {
    const d = subMonths(new Date(), 5 - i)
    const monthStart = startOfMonth(d)
    const rev = auftraege
      .filter(a => {
        const ad = new Date(a.datum)
        return isSameMonth(ad, d) && a.status === 'erledigt'
      })
      .reduce((s, a) => s + (a.preis || 0), 0)
    const count = auftraege.filter(a => {
      const ad = new Date(a.datum)
      return isSameMonth(ad, d) && a.status === 'erledigt'
    }).length
    return {
      monat: format(d, 'MMM', { locale: de }),
      umsatz: rev,
      reinigungen: count
    }
  })

  // This month vs last month
  const thisMonth = revenueData[revenueData.length - 1]
  const lastMonth = revenueData[revenueData.length - 2]
  const revenueGrowth = lastMonth?.umsatz > 0
    ? ((thisMonth?.umsatz - lastMonth?.umsatz) / lastMonth?.umsatz * 100).toFixed(1)
    : 0

  // Total stats
  const totalRevenue = auftraege.filter(a => a.status === 'erledigt').reduce((s, a) => s + (a.preis || 0), 0)
  const totalCleanings = auftraege.filter(a => a.status === 'erledigt').length
  const avgPrice = totalCleanings > 0 ? totalRevenue / totalCleanings : 0
  const ytdRevenue = auftraege
    .filter(a => a.status === 'erledigt' && new Date(a.datum).getFullYear() === new Date().getFullYear())
    .reduce((s, a) => s + (a.preis || 0), 0)

  // Customer distribution
  const kundenPieData = kunden.map(k => ({
    name: k.name,
    value: rechnungen.filter(r => r.kundeId === k.id).reduce((s, r) => s + r.gesamt, 0)
  })).filter(d => d.value > 0)

  // Employee performance
  const mitarbeiterData = mitarbeiter.map(ma => {
    const maAuftraege = auftraege.filter(a => a.mitarbeiterId === ma.id && a.status === 'erledigt')
    const avgQ = maAuftraege.length > 0
      ? maAuftraege.reduce((s, a) => s + (a.qualitaet || 0), 0) / maAuftraege.length
      : 0
    return {
      name: ma.name.split(' ')[0],
      reinigungen: maAuftraege.length,
      qualitaet: Number(avgQ.toFixed(1)),
    }
  })

  const kpiCards = [
    {
      label: 'Monatsumsatz',
      value: formatEur(thisMonth?.umsatz || 0),
      growth: Number(revenueGrowth),
      icon: Euro,
      color: 'text-green-600'
    },
    {
      label: 'Jahresumsatz',
      value: formatEur(ytdRevenue),
      growth: null,
      icon: TrendingUp,
      color: 'text-blue-600'
    },
    {
      label: 'Reinigungen gesamt',
      value: totalCleanings,
      growth: null,
      icon: BarChart3,
      color: 'text-navy-600'
    },
    {
      label: 'Ø Preis',
      value: formatEur(avgPrice),
      growth: null,
      icon: Star,
      color: 'text-gold-600'
    },
  ]

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-navy-900">Statistiken</h1>
        <p className="text-sm text-gray-500">Übersicht und Kennzahlen</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {kpiCards.map(card => {
          const Icon = card.icon
          return (
            <div key={card.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className={`inline-flex p-2 rounded-xl bg-gray-50 mb-2 ${card.color}`}>
                <Icon size={18} />
              </div>
              <div className="text-lg font-bold text-navy-900">{card.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{card.label}</div>
              {card.growth !== null && (
                <div className={`flex items-center gap-1 text-xs mt-1 font-medium ${card.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {card.growth >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {card.growth >= 0 ? '+' : ''}{card.growth}% ggü. Vormonat
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Revenue Area Chart */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
        <h2 className="font-semibold text-navy-900 mb-4">Umsatz letzte 6 Monate</h2>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={revenueData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="umsatzGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="monat" tick={{ fontSize: 11, fill: '#6B7A8C' }} />
            <YAxis tick={{ fontSize: 11, fill: '#6B7A8C' }} />
            <Tooltip
              formatter={(v) => [formatEur(v), 'Umsatz']}
              contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
            />
            <Area type="monotone" dataKey="umsatz" stroke="#D4AF37" strokeWidth={2} fill="url(#umsatzGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Two charts side by side */}
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        {/* Cleanings bar chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <h2 className="font-semibold text-navy-900 mb-4">Reinigungen pro Monat</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={revenueData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="monat" tick={{ fontSize: 11, fill: '#6B7A8C' }} />
              <YAxis tick={{ fontSize: 11, fill: '#6B7A8C' }} />
              <Tooltip
                formatter={(v) => [v, 'Reinigungen']}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
              />
              <Bar dataKey="reinigungen" fill="#001F3F" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Customer pie */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <h2 className="font-semibold text-navy-900 mb-4">Umsatz nach Kunden</h2>
          {kundenPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={kundenPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {kundenPieData.map((entry, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatEur(v)} contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-44 flex items-center justify-center text-gray-300 text-sm">Keine Daten</div>
          )}
        </div>
      </div>

      {/* Employee performance */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <h2 className="font-semibold text-navy-900 mb-4">Mitarbeiter Performance</h2>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={mitarbeiterData} margin={{ top: 0, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6B7A8C' }} />
            <YAxis tick={{ fontSize: 11, fill: '#6B7A8C' }} />
            <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
            <Legend iconSize={10} wrapperStyle={{ fontSize: '11px' }} />
            <Bar dataKey="reinigungen" name="Reinigungen" fill="#001F3F" radius={[4, 4, 0, 0]} />
            <Bar dataKey="qualitaet" name="Ø Qualität" fill="#D4AF37" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
