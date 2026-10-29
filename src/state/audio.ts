import { create } from 'zustand'

const CLAVE = 'ripdillom:silenciado'

function leer(): boolean {
  try {
    return localStorage.getItem(CLAVE) === '1'
  } catch {
    return false
  }
}

type Store = {
  silenciado: boolean
  /** cantidad de embeds (Spotify / YouTube) cargados: mientras haya uno, el fondo casi no suena */
  embeds: number
  alternar: () => void
  embedCargado: () => () => void
}

export const useAudio = create<Store>((set) => ({
  silenciado: leer(),
  embeds: 0,
  alternar: () =>
    set((s) => {
      const silenciado = !s.silenciado
      try {
        localStorage.setItem(CLAVE, silenciado ? '1' : '0')
      } catch {
        /* sin storage: la preferencia dura la sesión */
      }
      return { silenciado }
    }),
  /** devuelve la función que lo descuenta (para el cleanup del efecto) */
  embedCargado: () => {
    set((s) => ({ embeds: s.embeds + 1 }))
    return () => set((s) => ({ embeds: Math.max(0, s.embeds - 1) }))
  },
}))
