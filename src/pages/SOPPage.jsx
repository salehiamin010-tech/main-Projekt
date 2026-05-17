import React, { useState } from 'react'
import { BookOpen, ChevronDown, ChevronUp, Search, Printer, CheckCircle } from 'lucide-react'

const SOP_DATA = [
  {
    id: 'grund',
    title: 'Grundreinigung (Abreise)',
    subtitle: '34 Schritte – vollständige Tiefenreinigung',
    color: 'bg-navy-900 text-white',
    items: [
      { title: 'Fenster innen reinigen', detail: 'Glasflächen mit Glasreiniger und fusselfreiem Tuch reinigen. Auf Schlieren achten.' },
      { title: 'Fensterbänke abwischen', detail: 'Fensterbänke innen gründlich abwischen, Staub und Schmutz entfernen.' },
      { title: 'Heizkörper abstauben', detail: 'Heizkörper-Lamellen mit Bürstenaufsatz reinigen, darunter wischen.' },
      { title: 'Türen und Türrahmen abwischen', detail: 'Alle Türen beidseitig, Türrahmen und Türstöpper reinigen.' },
      { title: 'Lichtschalter & Steckdosen desinfizieren', detail: 'Mit Desinfektionsmittel (mind. 70% Alkohol) alle Schalter und Steckdosen abwischen.' },
      { title: 'Lampen und Lampenschirme abstauben', detail: 'Deckenlampen und Stehlampen vorsichtig abstauben, Glühbirnen auf Funktion prüfen.' },
      { title: 'Schränke innen und außen reinigen', detail: 'Alle Schränke ausräumen (falls nötig), innen wischen, außen abwischen.' },
      { title: 'Kühlschrank innen reinigen und desinfizieren', detail: 'Kühlschrank komplett ausräumen, alle Fächer und Schubladen reinigen, mit Desinfektionsmittel nachwischen.' },
      { title: 'Mikrowelle innen und außen reinigen', detail: 'Drehteller herausnehmen und separat reinigen, Innenraum mit Dampfreiniger oder feuchtem Tuch reinigen.' },
      { title: 'Backofen innen und außen reinigen', detail: 'Backbleche herausnehmen, Backofen mit speziellem Ofenreiniger behandeln, gründlich auswischen.' },
      { title: 'Herd und Ceranfeld reinigen', detail: 'Ceranfeld mit speziellem Reiniger behandeln, Herdplatten und Ränder reinigen.' },
      { title: 'Dunstabzugshaube Filter reinigen', detail: 'Fettfilter herausnehmen und in Spülmaschine reinigen oder mit Fettlöser behandeln.' },
      { title: 'Spüle desinfizieren und polieren', detail: 'Spüle mit Scheuermilch reinigen, Abfluss behandeln, Armaturen polieren.' },
      { title: 'Arbeitsflächen desinfizieren', detail: 'Alle Arbeitsflächen mit Lebensmittel-sicherem Desinfektionsmittel abwischen.' },
      { title: 'Küchenschränke innen und außen abwischen', detail: 'Alle Küchenschränke außen abwischen, stark benutzte Schränke auch innen.' },
      { title: 'Badewanne/Dusche desinfizieren', detail: 'Mit sanitärem Reiniger behandeln, Schimmelstellen prüfen, Ablauf reinigen.' },
      { title: 'Toilette innen und außen desinfizieren', detail: 'Toilettenrand, Brille und Deckel reinigen, Schüssel mit WC-Reiniger behandeln, Spülkasten außen abwischen.' },
      { title: 'Waschbecken desinfizieren und polieren', detail: 'Waschbecken mit Sanitärreiniger behandeln, Armatur polieren, Überlauf reinigen.' },
      { title: 'Spiegel reinigen und polieren', detail: 'Mit Glasreiniger streifenfrei reinigen.' },
      { title: 'Fliesen reinigen und desinfizieren', detail: 'Fliesenflächen mit geeignetem Reiniger wischen, Fugen auf Schimmel prüfen.' },
      { title: 'Armaturen polieren', detail: 'Alle Wasserarmaturen mit Kalk- und Wasserfleckenentferner behandeln, polieren.' },
      { title: 'Silikonfugen reinigen', detail: 'Silikon auf Schimmel und Verfärbungen prüfen, ggf. Schimmelentferner einwirken lassen.' },
      { title: 'Bettrahmen und Lattenrost reinigen', detail: 'Bettrahmen abstauben und abwischen, Lattenrost auf Beschädigungen prüfen.' },
      { title: 'Matratze absaugen', detail: 'Matratze beidseitig absaugen, auf Flecken und Beschädigungen prüfen.' },
      { title: 'Alle Oberflächen abstauben', detail: 'Systematisch alle Möbeloberflächen, Regale und Ablagen abstauben.' },
      { title: 'Bilder und Dekorationen abstauben', detail: 'Alle Deko-Elemente, Bilder und Rahmen vorsichtig abstauben.' },
      { title: 'Staubsaugen in allen Räumen', detail: 'Alle Teppiche und Böden absaugen, besonders Ecken und unter Möbeln.' },
      { title: 'Parkett/Fliesen wischen', detail: 'Alle harten Böden feucht aufwischen, geeignetes Reinigungsmittel verwenden.' },
      { title: 'Fußleisten abwischen', detail: 'Alle Fußleisten im gesamten Apartment abwischen.' },
      { title: 'Eingang und Flur reinigen', detail: 'Eingangstür, Briefkasten (falls vorhanden), Flurbereich reinigen.' },
      { title: 'Müll entsorgen und Eimer reinigen', detail: 'Alle Mülleimer leeren, Beutel wechseln, Eimer innen und außen reinigen.' },
      { title: 'Handtücher und Bettwäsche wechseln', detail: 'Gesamte Bettwäsche und Handtücher komplett wechseln, frisch gewaschene Wäsche beziehen.' },
      { title: 'Frische Handtücher und Wäsche platzieren', detail: 'Handtücher ordentlich falten und platzieren, Hotel-Style wenn möglich.' },
      { title: 'Abschlusskontrolle durchführen', detail: 'Jeden Raum nochmals kontrollieren, Fotos machen, Checkliste abhaken. Fenster schließen, Lichter aus.' },
    ]
  },
  {
    id: 'unterhalt',
    title: 'Unterhaltsreinigung (Bleibe)',
    subtitle: '17 Schritte – laufende Reinigung bei Belegung',
    color: 'bg-gold-400 text-navy-900',
    items: [
      { title: 'Staub wischen (alle Oberflächen)', detail: 'Alle sichtbaren Oberflächen in Wohn- und Schlafbereich mit feuchtem Mikrofasertuch abwischen.' },
      { title: 'Küche reinigen: Herd, Arbeitsflächen, Spüle', detail: 'Herd und Ceranfeld reinigen, Arbeitsflächen desinfizieren, Spüle polieren.' },
      { title: 'Kühlschrank außen reinigen', detail: 'Kühlschrank außen abwischen, Griff desinfizieren.' },
      { title: 'Mikrowelle außen reinigen', detail: 'Mikrowelle außen abwischen, Tür und Griff reinigen.' },
      { title: 'Bad reinigen: Toilette desinfizieren', detail: 'Toilette komplett desinfizieren, WC-Reiniger in die Schüssel geben.' },
      { title: 'Waschbecken reinigen', detail: 'Waschbecken reinigen, Armatur abwischen.' },
      { title: 'Dusche/Badewanne reinigen', detail: 'Dusche oder Badewanne reinigen, Kalk entfernen.' },
      { title: 'Spiegel reinigen', detail: 'Spiegel streifenfrei reinigen.' },
      { title: 'Staubsaugen in allen Räumen', detail: 'Alle Räume staubsaugen, besonders Läufer und Übergänge.' },
      { title: 'Böden wischen', detail: 'Alle harten Böden feucht aufwischen.' },
      { title: 'Fußleisten abwischen', detail: 'Sichtbare Verschmutzungen an Fußleisten entfernen.' },
      { title: 'Türgriffe und Lichtschalter desinfizieren', detail: 'Alle Griffe und Schalter mit Desinfektionstuch abwischen.' },
      { title: 'Müll leeren und Eimer reinigen', detail: 'Alle Mülleimer leeren, Beutel prüfen oder wechseln.' },
      { title: 'Handtücher wechseln (falls gestellt)', detail: 'Wenn Handtücher vom Betrieb gestellt werden, frische auslegen.' },
      { title: 'Kissen und Decken aufschütteln', detail: 'Bett machen, Kissen aufschütteln, Decken auflockern.' },
      { title: 'Fenster auf Sauberkeit prüfen', detail: 'Sichtbare Verschmutzungen an Fenstern entfernen, bei Bedarf reinigen.' },
      { title: 'Abschlusskontrolle durchführen', detail: 'Schnelle Kontrolle aller Räume, Foto machen, fertig melden.' },
    ]
  },
  {
    id: 'treppenhaus',
    title: 'Allgemeinflächen (Treppenhaus/Aufzug/Lager)',
    subtitle: 'Gemeinsame Bereiche und Außenflächen',
    color: 'bg-emerald-600 text-white',
    items: [
      { title: 'Eingangsbereich fegen und wischen', detail: 'Eingangstür innen und außen reinigen, Fußmatte reinigen oder klopfen, Boden fegen und wischen.' },
      { title: 'Briefkastenanlage abwischen', detail: 'Alle Briefkästen außen abwischen, Namensschilder reinigen.' },
      { title: 'Treppengeländer desinfizieren', detail: 'Alle Handläufe und Geländer von oben nach unten mit Desinfektionsmittel abwischen.' },
      { title: 'Treppenstufen wischen', detail: 'Alle Treppenstufen wischen, Ecken und Kanten besonders beachten.' },
      { title: 'Kellertür abwischen', detail: 'Kellertür und Rahmen abwischen, Griff desinfizieren.' },
      { title: 'Aufzug innen reinigen', detail: 'Aufzugkabine komplett reinigen, Boden wischen, Wände abwischen, Spiegel reinigen.' },
      { title: 'Aufzug Türen polieren', detail: 'Aufzugstüren auf allen Etagen außen polieren.' },
      { title: 'Flure wischen', detail: 'Alle Flurbereiche auf jeder Etage fegen und wischen.' },
      { title: 'Lagerraum fegen', detail: 'Gemeinschaftslagerraum fegen, Ordnung herstellen.' },
      { title: 'Außenbereich kehren', detail: 'Gehweg vor dem Gebäude kehren, bei Bedarf wischen.' },
    ]
  },
  {
    id: 'arztpraxis',
    title: 'Arztpraxis-Hygiene',
    subtitle: 'Medizinische Reinigungsstandards',
    color: 'bg-blue-600 text-white',
    items: [
      { title: 'Desinfektionsmittel vorbereiten', detail: 'VAH-gelistete Flächendesinfektionsmittel in vorgeschriebener Konzentration anmischen.' },
      { title: 'Behandlungsliege desinfizieren', detail: 'Behandlungsliege mit Flächendesinfektionsmittel abwischen, besonders Griffe und Verstellmechanismen.' },
      { title: 'Medizinische Geräte-Außenflächen reinigen', detail: 'Alle Außenflächen von Medizingeräten mit geeignetem Desinfektionsmittel abwischen, ohne Gerät zu beschädigen.' },
      { title: 'Wartebereich reinigen', detail: 'Stühle und Tische desinfizieren, Boden reinigen, Spielzeug desinfizieren.' },
      { title: 'Sanitäranlagen hygienisch reinigen', detail: 'WC, Waschbecken und alle Oberflächen mit klinischem Desinfektionsmittel behandeln.' },
      { title: 'Medizinischer Abfall entsorgen', detail: 'Spezielle Abfallbehälter (Sharps Container, Sonderabfall) gemäß Vorschrift behandeln – NICHT in normalen Abfall.' },
      { title: 'Türgriffe und Kontaktflächen desinfizieren', detail: 'Alle Türgriffe, Lichtschalter und Handläufe stündlich desinfizieren.' },
      { title: 'Bodenreinigung nach KRINKO-Richtlinien', detail: 'Einweg-Wischbezüge verwenden, Desinfektionsreiniger einsetzen, Bereiche getrennt reinigen.' },
    ]
  },
]

