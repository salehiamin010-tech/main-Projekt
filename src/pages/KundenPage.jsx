import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { UserCircle, Star, Phone, Mail, MapPin, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

function formatEur(v) {
  return Number(v).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })
}

const STATUS_COLORS = {
  aktiv: 'bg-green-100 text-green-700',
  interessent: 'bg-blue-100 text-blue-700',
  pausiert: 'bg-yellow-100 text-yellow-700',
  inaktiv: 'bg-gray-100 text-gray-500',
}

const PIPELINE_STAGES = ['Erstkontakt', 'Angebot gesendet', 'Verhandlung', 'Gewonnen', 'Verloren']

function StarRating({ value }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star
          key={s}
          size={13}
          className={s <= Math.round(value) ? 'text-gold-400 fill-gold-400' : 'text-gray-200'}
        />
      ))}
      <span className="text-xs text-gray-500 ml-1">{value?.toFixed(1)}</span>
    </div>
  )
}

export default function KundenPage() {
  const { isAdmin } = useAuth()
  const { kunden, rechnungen } = useData()
  const [expanded, setExpanded] = useState(null)

  const getKundeStats = (kundeId) => {
    const kundeRechnungen = rechnungen.filter(r => r.kundeId === kundeId)
    const totalRevenue = kundeRechnungen.reduce((s, r) => s + r.gesamt, 0)
    const bezahlt = kundeRechnungen.filter(r => r.status === 'bezahlt').length
    return { totalRevenue, rechnungenCount: kundeRechnungen.length, bezahlt }
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-navy-900">Kunden</h1>
          <p className="text-sm text-gray-500">{kunden.length} Kunden</p>
        </div>
      </div>

      {/* Revenue summary */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={16} className="text-green-500" />
            <span className="text-xs text-gray-500">Monatsumsatz gesamt</span>
          </div>
          <div className="font-bold text-xl text-navy-900">
            {formatEur(kunden.reduce((s, k) => s + (k.monatsumsatz || 0), 0))}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-1">
            <UserCircle size={16} className="text-blue-500" />
            <span className="text-xs text-gray-500">Aktive Kunden</span>
          </div>
          <div className="font-bold text-xl text-navy-900">
            {kunden.filter(k => k.status === 'aktiv').length}
          </div>
        </div>
      </div>

      {/* Customer cards */}
      <div className="space-y-3">
        {kunden.map(kunde => {
          const stats = getKundeStats(kunde.id)
          const isOpen = expanded === kunde.id
          return (
            <div key={kunde.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-navy-900 flex items-center justify-center text-gold-400 font-bold text-sm flex-shrink-0">
                    {kunde.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-navy-900">{kunde.name}</span>
                      <span className={`badge text-xs ${STATUS_COLORS[kunde.status]}`}>{kunde.status}</span>
                    </div>
                    <div className="text-sm text-gray-600">{kunde.ansprechpartner}</div>
                    <div className="text-xs text-gray-400">{kunde.typ}</div>
                    <div className="mt-1 flex items-center gap-3">
                      <StarRating value={kunde.qualitaetsScore} />
                      <span className="text-xs font-semibold text-gold-600">{formatEur(kunde.monatsumsatz)}/Monat</span>
                    </div>
                  </div>
                  <button onClick={() => setExpanded(isOpen ? null : kunde.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>

              {isOpen && (
                <div className="border-t border-gray-50 p-4 bg-gray-50 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone size={13} className="text-gray-400" />
                      {kunde.telefon}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail size={13} className="text-gray-400" />
                      {kunde.email}
                    </div>
                    <div className="flex items-start gap-2 text-gray-600 sm:col-span-2">
                      <MapPin size={13} className="text-gray-400 mt-0.5 flex-shrink-0" />
                      {kunde.adresse}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-white rounded-xl p-2">
                      <div className="font-bold text-navy-900">{stats.rechnungenCount}</div>
                      <div className="text-xs text-gray-500">Rechnungen</div>
                    </div>
                    <div className="bg-white rounded-xl p-2">
                      <div className="font-bold text-green-600">{stats.bezahlt}</div>
                      <div className="text-xs text-gray-500">Bezahlt</div>
                    </div>
                    <div className="bg-white rounded-xl p-2">
                      <div className="font-bold text-gold-600 text-sm">{formatEur(stats.totalRevenue)}</div>
                      <div className="text-xs text-gray-500">Gesamt</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>Kunde seit:</span>
                    <span className="font-medium">{format(new Date(kunde.startDatum), 'MMMM yyyy', { locale: de })}</span>
                  </div>

                  {kunde.notizen && (
                    <div className="bg-white rounded-xl p-2 text-sm text-gray-600">
                      <span className="text-xs text-gray-400">Notizen: </span>{kunde.notizen}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* CRM Pipeline for prospects */}
      <div className="mt-6">
        <h2 className="font-semibold text-navy-900 mb-3">CRM Pipeline (Interessenten)</h2>
        <div className="overflow-x-auto">
          <div className="flex gap-3 min-w-max pb-2">
            {PIPELINE_STAGES.map((stage, i) => (
              <div key={stage} className="w-40 flex-shrink-0">
                <div className="bg-gray-100 rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-600 mb-2 text-center">
                  {stage}
                </div>
                <div className="space-y-2">
                  {i === 0 && (
                    <div className="bg-white border border-gray-200 rounded-xl p-2.5 text-xs text-gray-500 text-center">
                      + Kontakt hinzufügen
                    </div>
                  )}
                  {i === 3 && kunden.map(k => (
                    <div key={k.id} className="bg-white border border-gold-200 rounded-xl p-2.5">
                      <div className="font-medium text-xs text-navy-900">{k.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{formatEur(k.monatsumsatz)}/M</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
