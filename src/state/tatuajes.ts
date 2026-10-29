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
  /** subido por la persona: `file` es un data URL PNG */
  propio?: boolean
}

export const MAX_PROPIOS = 6
const PREFIJO_PNG = 'data:image/png;base64,'

/** URL para mostrar el tatuaje (los de la paleta viven en /tatuajes, los propios van embebidos). */
export const srcTatuaje = (t: Tatuaje) => (t.propio ? t.file : `${import.meta.env.BASE_URL}tatuajes/${t.file}`)

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
    const propios: Tatuaje[] = arr
      .filter((a): a is Tatuaje => !!a && typeof a === 'object' && (a as Tatuaje).propio === true && typeof (a as Tatuaje).file === 'string')
      .filter((a) => a.file.startsWith(PREFIJO_PNG) && a.file.length < 600_000 && typeof a.id === 'string')
      .slice(0, MAX_PROPIOS)
      .map((s, i) => ({
        id: s.id,
        nombre: typeof s.nombre === 'string' ? s.nombre.slice(0, 40) : `Mi tatuaje ${i + 1}`,
        file: s.file,
        propio: true,
        x: num(s.x, 0, -0.3, 0.3),
        y: num(s.y, 0.6, 0, 1.1),
        alto: num(s.alto, 0.05, 0.01, 0.2),
        rot: num(s.rot, 0, -Math.PI * 2, Math.PI * 2),
        espejo: s.espejo === true,
        puesto: s.puesto !== false,
      }))
    const base = BASE.map((b) => {
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
    return [...base, ...propios]
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
  /** suma un tatuaje subido (data URL PNG) ya puesto sobre el comuñe; false si se llegó al máximo */
  agregarPropio: (dataUrl: string) => boolean
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
    const propio = get().items.find((t) => t.id === id && t.propio)
    const b = propio ? { ...propio, x: 0, y: 0.6, alto: 0.05, rot: 0, espejo: false } : BASE.find((t) => t.id === id)
    if (!b) return
    get().commit()
    set((s) => ({ items: s.items.map((t) => (t.id === id ? { ...b, puesto: true } : t)), selected: id }))
  },
  agregarPropio: (dataUrl) => {
    const n = get().items.filter((t) => t.propio).length
    if (n >= MAX_PROPIOS) return false
    get().commit()
    const id = `propio-${Date.now().toString(36)}`
    const nuevo: Tatuaje = { id, nombre: `Mi tatuaje ${n + 1}`, file: dataUrl, propio: true, x: 0, y: 0.6, alto: 0.05, puesto: true }
    set((s) => ({ items: [...s.items, nuevo], selected: id }))
    return true
  },
  borrar: () => {
    const id = get().selected
    if (!id) return
    get().commit()
    set((s) => ({
      items: s.items.flatMap((t) => (t.id !== id ? [t] : t.propio ? [] : [{ ...t, puesto: false }])),
      selected: null,
    }))
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
