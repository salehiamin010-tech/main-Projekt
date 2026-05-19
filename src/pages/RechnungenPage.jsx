import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { FileText, Plus, X, Download, CheckCircle, AlertCircle, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

const STATUS_CONFIG = {
  offen: { label: 'Offen', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  bezahlt: { label: 'Bezahlt', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  ueberfaellig: { label: 'Überfällig', color: 'bg-red-100 text-red-700', icon: AlertCircle },
}

const TYP_LABELS = {
  grundreinigung: 'Grundreinigung',
  unterhaltsreinigung: 'Unterhaltsreinigung',
  treppenhaus: 'Treppenhaus',
}

function formatEur(v) {
  return Number(v).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })
}

export default function RechnungenPage() {
  const { isAdmin } = useAuth()
  const { rechnungen, kunden, auftraege, apartments, addRechnung, updateRechnung } = useData()
  const [filterKunde, setFilterKunde] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [selectedRechnung, setSelectedRechnung] = useState(null)

  const [newForm, setNewForm] = useState({
    kundeId: '', monat: new Date().toISOString().slice(0, 7)
  })

  const filtered = rechnungen.filter(r => {
    if (filterKunde && r.kundeId !== filterKunde) return false
    if (filterStatus && r.status !== filterStatus) return false
    return true
  }).sort((a, b) => b.monat.localeCompare(a.monat))

  const getKunde = id => kunden.find(k => k.id === id)

  const generateInvoice = () => {
    const { kundeId, monat } = newForm
    if (!kundeId || !monat) return

    const kunde = kunden.find(k => k.id === kundeId)
    const [year, month] = monat.split('-').map(Number)

    const monatAuftraege = auftraege.filter(a => {
      const [y, m] = a.datum.split('-').map(Number)
      return y === year && m === month && a.status === 'erledigt'
    })

    // Check Einführungsrabatt (first 8 weeks = ~56 days)
    const startDate = new Date(kunde.startDatum)
    const monatDate = new Date(monat + '-01')
    const daysDiff = Math.floor((monatDate - startDate) / (1000 * 60 * 60 * 24))
    const hasEinfuehrungsrabatt = daysDiff < 56

    const positionen = monatAuftraege.map(a => {
      const apt = apartments.find(ap => ap.id === a.apartmentId)
      return {
        datum: a.datum,
        apartment: apt?.nummer || a.apartmentId,
        groesse: apt?.groesse || 0,
        typ: a.typ,
        preis: a.preis
      }
    })

    // Add Allgemeinflächen
    positionen.push({
      datum: monat + '-01',
      apartment: 'Allgemeinflächen Geb. 1',
      groesse: 0,
      typ: 'treppenhaus',
      preis: 89
    })

    const subtotal = positionen.reduce((s, p) => s + p.preis, 0)
    const rabattEinfuehrung = hasEinfuehrungsrabatt ? 5 : 0
    const rabattVolumen = monatAuftraege.length >= 50 ? 3 : 0
    const rabattBetrag = subtotal * (rabattEinfuehrung + rabattVolumen) / 100
    const netto = Math.round((subtotal - rabattBetrag) * 100) / 100
    const mwst = Math.round(netto * 0.19 * 100) / 100
    const gesamt = Math.round((netto + mwst) * 100) / 100

    const rechnung = {
      kundeId,
      monat,
      status: 'offen',
      positionen,
      rabattEinfuehrung,
      rabattVolumen,
      allgemeinflaechenGratis: false,
      netto,
      mwst,
      gesamt,
      erstelltAm: new Date().toISOString().slice(0, 10),
      bezahltAm: null,
    }

    addRechnung(rechnung)
    setShowAdd(false)
    setNewForm({ kundeId: '', monat: new Date().toISOString().slice(0, 7) })
  }

  const generatePDF = (rechnung) => {
    const kunde = getKunde(rechnung.kundeId)
    const content = `
MAINEXO CLEAN
Amin Salehi
Musterstraße 1
60311 Frankfurt am Main
Tel: 069-XXXXXXX
E-Mail: info@mainexo-clean.de

RECHNUNG

An:
${kunde?.name}
${kunde?.ansprechpartner}
${kunde?.adresse}

Rechnungsnummer: ${rechnung.id}
Datum: ${format(new Date(rechnung.erstelltAm), 'dd.MM.yyyy')}
Leistungszeitraum: ${rechnung.monat}

LEISTUNGEN:
${rechnung.positionen.map(p => `${format(new Date(p.datum), 'dd.MM.yyyy')}  ${p.apartment} (${p.groesse}m²)  ${TYP_LABELS[p.typ] || p.typ}  ${formatEur(p.preis)}`).join('\n')}

Zwischensumme: ${formatEur(rechnung.positionen.reduce((s, p) => s + p.preis, 0))}
${rechnung.rabattEinfuehrung > 0 ? `Einführungsrabatt (${rechnung.rabattEinfuehrung}%): -${formatEur(rechnung.positionen.reduce((s, p) => s + p.preis, 0) * rechnung.rabattEinfuehrung / 100)}` : ''}
${rechnung.rabattVolumen > 0 ? `Volumenrabatt (${rechnung.rabattVolumen}%): -${formatEur(rechnung.positionen.reduce((s, p) => s + p.preis, 0) * rechnung.rabattVolumen / 100)}` : ''}
Netto: ${formatEur(rechnung.netto)}
MwSt. (19%): ${formatEur(rechnung.mwst)}
GESAMT: ${formatEur(rechnung.gesamt)}

Zahlungsziel: 14 Tage
Bankverbindung: DE12 1234 5678 9012 3456 78
    `

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Rechnung_${rechnung.id}_${rechnung.monat}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-navy-900">Rechnungen</h1>
          <p className="text-sm text-gray-500">{rechnungen.length} Rechnungen gesamt</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowAdd(true)} className="btn-primary">
            <Plus size={16} /> Neue Rechnung
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-3 mb-4">
        <div className="grid grid-cols-2 gap-2">
          <select value={filterKunde} onChange={e => setFilterKunde(e.target.value)} className="input-field text-sm">
            <option value="">Alle Kunden</option>
            {kunden.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input-field text-sm">
            <option value="">Alle Status</option>
            <option value="offen">Offen</option>
            <option value="bezahlt">Bezahlt</option>
            <option value="ueberfaellig">Überfällig</option>
          </select>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.map(rechnung => {
          const kunde = getKunde(rechnung.kundeId)
          const cfg = STATUS_CONFIG[rechnung.status] || STATUS_CONFIG.offen
          const StatusIcon = cfg.icon
          return (
            <div key={rechnung.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-bold text-navy-900">{rechnung.id}</div>
                  <div className="text-sm text-gray-600">{kunde?.name}</div>
                  <div className="text-xs text-gray-400">
                    {format(new Date(rechnung.monat + '-01'), 'MMMM yyyy', { locale: de })} · {rechnung.positionen.length} Positionen
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-xl text-navy-900">{formatEur(rechnung.gesamt)}</div>
                  <span className={`badge ${cfg.color} mt-1`}>
                    <StatusIcon size={11} className="mr-1" />
                    {cfg.label}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedRechnung(rechnung)}
                  className="flex items-center gap-1 text-xs px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg font-medium transition-all"
                >
                  <FileText size={11} /> Details
                </button>
                <button
                  onClick={() => generatePDF(rechnung)}
                  className="flex items-center gap-1 text-xs px-3 py-1.5 bg-navy-50 hover:bg-navy-100 text-navy-700 rounded-lg font-medium transition-all"
                >
                  <Download size={11} /> PDF
                </button>
                {rechnung.status === 'offen' && isAdmin && (
                  <button
                    onClick={() => updateRechnung(rechnung.id, { status: 'bezahlt', bezahltAm: new Date().toISOString().slice(0, 10) })}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg font-medium transition-all"
                  >
                    <CheckCircle size={11} /> Als bezahlt markieren
                  </button>
                )}
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <FileText size={40} className="mx-auto mb-2 opacity-30" />
            <p>Keine Rechnungen gefunden</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedRechnung && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h2 className="font-bold text-navy-900">Rechnung {selectedRechnung.id}</h2>
              <button onClick={() => setSelectedRechnung(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-xs text-gray-500">An</div>
                  <div className="font-semibold">{getKunde(selectedRechnung.kundeId)?.name}</div>
                  <div className="text-sm text-gray-500">{getKunde(selectedRechnung.kundeId)?.adresse}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Datum</div>
                  <div className="font-semibold">{format(new Date(selectedRechnung.erstelltAm), 'dd.MM.yyyy')}</div>
                  <span className={`badge ${STATUS_CONFIG[selectedRechnung.status]?.color} mt-1`}>
                    {STATUS_CONFIG[selectedRechnung.status]?.label}
                  </span>
                </div>
              </div>

              {/* Line items */}
              <div className="mb-4">
                <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Positionen</div>
                <div className="space-y-1">
                  {selectedRechnung.positionen.map((p, i) => (
                    <div key={i} className="flex justify-between text-sm py-1.5 border-b border-gray-50">
                      <div>
                        <span className="text-gray-400 text-xs">{format(new Date(p.datum), 'dd.MM.')}</span>
                        <span className="ml-2 font-medium">{p.apartment}</span>
                        {p.groesse > 0 && <span className="text-xs text-gray-400 ml-1">({p.groesse}m²)</span>}
                        <div className="text-xs text-gray-400">{TYP_LABELS[p.typ] || p.typ}</div>
                      </div>
                      <div className="font-semibold text-right">{formatEur(p.preis)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="bg-gray-50 rounded-xl p-3 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Zwischensumme</span>
                  <span>{formatEur(selectedRechnung.positionen.reduce((s, p) => s + p.preis, 0))}</span>
                </div>
                {selectedRechnung.rabattEinfuehrung > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Einführungsrabatt ({selectedRechnung.rabattEinfuehrung}%)</span>
                    <span>-{formatEur(selectedRechnung.positionen.reduce((s, p) => s + p.preis, 0) * selectedRechnung.rabattEinfuehrung / 100)}</span>
                  </div>
                )}
                {selectedRechnung.rabattVolumen > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Volumenrabatt ({selectedRechnung.rabattVolumen}%)</span>
                    <span>-{formatEur(selectedRechnung.positionen.reduce((s, p) => s + p.preis, 0) * selectedRechnung.rabattVolumen / 100)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-gray-200 pt-1.5">
                  <span className="text-gray-500">Netto</span>
                  <span>{formatEur(selectedRechnung.netto)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">MwSt. (19%)</span>
                  <span>{formatEur(selectedRechnung.mwst)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-1.5 font-bold text-base">
                  <span>Gesamt</span>
                  <span className="text-gold-600">{formatEur(selectedRechnung.gesamt)}</span>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button onClick={() => generatePDF(selectedRechnung)} className="btn-secondary flex-1 justify-center">
                  <Download size={16} /> PDF herunterladen
                </button>
                {selectedRechnung.status === 'offen' && isAdmin && (
                  <button
                    onClick={() => {
                      updateRechnung(selectedRechnung.id, { status: 'bezahlt', bezahltAm: new Date().toISOString().slice(0, 10) })
                      setSelectedRechnung(null)
                    }}
                    className="btn-primary flex-1 justify-center"
                  >
                    <CheckCircle size={16} /> Bezahlt
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-bold text-navy-900">Neue Rechnung erstellen</h2>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="label">Kunde</label>
                <select className="input-field" value={newForm.kundeId} onChange={e => setNewForm({ ...newForm, kundeId: e.target.value })}>
                  <option value="">Kunde wählen...</option>
                  {kunden.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Monat</label>
                <input
                  type="month"
                  className="input-field"
                  value={newForm.monat}
                  onChange={e => setNewForm({ ...newForm, monat: e.target.value })}
                />
              </div>
              {newForm.kundeId && (
                <div className="bg-blue-50 rounded-xl p-3 text-sm text-blue-700">
                  {auftraege.filter(a => {
                    const [y, m] = a.datum.split('-').map(Number)
                    const [ny, nm] = newForm.monat.split('-').map(Number)
                    return y === ny && m === nm && a.status === 'erledigt'
                  }).length} erledigte Aufträge in diesem Monat gefunden
                </div>
              )}
              <button onClick={generateInvoice} className="btn-primary w-full justify-center">
                Rechnung generieren
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
