import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { Users, Plus, X, Star, Phone, Mail, ChevronDown, ChevronUp, Edit2 } from 'lucide-react'

const WOCHENTAGE = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

const EMPTY_MA = {
  name: '', typ: 'Minijobber', telefon: '', email: '',
  stundenMonat: 0, qualitaetsScore: 4.5,
  verfuegbarkeit: ['Mo', 'Di', 'Mi', 'Do', 'Fr'],
  notizen: '', aktiv: true
}

function StarRating({ value }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star
          key={s}
          size={14}
          className={s <= Math.round(value) ? 'text-gold-400 fill-gold-400' : 'text-gray-200'}
        />
      ))}
      <span className="text-xs text-gray-500 ml-1">{value.toFixed(1)}</span>
    </div>
  )
}

export default function MitarbeiterPage() {
  const { isAdmin } = useAuth()
  const { mitarbeiter, addMitarbeiter, updateMitarbeiter, auftraege } = useData()
  const [expanded, setExpanded] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState(EMPTY_MA)
  const [isEditing, setIsEditing] = useState(false)

  const getMaStats = (maId) => {
    const maAuftraege = auftraege.filter(a => a.mitarbeiterId === maId)
    const erledigt = maAuftraege.filter(a => a.status === 'erledigt')
    const avgQuality = erledigt.length > 0
      ? erledigt.reduce((s, a) => s + (a.qualitaet || 0), 0) / erledigt.length
      : 0
    return { total: maAuftraege.length, erledigt: erledigt.length, avgQuality }
  }

  const handleSave = () => {
    if (!form.name) return
    if (isEditing) {
      updateMitarbeiter(form.id, form)
    } else {
      addMitarbeiter(form)
    }
    setShowAdd(false)
    setForm(EMPTY_MA)
    setIsEditing(false)
  }

  const openEdit = (ma) => {
    setForm({ ...ma })
    setIsEditing(true)
    setShowAdd(true)
  }

  const toggleVerfuegbarkeit = (tag) => {
    setForm(prev => ({
      ...prev,
      verfuegbarkeit: prev.verfuegbarkeit.includes(tag)
        ? prev.verfuegbarkeit.filter(t => t !== tag)
        : [...prev.verfuegbarkeit, tag]
    }))
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-navy-900">Mitarbeiter</h1>
          <p className="text-sm text-gray-500">{mitarbeiter.length} Mitarbeiter</p>
        </div>
        {isAdmin && (
          <button onClick={() => { setForm(EMPTY_MA); setIsEditing(false); setShowAdd(true) }} className="btn-primary">
            <Plus size={16} /> Hinzufügen
          </button>
        )}
      </div>

      <div className="space-y-3">
        {mitarbeiter.map(ma => {
          const stats = getMaStats(ma.id)
          const isOpen = expanded === ma.id
          return (
            <div key={ma.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-full bg-navy-100 flex items-center justify-center text-navy-700 font-bold text-sm flex-shrink-0">
                    {ma.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-navy-900">{ma.name}</span>
                      <span className={`badge text-xs ${ma.aktiv ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {ma.aktiv ? 'Aktiv' : 'Inaktiv'}
                      </span>
                      <span className="badge bg-navy-50 text-navy-600 text-xs">{ma.typ}</span>
                    </div>
                    <StarRating value={ma.qualitaetsScore} />
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                      <span>{ma.stundenMonat}h / Monat</span>
                      <span>{stats.erledigt} Reinigungen</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {isAdmin && (
                      <button onClick={() => openEdit(ma)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                        <Edit2 size={15} />
                      </button>
                    )}
                    <button onClick={() => setExpanded(isOpen ? null : ma.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              {isOpen && (
                <div className="border-t border-gray-50 p-4 bg-gray-50 space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone size={14} className="text-gray-400" />
                      {ma.telefon || '—'}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail size={14} className="text-gray-400" />
                      {ma.email || '—'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-1.5">Verfügbarkeit</div>
                    <div className="flex gap-1 flex-wrap">
                      {WOCHENTAGE.map(tag => (
                        <span
                          key={tag}
                          className={`px-2 py-1 rounded-lg text-xs font-medium ${
                            ma.verfuegbarkeit?.includes(tag)
                              ? 'bg-navy-900 text-white'
                              : 'bg-gray-200 text-gray-400'
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-white rounded-xl p-2">
                      <div className="font-bold text-navy-900">{stats.total}</div>
                      <div className="text-xs text-gray-500">Aufträge</div>
                    </div>
                    <div className="bg-white rounded-xl p-2">
                      <div className="font-bold text-green-600">{stats.erledigt}</div>
                      <div className="text-xs text-gray-500">Erledigt</div>
                    </div>
                    <div className="bg-white rounded-xl p-2">
                      <div className="font-bold text-gold-600">{stats.avgQuality > 0 ? stats.avgQuality.toFixed(1) : '—'}</div>
                      <div className="text-xs text-gray-500">Ø Qualität</div>
                    </div>
                  </div>
                  {ma.notizen && (
                    <div className="bg-white rounded-xl p-2 text-sm text-gray-600">
                      <span className="text-xs text-gray-400">Notizen: </span>{ma.notizen}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Add/Edit Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-bold text-navy-900">{isEditing ? 'Mitarbeiter bearbeiten' : 'Neuer Mitarbeiter'}</h2>
              <button onClick={() => { setShowAdd(false); setIsEditing(false) }} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="label">Name</label>
                <input className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Vor- und Nachname" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Beschäftigungstyp</label>
                  <select className="input-field" value={form.typ} onChange={e => setForm({ ...form, typ: e.target.value })}>
                    <option value="Minijobber">Minijobber</option>
                    <option value="Midijobber">Midijobber</option>
                  </select>
                </div>
                <div>
                  <label className="label">Stunden / Monat</label>
                  <input type="number" className="input-field" value={form.stundenMonat} onChange={e => setForm({ ...form, stundenMonat: Number(e.target.value) })} />
                </div>
              </div>
              <div>
                <label className="label">Telefon</label>
                <input className="input-field" value={form.telefon} onChange={e => setForm({ ...form, telefon: e.target.value })} />
              </div>
              <div>
                <label className="label">E-Mail</label>
                <input type="email" className="input-field" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label className="label">Verfügbarkeit</label>
                <div className="flex gap-1.5 flex-wrap">
                  {WOCHENTAGE.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleVerfuegbarkeit(tag)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        form.verfuegbarkeit?.includes(tag)
                          ? 'bg-navy-900 text-white'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Notizen</label>
                <textarea className="input-field" rows={2} value={form.notizen} onChange={e => setForm({ ...form, notizen: e.target.value })} />
              </div>
              <button onClick={handleSave} className="btn-primary w-full justify-center">
                {isEditing ? 'Speichern' : 'Mitarbeiter hinzufügen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
