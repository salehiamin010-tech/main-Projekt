import React, { createContext, useContext, useState, useEffect } from 'react'

const DataContext = createContext(null)

export const CLEANING_PRICES = {
  15: { grund: 49, unterhalt: 35 },
  20: { grund: 59, unterhalt: 39 },
  35: { grund: 79, unterhalt: 55 },
  45: { grund: 95, unterhalt: 65 },
  55: { grund: 109, unterhalt: 75 },
  70: { grund: 129, unterhalt: 85 },
  90: { grund: 159, unterhalt: 99 },
}

export const ALLGEMEINFLAECHEN_PRICES = { 1: 89, 2: 119, 3: 75, 4: 59 }

const INITIAL_APARTMENTS = [
  { id: 'A101', nummer: 'A101', groesse: 35, gebaeude: 1, standort: 'Bornheim', status: 'belegt', letzteReinigung: '2024-05-10', letzterTyp: 'unterhaltsreinigung', naechsteReinigung: '2024-05-24', notizen: '' },
  { id: 'A102', nummer: 'A102', groesse: 45, gebaeude: 1, standort: 'Bornheim', status: 'reinigung_erforderlich', letzteReinigung: '2024-05-01', letzterTyp: 'grundreinigung', naechsteReinigung: '2024-05-17', notizen: '' },
  { id: 'A103', nummer: 'A103', groesse: 20, gebaeude: 1, standort: 'Bornheim', status: 'frei', letzteReinigung: '2024-05-14', letzterTyp: 'grundreinigung', naechsteReinigung: '', notizen: '' },
  { id: 'A104', nummer: 'A104', groesse: 55, gebaeude: 1, standort: 'Bornheim', status: 'in_reinigung', letzteReinigung: '2024-05-08', letzterTyp: 'unterhaltsreinigung', naechsteReinigung: '2024-05-17', notizen: '' },
  { id: 'A201', nummer: 'A201', groesse: 70, gebaeude: 2, standort: 'Bornheim', status: 'belegt', letzteReinigung: '2024-05-12', letzterTyp: 'unterhaltsreinigung', naechsteReinigung: '2024-05-26', notizen: '' },
  { id: 'A202', nummer: 'A202', groesse: 35, gebaeude: 2, standort: 'Bornheim', status: 'gereinigt', letzteReinigung: '2024-05-15', letzterTyp: 'grundreinigung', naechsteReinigung: '', notizen: '' },
  { id: 'A203', nummer: 'A203', groesse: 45, gebaeude: 2, standort: 'Bornheim', status: 'belegt', letzteReinigung: '2024-05-09', letzterTyp: 'unterhaltsreinigung', naechsteReinigung: '2024-05-23', notizen: '' },
  { id: 'A204', nummer: 'A204', groesse: 90, gebaeude: 2, standort: 'Bornheim', status: 'reinigung_erforderlich', letzteReinigung: '2024-05-03', letzterTyp: 'grundreinigung', naechsteReinigung: '2024-05-17', notizen: '' },
  { id: 'B101', nummer: 'B101', groesse: 15, gebaeude: 3, standort: 'Langen', status: 'frei', letzteReinigung: '2024-05-13', letzterTyp: 'unterhaltsreinigung', naechsteReinigung: '', notizen: '' },
  { id: 'B102', nummer: 'B102', groesse: 35, gebaeude: 3, standort: 'Langen', status: 'belegt', letzteReinigung: '2024-05-11', letzterTyp: 'unterhaltsreinigung', naechsteReinigung: '2024-05-25', notizen: '' },
  { id: 'B103', nummer: 'B103', groesse: 55, gebaeude: 3, standort: 'Langen', status: 'belegt', letzteReinigung: '2024-05-07', letzterTyp: 'grundreinigung', naechsteReinigung: '2024-05-21', notizen: '' },
  { id: 'B104', nummer: 'B104', groesse: 20, gebaeude: 3, standort: 'Langen', status: 'gereinigt', letzteReinigung: '2024-05-16', letzterTyp: 'grundreinigung', naechsteReinigung: '', notizen: '' },
  { id: 'B201', nummer: 'B201', groesse: 45, gebaeude: 3, standort: 'Langen', status: 'in_reinigung', letzteReinigung: '2024-05-06', letzterTyp: 'unterhaltsreinigung', naechsteReinigung: '2024-05-17', notizen: '' },
  { id: 'C101', nummer: 'C101', groesse: 70, gebaeude: 4, standort: 'Oberursel', status: 'belegt', letzteReinigung: '2024-05-10', letzterTyp: 'unterhaltsreinigung', naechsteReinigung: '2024-05-24', notizen: '' },
  { id: 'C102', nummer: 'C102', groesse: 35, gebaeude: 4, standort: 'Oberursel', status: 'belegt', letzteReinigung: '2024-05-08', letzterTyp: 'unterhaltsreinigung', naechsteReinigung: '2024-05-22', notizen: '' },
  { id: 'C103', nummer: 'C103', groesse: 45, gebaeude: 4, standort: 'Oberursel', status: 'reinigung_erforderlich', letzteReinigung: '2024-05-02', letzterTyp: 'grundreinigung', naechsteReinigung: '2024-05-17', notizen: '' },
  { id: 'C104', nummer: 'C104', groesse: 90, gebaeude: 4, standort: 'Oberursel', status: 'frei', letzteReinigung: '2024-05-14', letzterTyp: 'grundreinigung', naechsteReinigung: '', notizen: '' },
  { id: 'C201', nummer: 'C201', groesse: 55, gebaeude: 4, standort: 'Oberursel', status: 'belegt', letzteReinigung: '2024-05-09', letzterTyp: 'unterhaltsreinigung', naechsteReinigung: '2024-05-23', notizen: '' },
  { id: 'C202', nummer: 'C202', groesse: 20, gebaeude: 4, standort: 'Oberursel', status: 'gereinigt', letzteReinigung: '2024-05-15', letzterTyp: 'unterhaltsreinigung', naechsteReinigung: '', notizen: '' },
  { id: 'C203', nummer: 'C203', groesse: 15, gebaeude: 4, standort: 'Oberursel', status: 'belegt', letzteReinigung: '2024-05-11', letzterTyp: 'unterhaltsreinigung', naechsteReinigung: '2024-05-25', notizen: '' },
]

