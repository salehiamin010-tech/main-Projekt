import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useData, CLEANING_PRICES } from '../context/DataContext'
import { Building2, Plus, X, Edit2, Calendar, MapPin, Ruler } from 'lucide-react'
import { format } from 'date-fns'

const STATUS_CONFIG = {
  belegt: { label: 'Belegt', color: 'bg-blue-100 text-blue-700' },
  frei: { label: 'Frei', color: 'bg-green-100 text-green-700' },
  reinigung_erforderlich: { label: 'Reinigung nötig', color: 'bg-red-100 text-red-700' },
  in_reinigung: { label: 'In Reinigung', color: 'bg-yellow-100 text-yellow-700' },
  gereinigt: { label: 'Gereinigt', color: 'bg-emerald-100 text-emerald-700' },
}

const SIZES = [15, 20, 35, 45, 55, 70, 90]
const STATUSES = Object.keys(STATUS_CONFIG)

const EMPTY_APARTMENT = {
  nummer: '', groesse: 35, gebaeude: 1, standort: 'Bornheim',
  status: 'frei', letzteReinigung: '', letzterTyp: '', naechsteReinigung: '', notizen: ''
}

export default function ApartmentsPage() {
  const { isAdmin } = useAuth()
  const { apartments, auftraege, addApartment, updateApartment } = useData()

  const [filterGebaeude, setFilterGebaeude] = useState('')
  const [filterStandort, setFilterStandort] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterGroesse, setFilterGroesse] = useState('')
  const [detailApt, setDetailApt] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState(EMPTY_APARTMENT)
  const [isEditing, setIsEditing] = useState(false)

  const standorte = [...new Set(apartments.map(a => a.standort))]

  const filtered = apartments.filter(a => {
    if (filterGebaeude && String(a.gebaeude) !== filterGebaeude) return false
    if (filterStandort && a.standort !== filterStandort) return false
    if (filterStatus && a.status !== filterStatus) return false
    if (filterGroesse && String(a.groesse) !== filterGroesse) return false
    return true
  })

  const statusCounts = STATUSES.reduce((acc, s) => {
    acc[s] = apartments.filter(a => a.status === s).length
    return acc
  }, {})

  const getAuftragForApt = (aptId) =>
    auftraege.filter(a => a.apartmentId === aptId).sort((a, b) => b.datum.localeCompare(a.datum))[0]

  const handleSave = () => {
    if (!form.nummer) return
    if (isEditing) {
      updateApartment(form.id, form)
    } else {
      addApartment(form)
    }
    setShowAdd(false)
    setDetailApt(null)
    setForm(EMPTY_APARTMENT)
    setIsEditing(false)
  }

  const openEdit = (apt) => {
    setForm({ ...apt })
    setIsEditing(true)
    setShowAdd(true)
    setDetailApt(null)
  }

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-navy-900">Apartments</h1>
          <p className="text-sm text-gray-500">{apartments.length} Apartments gesamt</p>
        </div>
        {isAdmin && (
          <button onClick={() => { setForm(EMPTY_APARTMENT); setIsEditing(false); setShowAdd(true) }} className="btn-primary">
            <Plus size={16} /> Hinzufügen
          </button>
        )}
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-4">
        {STATUSES.map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(filterStatus === s ? '' : s)}
            className={`p-2 rounded-xl text-center transition-all border ${
              filterStatus === s ? 'border-gold-400 bg-gold-50' : 'bg-white border-gray-100'
            }`}
          >
            <div className="text-lg font-bold text-navy-900">{statusCounts[s]}</div>
            <div className={`text-xs mt-0.5 badge ${STATUS_CONFIG[s].color}`}>{STATUS_CONFIG[s].label}</div>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-3 mb-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <select value={filterGebaeude} onChange={e => setFilterGebaeude(e.target.value)} className="input-field text-sm">
            <option value="">Alle Gebäude</option>
            {[1, 2, 3, 4].map(g => <option key={g} value={g}>Gebäude {g}</option>)}
          </select>
          <select value={filterStandort} onChange={e => setFilterStandort(e.target.value)} className="input-field text-sm">
            <option value="">Alle Standorte</option>
            {standorte.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input-field text-sm">
            <option value="">Alle Status</option>
            {STATUSES.map(s => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
          </select>
          <select value={filterGroesse} onChange={e => setFilterGroesse(e.target.value)} className="input-field text-sm">
            <option value="">Alle Größen</option>
            {SIZES.map(s => <option key={s} value={s}>{s} m²</option>)}
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(apt => {
          const lastAuftrag = getAuftragForApt(apt.id)
          const prices = CLEANING_PRICES[apt.groesse]
          return (
            <div key={apt.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:border-gold-300 transition-all">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-bold text-navy-900 text-lg">{apt.nummer}</div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                    <span className="flex items-center gap-1"><Ruler size={11} />{apt.groesse} m²</span>
                    <span className="flex items-center gap-1"><Building2 size={11} />Geb. {apt.gebaeude}</span>
                    <span className="flex items-center gap-1"><MapPin size={11} />{apt.standort}</span>
                  </div>
                </div>
                <span className={`badge ${STATUS_CONFIG[apt.status].color}`}>{STATUS_CONFIG[apt.status].label}</span>
              </div>

              <div className="space-y-1.5 text-xs text-gray-600 mb-3">
                {apt.letzteReinigung && (
                  <div className="flex items-center gap-1">
                    <Calendar size={11} className="text-gray-400" />
                    Letzte Reinigung: {format(new Date(apt.letzteReinigung), 'dd.MM.yyyy')}
                  </div>
                )}
                {apt.naechsteReinigung && (
                  <div className="flex items-center gap-1 text-gold-600">
                    <Calendar size={11} />
                    Nächste: {format(new Date(apt.naechsteReinigung), 'dd.MM.yyyy')}
                  </div>
                )}
              </div>

              {prices && (
                <div className="flex gap-2 mb-3">
                  <span className="text-xs bg-navy-50 text-navy-700 px-2 py-1 rounded-lg">Grund: {prices.grund}€</span>
                  <span className="text-xs bg-gold-50 text-gold-700 px-2 py-1 rounded-lg">Unterhalt: {prices.unterhalt}€</span>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => setDetailApt(apt)}
                  className="flex-1 text-xs px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium transition-all"
                >
                  Details
                </button>
                {isAdmin && (
                  <button
                    onClick={() => openEdit(apt)}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-gold-50 hover:bg-gold-100 text-gold-700 font-medium transition-all"
                  >
                    <Edit2 size={11} /> Bearbeiten
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Building2 size={40} className="mx-auto mb-2 opacity-30" />
          <p>Keine Apartments gefunden</p>
        </div>
      )}

      {/* Detail Modal */}
      {detailApt && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-bold text-navy-900 text-lg">Apartment {detailApt.nummer}</h2>
              <button onClick={() => setDetailApt(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="text-xs text-gray-500 mb-1">Größe</div>
                  <div className="font-semibold">{detailApt.groesse} m²</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="text-xs text-gray-500 mb-1">Gebäude</div>
                  <div className="font-semibold">Gebäude {detailApt.gebaeude}</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="text-xs text-gray-500 mb-1">Standort</div>
                  <div className="font-semibold">{detailApt.standort}</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="text-xs text-gray-500 mb-1">Status</div>
                  <span className={`badge ${STATUS_CONFIG[detailApt.status].color}`}>{STATUS_CONFIG[detailApt.status].label}</span>
                </div>
              </div>
              {detailApt.notizen && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="text-xs text-gray-500 mb-1">Notizen</div>
                  <div className="text-sm">{detailApt.notizen}</div>
                </div>
              )}
              {isAdmin && (
                <button onClick={() => openEdit(detailApt)} className="btn-primary w-full justify-center">
                  <Edit2 size={16} /> Bearbeiten
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-bold text-navy-900">{isEditing ? 'Apartment bearbeiten' : 'Neues Apartment'}</h2>
              <button onClick={() => { setShowAdd(false); setIsEditing(false) }} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="label">Apartment-Nummer</label>
                <input className="input-field" value={form.nummer} onChange={e => setForm({ ...form, nummer: e.target.value })} placeholder="z.B. A105" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Größe (m²)</label>
                  <select className="input-field" value={form.groesse} onChange={e => setForm({ ...form, groesse: Number(e.target.value) })}>
                    {SIZES.map(s => <option key={s} value={s}>{s} m²</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Gebäude</label>
                  <select className="input-field" value={form.gebaeude} onChange={e => setForm({ ...form, gebaeude: Number(e.target.value) })}>
                    {[1, 2, 3, 4].map(g => <option key={g} value={g}>Gebäude {g}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Standort</label>
                <input className="input-field" value={form.standort} onChange={e => setForm({ ...form, standort: e.target.value })} placeholder="z.B. Bornheim" />
              </div>
              <div>
                <label className="label">Status</label>
                <select className="input-field" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                  {STATUSES.map(s => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Notizen</label>
                <textarea className="input-field" rows={2} value={form.notizen} onChange={e => setForm({ ...form, notizen: e.target.value })} />
              </div>
              <button onClick={handleSave} className="btn-primary w-full justify-center">
                {isEditing ? 'Speichern' : 'Hinzufügen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
