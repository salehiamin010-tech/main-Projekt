import React, { useState, useEffect, useRef } from 'react'
import { useData } from '../context/DataContext'
import { CheckSquare, Square, Star, Camera, Clock, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react'
import { format } from 'date-fns'

const GRUND_CHECKLIST = [
  'Fenster innen reinigen',
  'Fensterbänke abwischen',
  'Heizkörper abstauben',
  'Türen und Türrahmen abwischen',
  'Lichtschalter & Steckdosen desinfizieren',
  'Lampen und Lampenschirme abstauben',
  'Schränke innen und außen reinigen',
  'Kühlschrank innen reinigen und desinfizieren',
  'Mikrowelle innen und außen reinigen',
  'Backofen innen und außen reinigen',
  'Herd und Ceranfeld reinigen',
  'Dunstabzugshaube Filter reinigen',
  'Spüle desinfizieren und polieren',
  'Arbeitsflächen desinfizieren',
  'Küchenschränke innen und außen abwischen',
  'Badewanne/Dusche desinfizieren',
  'Toilette innen und außen desinfizieren',
  'Waschbecken desinfizieren und polieren',
  'Spiegel reinigen und polieren',
  'Fliesen reinigen und desinfizieren',
  'Armaturen polieren',
  'Silikonfugen reinigen',
  'Bettrahmen und Lattenrost reinigen',
  'Matratze absaugen',
  'Alle Oberflächen abstauben',
  'Bilder und Dekorationen abstauben',
  'Staubsaugen in allen Räumen',
  'Parkett/Fliesen wischen',
  'Fußleisten abwischen',
  'Eingang und Flur reinigen',
  'Müll entsorgen und Eimer reinigen',
  'Handtücher und Bettwäsche wechseln',
  'Frische Handtücher und Wäsche platzieren',
  'Abschlusskontrolle durchführen',
]

const UNTERHALT_CHECKLIST = [
  'Staub wischen (alle Oberflächen)',
  'Küche reinigen: Herd, Arbeitsflächen, Spüle',
  'Kühlschrank außen reinigen',
  'Mikrowelle außen reinigen',
  'Bad reinigen: Toilette desinfizieren',
  'Waschbecken reinigen',
  'Dusche/Badewanne reinigen',
  'Spiegel reinigen',
  'Staubsaugen in allen Räumen',
  'Böden wischen',
  'Fußleisten abwischen',
  'Türgriffe und Lichtschalter desinfizieren',
  'Müll leeren und Eimer reinigen',
  'Handtücher wechseln (falls gestellt)',
  'Kissen und Decken aufschütteln',
  'Fenster auf Sauberkeit prüfen',
  'Abschlusskontrolle durchführen',
]

const TREPPENHAUS_ITEMS = [
  'Eingangsbereich fegen und wischen',
  'Briefkastenanlage abwischen',
  'Treppengeländer desinfizieren',
  'Treppenstufen wischen',
  'Kellertür abwischen',
  'Aufzug innen reinigen',
  'Aufzug Türen polieren',
  'Flure wischen',
  'Lagerraum fegen',
  'Außenbereich kehren',
]

const TYP_LABELS = {
  grundreinigung: 'Grundreinigung',
  unterhaltsreinigung: 'Unterhaltsreinigung',
  treppenhaus: 'Treppenhaus',
}

export default function QualityCheckPage() {
  const { auftraege, apartments, updateAuftrag } = useData()
  const [selectedId, setSelectedId] = useState('')
  const [checklist, setChecklist] = useState([])
  const [photos, setPhotos] = useState({})
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [elapsed, setElapsed] = useState(0)
  const [timerActive, setTimerActive] = useState(false)
  const [completed, setCompleted] = useState(false)
  const startTime = useRef(null)
  const timerRef = useRef(null)

  const activeOrders = auftraege.filter(a => a.status === 'in_bearbeitung' || (a.status === 'geplant' && a.datum === new Date().toISOString().slice(0, 10)))
  const selected = auftraege.find(a => a.id === selectedId)
  const apt = selected ? apartments.find(a => a.id === selected.apartmentId) : null

  const getChecklistForTyp = (typ) => {
    if (typ === 'grundreinigung') return GRUND_CHECKLIST
    if (typ === 'unterhaltsreinigung') return UNTERHALT_CHECKLIST
    return TREPPENHAUS_ITEMS
  }

  const handleSelect = (id) => {
    setSelectedId(id)
    const order = auftraege.find(a => a.id === id)
    if (order) {
      const items = getChecklistForTyp(order.typ)
      setChecklist(items.map(item => ({ label: item, checked: false })))
      setPhotos({})
      setRating(0)
      setComment('')
      setElapsed(0)
      setTimerActive(true)
      setCompleted(false)
      startTime.current = Date.now()
    }
  }

  useEffect(() => {
    if (timerActive) {
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime.current) / 1000))
      }, 1000)
    }
    return () => clearInterval(timerRef.current)
  }, [timerActive])

  const formatTime = (s) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  const toggleCheck = (i) => {
    setChecklist(prev => prev.map((item, idx) => idx === i ? { ...item, checked: !item.checked } : item))
  }

  const handleComplete = () => {
    if (!selectedId) return
    setTimerActive(false)
    clearInterval(timerRef.current)
    const dauer = Math.round(elapsed / 60)
    updateAuftrag(selectedId, {
      status: 'erledigt',
      qualitaet: rating,
      dauer,
      notizen: comment,
    })
    setCompleted(true)
  }

  const checkedCount = checklist.filter(c => c.checked).length
  const progress = checklist.length > 0 ? Math.round((checkedCount / checklist.length) * 100) : 0

  const PHOTO_AREAS = ['Bad', 'Küche', 'Schlafzimmer', 'Wohnzimmer', 'Eingang']

  if (completed) {
    return (
      <div className="p-4 max-w-lg mx-auto text-center">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 mt-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-navy-900 mb-2">Reinigung abgeschlossen!</h2>
          <p className="text-gray-500 text-sm mb-4">Dauer: {formatTime(elapsed)} · Qualität: {rating}/5 Sterne</p>
          <button onClick={() => { setSelectedId(''); setCompleted(false) }} className="btn-primary">
            Neuer Quality-Check
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-navy-900">Quality-Check</h1>
        <p className="text-sm text-gray-500">Reinigung prüfen und dokumentieren</p>
      </div>

      {/* Select Order */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
        <label className="label">Auftrag auswählen</label>
        <select className="input-field" value={selectedId} onChange={e => handleSelect(e.target.value)}>
          <option value="">Auftrag wählen...</option>
          {activeOrders.map(a => {
            const aptItem = apartments.find(ap => ap.id === a.apartmentId)
            return (
              <option key={a.id} value={a.id}>
                {aptItem?.nummer} – {TYP_LABELS[a.typ]} ({format(new Date(a.datum), 'dd.MM.yyyy')})
              </option>
            )
          })}
        </select>
      </div>

      {selected && (
        <>
          {/* Info + Timer */}
          <div className="bg-navy-900 rounded-2xl p-4 mb-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-gold-400">{apt?.nummer}</div>
                <div className="text-sm text-white/70">{TYP_LABELS[selected.typ]} · {apt?.groesse}m²</div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 text-2xl font-mono font-bold text-gold-400">
                  <Clock size={20} className="text-white/50" />
                  {formatTime(elapsed)}
                </div>
                <div className="text-xs text-white/50">Verstrichene Zeit</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-white/60 mb-1">
                <span>Checkliste: {checkedCount}/{checklist.length}</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-gold-400 rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>

          {/* Checklist */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
            <h2 className="font-semibold text-navy-900 mb-3">
              Checkliste – {TYP_LABELS[selected.typ]}
            </h2>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {checklist.map((item, i) => (
                <button
                  key={i}
                  onClick={() => toggleCheck(i)}
                  className={`flex items-center gap-3 w-full text-left p-2 rounded-xl transition-all ${
                    item.checked ? 'bg-green-50' : 'hover:bg-gray-50'
                  }`}
                >
                  {item.checked
                    ? <CheckSquare size={18} className="text-green-500 flex-shrink-0" />
                    : <Square size={18} className="text-gray-300 flex-shrink-0" />
                  }
                  <span className={`text-sm ${item.checked ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Photos */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
            <h2 className="font-semibold text-navy-900 mb-3">Fotos</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {PHOTO_AREAS.map(area => (
                <div key={area} className="border-2 border-dashed border-gray-200 rounded-xl p-3 text-center hover:border-gold-300 transition-all">
                  <label className="cursor-pointer block">
                    <Camera size={20} className="text-gray-300 mx-auto mb-1" />
                    <div className="text-xs text-gray-500 font-medium">{area}</div>
                    <div className="text-xs text-gray-400 mt-1">{photos[area] ? '✓ Hochgeladen' : 'Foto hinzufügen'}</div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => {
                        if (e.target.files[0]) {
                          setPhotos(prev => ({ ...prev, [area]: e.target.files[0].name }))
                        }
                      }}
                    />
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
            <h2 className="font-semibold text-navy-900 mb-3">Gesamtbewertung</h2>
            <div className="flex gap-2 mb-3">
              {[1, 2, 3, 4, 5].map(s => (
                <button key={s} onClick={() => setRating(s)}>
                  <Star
                    size={28}
                    className={s <= rating ? 'text-gold-400 fill-gold-400' : 'text-gray-200'}
                  />
                </button>
              ))}
            </div>
            <div>
              <label className="label">Anmerkungen / Probleme</label>
              <textarea
                className="input-field"
                rows={3}
                placeholder="Optionale Anmerkungen zur Reinigung..."
                value={comment}
                onChange={e => setComment(e.target.value)}
              />
            </div>
          </div>

          {/* Complete button */}
          <button
            onClick={handleComplete}
            disabled={progress < 50 || rating === 0}
            className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-4 rounded-2xl text-base transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle size={20} />
            Reinigung abschließen
          </button>
          <p className="text-xs text-center text-gray-400 mt-2">
            Mindestens 50% der Checkliste und eine Bewertung erforderlich
          </p>
        </>
      )}

      {!selected && (
        <div className="text-center py-12 text-gray-400">
          <CheckSquare size={48} className="mx-auto mb-3 opacity-20" />
          <p className="text-sm">Bitte einen Auftrag auswählen, um den Quality-Check zu starten</p>
        </div>
      )}
    </div>
  )
}