const today = new Date().toISOString().slice(0, 10)

const INITIAL_AUFTRAEGE = [
  { id: 'AUF001', apartmentId: 'A101', typ: 'unterhaltsreinigung', status: 'erledigt', datum: '2024-05-10', uhrzeit: '09:00', mitarbeiterId: 'MA001', preis: 55, dauer: 90, qualitaet: 4, notizen: 'Alles gut', fotos: [] },
  { id: 'AUF002', apartmentId: 'A102', typ: 'grundreinigung', status: 'erledigt', datum: '2024-05-11', uhrzeit: '10:00', mitarbeiterId: 'MA002', preis: 95, dauer: 120, qualitaet: 5, notizen: '', fotos: [] },
  { id: 'AUF003', apartmentId: 'A104', typ: 'unterhaltsreinigung', status: 'in_bearbeitung', datum: today, uhrzeit: '08:00', mitarbeiterId: 'MA001', preis: 75, dauer: 0, qualitaet: 0, notizen: '', fotos: [] },
  { id: 'AUF004', apartmentId: 'A201', typ: 'unterhaltsreinigung', status: 'geplant', datum: today, uhrzeit: '11:00', mitarbeiterId: 'MA002', preis: 85, dauer: 0, qualitaet: 0, notizen: '', fotos: [] },
  { id: 'AUF005', apartmentId: 'A204', typ: 'grundreinigung', status: 'geplant', datum: today, uhrzeit: '13:00', mitarbeiterId: 'MA003', preis: 159, dauer: 0, qualitaet: 0, notizen: '', fotos: [] },
  { id: 'AUF006', apartmentId: 'B101', typ: 'unterhaltsreinigung', status: 'erledigt', datum: '2024-05-13', uhrzeit: '09:00', mitarbeiterId: 'MA001', preis: 35, dauer: 60, qualitaet: 5, notizen: '', fotos: [] },
  { id: 'AUF007', apartmentId: 'B201', typ: 'unterhaltsreinigung', status: 'in_bearbeitung', datum: today, uhrzeit: '10:00', mitarbeiterId: 'MA003', preis: 65, dauer: 0, qualitaet: 0, notizen: '', fotos: [] },
  { id: 'AUF008', apartmentId: 'C101', typ: 'unterhaltsreinigung', status: 'geplant', datum: today, uhrzeit: '14:00', mitarbeiterId: 'MA001', preis: 85, dauer: 0, qualitaet: 0, notizen: '', fotos: [] },
  { id: 'AUF009', apartmentId: 'C103', typ: 'grundreinigung', status: 'geplant', datum: today, uhrzeit: '15:00', mitarbeiterId: 'MA002', preis: 95, dauer: 0, qualitaet: 0, notizen: '', fotos: [] },
  { id: 'AUF010', apartmentId: 'A202', typ: 'treppenhaus', status: 'erledigt', datum: '2024-05-15', uhrzeit: '07:00', mitarbeiterId: 'MA002', preis: 89, dauer: 75, qualitaet: 4, notizen: '', fotos: [] },
]

