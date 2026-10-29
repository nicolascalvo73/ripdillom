import { create } from 'zustand'

type Store = {
  /** la escena 3D ya compiló y dibujó (no solo descargó) */
  listo: boolean
  /** el usuario tocó ENTRAR */
  entro: boolean
  marcarListo: () => void
  entrar: () => void
}

export const useCarga = create<Store>((set) => ({
  listo: false,
  entro: false,
  marcarListo: () => set({ listo: true }),
  entrar: () => set({ entro: true }),
}))
