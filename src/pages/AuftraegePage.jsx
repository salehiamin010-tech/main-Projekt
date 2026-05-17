import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useData, CLEANING_PRICES } from '../context/DataContext'
import { Plus, X, Play, CheckCircle, Info, Camera, Clock } from 'lucide-react'
import { format, isToday, isThisWeek } from 'date-fns'

const STATUS_CONFIG = {
  geplant: { label: 'Geplant', color: 'bg-blue-100 text-blue-700' },
  in_bearbeitung: { label: 'In Bearbeitung', color: 'bg-yellow-100 text-yellow-700' },
  erledigt: { label: 'Erledigt', color: 'bg-green-100 text-green-700' },
}

const TYP_LABELS = {
  grundreinigung: 'Grundreinigung',
  unterhaltsreinigung: 'Unterhaltsreinigung',
  treppenhaus: 'Treppenhaus',
}

const EMPTY_AUFTRAG = {
  apartmentId: '', typ: 'unterhaltsreinigung', mitarbeiterId: '',
  datum: new Date().toISOString().slice(0, 10), uhrzeit: '09:00',
  status: 'geplant', preis: 0, dauer: 0, qualitaet: 0, notizen: ''
}

export default function AuftraegePage() {
  const { isAdmin } = useAuth()
  const { auftraege, apartments, mitarbeiter, addAuftrag, updateAuftrag } = useData()
  const [tab, setTab] = useState('heute')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState(EMPTY_AUFTRAG)
  const [detailId, setDetailId] = useState(null)

  const today = new Date().toISOString().slice(0, 10)

  const filtered = auftraege.filter(a => {
    const d = new Date(a.datum)
    if (tab === 'heute') return a.datum === today
    if (tab === 'woche') return isThisWeek(d, { weekStartsOn: 1 })
    return true
  }).sort((a, b) => b.datum.localeCompare(a.datum) || a.uhrzeit.localeCompare(b.uhrzeit))

  const getApartment = id => apartments.find(a => a.id === id)
  const getMitarbeiter = id => mitarbeiter.find(m => m.id === id)

  const calcPrice = (aptId, typ) => {
    const apt = apartments.find(a => a.id === aptId)
    if (!apt) return 0
    const prices = CLEANING_PRICES[apt.groesse]
    if (!prices) return 0
    if (typ === 'grundreinigung') return prices.grund
    if (typ === 'unterhaltsreinigung') return prices.unterhalt
    return 89
  }

  const handleFormChange = (field, value) => {
    const updated = { ...form, [field]: value }
    if (field === 'apartmentId' || field === 'typ') {
      updated.preis = calcPrice(updated.apartmentId, updated.typ)
    }
    setForm(updated)
  }

  const handleAdd = () => {
    if (!form.apartmentId) return
    addAuftrag({ ...form })
    setShowAdd(false)
    setForm(EMPTY_AUFTRAG)
  }

  const handleStart = (id) => updateAuftrag(id, { status: 'in_bearbeitung' })
  const handleComplete = (id) => updateAuftrag(id, { status: 'erledigt', dauer: 90 })

  const detailAuftrag = detailId ? auftraege.find(a => a.id === detailId) : null

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-navy-900">Aufträge</h1>
          <p className="text-sm text-gray-500">{auftraege.length} Aufträge gesamt</p>
        </div>
        {isAdmin && (
          <button onClick={() => { setForm(EMPTY_AUFTRAG); setShowAdd(true) }} className="btn-primary">
            <Plus size={16} /> Neuer Auftrag
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 rounded-xl p-1 mb-4 gap-1">
        {[
          { key: 'heute', label: 'Heute' },
          { key: 'woche', label: 'Diese Woche' },
          { key: 'alle', label: 'Alle' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.key ? 'bg-white text-navy-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <CheckCircle size={40} className="mx-auto mb-2 opacity-30" />
            <p>Keine Aufträge für diesen Zeitraum</p>
          </div>
        )}
        {filtered.map(auftrag => {
          const apt = getApartment(auftrag.apartmentId)
          const ma = getMitarbeiter(auftrag.mitarbeiterId)
          return (
            <div key={auftrag.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-bold text-navy-900">{apt?.nummer || auftrag.apartmentId}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {TYP_LABELS[auftrag.typ]} · {apt?.groesse}m² · {apt?.standort}
                  </div>
                </div>
                <span className={`badge ${STATUS_CONFIG[auftrag.status].color}`}>{STATUS_CONFIG[auftrag.status].label}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock size={11} className="text-gray-400" />
                  {format(new Date(auftrag.datum), 'dd.MM.')} {auftrag.uhrzeit}
                </div>
                <div>{ma?.name || '—'}</div>
                <div className="text-right font-semibold text-gold-600">{auftrag.preis}€</div>
              </div>

              <div className="flex gap-2">
                {auftrag.status === 'geplant' && (
                  <button onClick={() => handleStart(auftrag.id)} className="flex items-center gap-1 text-xs px-3 py-1.5 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 rounded-lg font-medium transition-all">
                    <Play size={11} /> Starten
                  </button>
                )}
                {auftrag.status === 'in_bearbeitung' && (
                  <>
                    <button onClick={() => handleComplete(auftrag.id)} className="flex items-center gap-1 text-xs px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg font-medium transition-all">
                      <CheckCircle size={11} /> Abschließen
                    </button>
                    <button className="flex items-center gap-1 text-xs px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg font-medium transition-all">
                      <Camera size={11} /> Foto
                    </button>
                  </>
                )}
                <button onClick={() => setDetailId(auftrag.id)} className="flex items-center gap-1 text-xs px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg font-medium transition-all ml-auto">
                  <Info size={11} /> Details
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Detail Modal */}
      {detailAuftrag && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-bold text-navy-900">Auftragsdetails</h2>
              <button onClick={() => setDetailId(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="p-4 space-y-3 text-sm">
              {[
                ['Auftrag-ID', detailAuftrag.id],
                ['Apartment', getApartment(detailAuftrag.apartmentId)?.nummer || detailAuftrag.apartmentId],
                ['Typ', TYP_LABELS[detailAuftrag.typ]],
                ['Datum', format(new Date(detailAuftrag.datum), 'dd.MM.yyyy')],
                ['Uhrzeit', detailAuftrag.uhrzeit],
                ['Mitarbeiter', getMitarbeiter(detailAuftrag.mitarbeiterId)?.name || '—'],
                ['Status', STATUS_CONFIG[detailAuftrag.status].label],
                ['Preis', `${detailAuftrag.preis}€`],
                ['Dauer', detailAuftrag.dauer ? `${detailAuftrag.dauer} Min.` : '—'],
                ['Qualität', detailAuftrag.qualitaet ? `${detailAuftrag.qualitaet}/5` : '—'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-gray-500">{k}</span>
                  <span className="font-medium">{v}</span>
                </div>
              ))}
              {detailAuftrag.notizen && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="text-xs text-gray-500 mb-1">Notizen</div>
                  <div>{detailAuftrag.notizen}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-bold text-navy-900">Neuer Auftrag</h2>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="label">Apartment</label>
                <select className="input-field" value={form.apartmentId} onChange={e => handleFormChange('apartmentId', e.target.value)}>
                  <option value="">Apartment wählen...</option>
                  {apartments.map(a => <option key={a.id} value={a.id}>{a.nummer} – {a.groesse}m² ({a.standort})</option>)}
                </select>
              </div>
              <div>
                <label className="label">Typ</label>
                <select className="input-field" value={form.typ} onChange={e => handleFormChange('typ', e.target.value)}>
                  {Object.entries(TYP_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Mitarbeiter</label>
                <select className="input-field" value={form.mitarbeiterId} onChange={e => handleFormChange('mitarbeiterId', e.target.value)}>
                  <option value="">Mitarbeiter wählen...</option>
                  {mitarbeiter.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Datum</label>
                  <input type="date" className="input-field" value={form.datum} onChange={e => handleFormChange('datum', e.target.value)} />
                </div>
                <div>
                  <label className="label">Uhrzeit</label>
                  <input type="time" className="input-field" value={form.uhrzeit} onChange={e => handleFormChange('uhrzeit', e.target.value)} />
                </div>
              </div>
              {form.apartmentId && (
                <div className="bg-gold-50 rounded-xl p-3 text-sm">
                  <span className="text-gray-600">Preis: </span>
                  <span className="font-bold text-gold-700">{form.preis}€</span>
                </div>
              )}
              <div>
                <label className="label">Notizen</label>
                <textarea className="input-field" rows={2} value={form.notizen} onChange={e => handleFormChange('notizen', e.target.value)} />
              </div>
              <button onClick={handleAdd} className="btn-primary w-full justify-center">
                Auftrag erstellen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