const INITIAL_MITARBEITER = [
  { id: 'MA001', name: 'Maria Müller', typ: 'Minijobber', telefon: '0176-1234567', email: 'maria@mainexo.de', stundenMonat: 42, qualitaetsScore: 4.7, verfuegbarkeit: ['Mo', 'Di', 'Mi', 'Do', 'Fr'], notizen: 'Sehr zuverlässig', aktiv: true },
  { id: 'MA002', name: 'Ahmed Hassan', typ: 'Midijobber', telefon: '0177-9876543', email: 'ahmed@mainexo.de', stundenMonat: 68, qualitaetsScore: 4.5, verfuegbarkeit: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'], notizen: 'Erfahren in Grundreinigung', aktiv: true },
  { id: 'MA003', name: 'Lisa Schmidt', typ: 'Minijobber', telefon: '0178-5551234', email: 'lisa@mainexo.de', stundenMonat: 35, qualitaetsScore: 4.8, verfuegbarkeit: ['Di', 'Do', 'Fr', 'Sa'], notizen: 'Neu seit April 2024', aktiv: true },
]

const INITIAL_KUNDEN = [
  { id: 'KD001', name: 'homefortimes', ansprechpartner: 'Monica Flauto', typ: 'Ferienwohnungen', email: 'monica@homefortimes.de', telefon: '069-1234567', adresse: 'Bockenheimer Anlage 44, 60322 Frankfurt', startDatum: '2024-03-01', monatsumsatz: 1850, qualitaetsScore: 4.8, status: 'aktiv', notizen: 'Hauptkunde' },
  { id: 'KD002', name: 'Arztpraxis Mustermann', ansprechpartner: 'Dr. Mustermann', typ: 'Gewerbe', email: 'praxis@mustermann.de', telefon: '069-9876543', adresse: 'Goethestraße 15, 60313 Frankfurt', startDatum: '2024-04-15', monatsumsatz: 420, qualitaetsScore: 4.6, status: 'aktiv', notizen: 'Hygiene-Standards beachten' },
]

const INITIAL_RECHNUNGEN = [
  {
    id: 'REC001', kundeId: 'KD001', monat: '2024-04', status: 'bezahlt',
    positionen: [
      { datum: '2024-04-03', apartment: 'A101', groesse: 35, typ: 'unterhaltsreinigung', preis: 55 },
      { datum: '2024-04-05', apartment: 'A102', groesse: 45, typ: 'grundreinigung', preis: 95 },
      { datum: '2024-04-08', apartment: 'A201', groesse: 70, typ: 'unterhaltsreinigung', preis: 85 },
      { datum: '2024-04-10', apartment: 'A103', groesse: 20, typ: 'grundreinigung', preis: 59 },
      { datum: '2024-04-12', apartment: 'A104', groesse: 55, typ: 'unterhaltsreinigung', preis: 75 },
      { datum: '2024-04-01', apartment: 'Geb. 1 Treppenhaus', groesse: 0, typ: 'treppenhaus', preis: 0 },
    ],
    rabattEinfuehrung: 5, rabattVolumen: 0, allgemeinflaechenGratis: true,
    netto: 358.85, mwst: 68.18, gesamt: 427.03,
    erstelltAm: '2024-05-01', bezahltAm: '2024-05-05',
  },
  {
    id: 'REC002', kundeId: 'KD001', monat: '2024-05', status: 'offen',
    positionen: [
      { datum: '2024-05-01', apartment: 'A101', groesse: 35, typ: 'unterhaltsreinigung', preis: 55 },
      { datum: '2024-05-03', apartment: 'A202', groesse: 35, typ: 'grundreinigung', preis: 79 },
      { datum: '2024-05-07', apartment: 'B103', groesse: 55, typ: 'unterhaltsreinigung', preis: 75 },
      { datum: '2024-05-10', apartment: 'A101', groesse: 35, typ: 'unterhaltsreinigung', preis: 55 },
      { datum: '2024-05-01', apartment: 'Geb. 1 Treppenhaus', groesse: 0, typ: 'treppenhaus', preis: 89 },
    ],
    rabattEinfuehrung: 5, rabattVolumen: 0, allgemeinflaechenGratis: false,
    netto: 320.65, mwst: 60.92, gesamt: 381.57,
    erstelltAm: '2024-05-16', bezahltAm: null,
  },
]

function loadFromStorage(key, initial) {
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : initial
  } catch {
    return initial
  }
}

