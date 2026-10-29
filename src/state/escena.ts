import { create } from 'zustand'
import { ID_TATUADOR, type Zona } from '../lib/zonas'

type Store = {
  /** zona cuyo panel está abierto (sale de la ruta) */
  zona: Zona | null
  /** zona con el globo de cómic visible */
  globo: string | null
  /** la cámara está del lado de la espalda del comuñe */
  atras: boolean
  /** cada incremento le pide a la cámara un giro de 180° */
  giros: number
  /** instante (performance.now) del último ¡EPA!; 0 = nunca */
  epaT: number
  setZona: (z: Zona | null) => void
  mostrarGlobo: (id: string, ms?: number) => void
  ocultarGlobo: (id?: string) => void
  setAtras: (v: boolean) => void
  girar: () => void
  rebotar: () => void
}

let timer: ReturnType<typeof setTimeout> | undefined

export const useEscena = create<Store>((set, get) => ({
  zona: null,
  globo: null,
  atras: false,
  giros: 0,
  epaT: 0,
  setZona: (zona) => set({ zona, globo: null }),
  mostrarGlobo: (id, ms) => {
    clearTimeout(timer)
    set({ globo: id })
    if (ms) timer = setTimeout(() => get().ocultarGlobo(id), ms)
  },
  ocultarGlobo: (id) => {
    if (id && get().globo !== id) return
    clearTimeout(timer)
    set({ globo: null })
  },
  setAtras: (atras) => set({ atras }),
  girar: () => set((s) => ({ giros: s.giros + 1 })),
  rebotar: () => set({ epaT: performance.now() }),
}))

/** `navigate` de React Router, para que el Canvas (otro árbol de React) pueda navegar. */
let navegar: (to: string) => void = () => {}
export const registrarNavegar = (fn: (to: string) => void) => {
  navegar = fn
}
export const irA = (to: string) => navegar(to)

/** ¿Está abierto el modo tatuador? */
export const useTatuando = () => useEscena((s) => s.zona?.id === ID_TATUADOR)