export default function SOPPage() {
  const [expandedSection, setExpandedSection] = useState('grund')
  const [expandedItem, setExpandedItem] = useState(null)
  const [search, setSearch] = useState('')

  const filteredData = SOP_DATA.map(section => ({
    ...section,
    items: section.items.filter(item =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.detail.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(section => section.items.length > 0 || !search)

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-navy-900">SOP – Reinigungsstandards</h1>
          <p className="text-sm text-gray-500">Standard Operating Procedures</p>
        </div>
        <button onClick={handlePrint} className="btn-ghost">
          <Printer size={16} /> Drucken
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="input-field pl-9"
          placeholder="SOP-Schritte durchsuchen..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Sections */}
      <div className="space-y-3">
        {filteredData.map(section => {
          const isOpen = expandedSection === section.id || !!search

          return (
            <div key={section.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <button
                onClick={() => setExpandedSection(isOpen && !search ? null : section.id)}
                className="w-full text-left"
              >
                <div className={`${section.color} px-4 py-3 flex items-center justify-between`}>
                  <div>
                    <div className="font-bold">{section.title}</div>
                    <div className="text-xs opacity-70 mt-0.5">{section.subtitle}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                      {section.items.length} Schritte
                    </span>
                    {!search && (isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                  </div>
                </div>
              </button>

              {(isOpen || search) && (
                <div className="divide-y divide-gray-50">
                  {section.items.map((item, i) => {
                    const itemKey = `${section.id}-${i}`
                    const itemOpen = expandedItem === itemKey
                    return (
                      <div key={i}>
                        <button
                          onClick={() => setExpandedItem(itemOpen ? null : itemKey)}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-all flex items-center gap-3"
                        >
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                            {i + 1}
                          </div>
                          <span className="flex-1 text-sm font-medium text-navy-900">{item.title}</span>
                          <CheckCircle size={14} className="text-gray-200 flex-shrink-0" />
                          {itemOpen ? <ChevronUp size={14} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={14} className="text-gray-300 flex-shrink-0" />}
                        </button>
                        {itemOpen && (
                          <div className="px-4 pb-3 bg-blue-50 text-sm text-blue-800 border-l-4 border-blue-300 ml-4 mr-4 rounded-r-xl rounded-bl-xl mb-2">
                            <div className="py-2">{item.detail}</div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {search && filteredData.every(s => s.items.length === 0) && (
        <div className="text-center py-8 text-gray-400">
          <BookOpen size={32} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">Keine Ergebnisse für "{search}"</p>
        </div>
      )}
    </div>
  )
}