export function DataProvider({ children }) {
  const [apartments, setApartments] = useState(() => loadFromStorage('mc_apartments', INITIAL_APARTMENTS))
  const [auftraege, setAuftraege] = useState(() => loadFromStorage('mc_auftraege', INITIAL_AUFTRAEGE))
  const [mitarbeiter, setMitarbeiter] = useState(() => loadFromStorage('mc_mitarbeiter', INITIAL_MITARBEITER))
  const [kunden, setKunden] = useState(() => loadFromStorage('mc_kunden', INITIAL_KUNDEN))
  const [rechnungen, setRechnungen] = useState(() => loadFromStorage('mc_rechnungen', INITIAL_RECHNUNGEN))

  useEffect(() => { localStorage.setItem('mc_apartments', JSON.stringify(apartments)) }, [apartments])
  useEffect(() => { localStorage.setItem('mc_auftraege', JSON.stringify(auftraege)) }, [auftraege])
  useEffect(() => { localStorage.setItem('mc_mitarbeiter', JSON.stringify(mitarbeiter)) }, [mitarbeiter])
  useEffect(() => { localStorage.setItem('mc_kunden', JSON.stringify(kunden)) }, [kunden])
  useEffect(() => { localStorage.setItem('mc_rechnungen', JSON.stringify(rechnungen)) }, [rechnungen])

  const addAuftrag = (auftrag) => {
    const newId = 'AUF' + String(auftraege.length + 1).padStart(3, '0')
    setAuftraege(prev => [...prev, { ...auftrag, id: newId, fotos: [] }])
  }

  const updateAuftrag = (id, updates) => {
    setAuftraege(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a))
  }

  const addApartment = (apartment) => {
    const newId = apartment.nummer
    setApartments(prev => [...prev, { ...apartment, id: newId }])
  }

  const updateApartment = (id, updates) => {
    setApartments(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a))
  }

  const addMitarbeiter = (ma) => {
    const newId = 'MA' + String(mitarbeiter.length + 1).padStart(3, '0')
    setMitarbeiter(prev => [...prev, { ...ma, id: newId }])
  }

  const updateMitarbeiter = (id, updates) => {
    setMitarbeiter(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m))
  }

  const addRechnung = (rechnung) => {
    const newId = 'REC' + String(rechnungen.length + 1).padStart(3, '0')
    setRechnungen(prev => [...prev, { ...rechnung, id: newId }])
  }

  const updateRechnung = (id, updates) => {
    setRechnungen(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r))
  }

  return (
    <DataContext.Provider value={{
      apartments, addApartment, updateApartment,
      auftraege, addAuftrag, updateAuftrag,
      mitarbeiter, addMitarbeiter, updateMitarbeiter,
      kunden, setKunden,
      rechnungen, addRechnung, updateRechnung,
    }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  return useContext(DataContext)
}
