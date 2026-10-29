import { create } from 'zustand'
import base from '../content/tatuajes.json'

export type Tatuaje = {
  id: string
  nombre: string
  file: string
  x: number
  y: number
  alto: number
  /** giro en el plano de la piel, radianes */
  rot?: number
  espejo?: boolean
  /** false = en la paleta, no sobre el comuñe */
  puesto?: boolean
}

export type Modo = 'mover' | 'rotar' | 'escalar'

export const DEBUG = new URLSearchParams(window.location.search).get('debug') === '1'

const BASE = base as Tatuaje[]
const KEY = 'ripdillom:tatuajes:v1'
const MAX_HISTORIAL = 40

const num = (v: unknown, def: number, min: number, max: number) =>
  typeof v === 'number' && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : def

/** Lo guardado en este dispositivo, validado campo por campo (el localStorage puede traer cualquier cosa). */
function leerGuardado(): Tatuaje[] | null {
  if (DEBUG) return null // el modo debug exporta las posiciones base: no mezclar con lo guardado
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const arr: unknown = JSON.parse(raw)
    if (!Array.isArray(arr)) return null
    return BASE.map((b) => {
      const s = arr.find((a) => a && typeof a === 'object' && (a as Tatuaje).id === b.id) as Partial<Tatuaje> | undefined
      if (!s) return b
      return {
        ...b,
        x: num(s.x, b.x, -0.3, 0.3),
        y: num(s.y, b.y, 0, 1.1),
        alto: num(s.alto, b.alto, 0.01, 0.2),
        rot: num(s.rot, 0, -Math.PI * 2, Math.PI * 2),
        espejo: s.espejo === true,
        puesto: s.puesto !== false,
      }
    })
  } catch {
    return null
  }
}

type Store = {
  items: Tatuaje[]
  selected: string | null
  modo: Modo
  historial: Tatuaje[][]
  select: (id: string | null) => void
  patch: (id: string, p: Partial<Tatuaje>) => void
  setModo: (m: Modo) => void
  /** guarda una foto del estado para poder deshacer (llamar antes de cada edición) */
  commit: () => void
  deshacer: () => void
  colocar: (id: string) => void
  borrar: () => void
  espejar: () => void
  guardar: () => boolean
  reset: () => void
}

export const useTatuajes = create<Store>((set, get) => ({
  items: leerGuardado() ?? BASE,
  selected: null,
  modo: 'mover',
  historial: [],
  select: (selected) => set({ selected }),
  patch: (id, p) => set((s) => ({ items: s.items.map((t) => (t.id === id ? { ...t, ...p } : t)) })),
  setModo: (modo) => set({ modo }),
  commit: () => set((s) => ({ historial: [...s.historial.slice(-(MAX_HISTORIAL - 1)), s.items] })),
  deshacer: () =>
    set((s) => {
      const previo = s.historial[s.historial.length - 1]
      if (!previo) return s
      return { items: previo, historial: s.historial.slice(0, -1) }
    }),
  colocar: (id) => {
    const b = BASE.find((t) => t.id === id)
    if (!b) return
    get().commit()
    set((s) => ({ items: s.items.map((t) => (t.id === id ? { ...b, puesto: true } : t)), selected: id }))
  },
  borrar: () => {
    const id = get().selected
    if (!id) return
    get().commit()
    set((s) => ({ items: s.items.map((t) => (t.id === id ? { ...t, puesto: false } : t)), selected: null }))
  },
  espejar: () => {
    const id = get().selected
    if (!id) return
    get().commit()
    set((s) => ({ items: s.items.map((t) => (t.id === id ? { ...t, espejo: !t.espejo } : t)) }))
  },
  guardar: () => {
    try {
      localStorage.setItem(KEY, JSON.stringify(get().items))
      return true
    } catch {
      return false
    }
  },
  reset: () => {
    try {
      localStorage.removeItem(KEY)
    } catch {
      /* sin storage: no pasa nada */
    }
    set({ items: BASE, selected: null, historial: [], modo: 'mover' })
  },
}))
