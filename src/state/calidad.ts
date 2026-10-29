import { create } from 'zustand'

/**
 * Nivel de degradación automática (si el FPS cae): 0 = todo · 1 = sin partículas · 2 = sin semitono · 3 = pixel ratio 1,5.
 * `?calidad=N` fija el nivel y apaga la degradación automática (útil para revisar cada estado).
 */
const fijo = new URLSearchParams(window.location.search).get('calidad')
const inicial = fijo === null ? 0 : Math.min(3, Math.max(0, Number(fijo) || 0))

export const AUTO = fijo === null

type Store = {
  nivel: number
  bajar: () => void
}

let ultimo = 0

export const useCalidad = create<Store>((set, get) => ({
  nivel: inicial,
  bajar: () => {
    const ahora = performance.now()
    if (!AUTO || ahora - ultimo < 2000 || get().nivel >= 3) return
    ultimo = ahora
    set((s) => ({ nivel: s.nivel + 1 }))
  },
}))
