import { create } from 'zustand'

const CLAVE = 'ripdillom:carrito'

export type Linea = { id: string; variante?: string; cant: number }

function leer(): Linea[] {
  try {
    const v = JSON.parse(localStorage.getItem(CLAVE) ?? '[]')
    return Array.isArray(v) ? v.filter((l) => l && typeof l.id === 'string' && l.cant > 0) : []
  } catch {
    return []
  }
}

function guardar(lineas: Linea[]) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(lineas))
  } catch {
    /* sin storage: el carrito dura la sesión */
  }
}

const igual = (a: Linea, id: string, variante?: string) => a.id === id && a.variante === variante

type Store = {
  lineas: Linea[]
  agregar: (id: string, variante: string | undefined, cant: number) => void
  cambiar: (id: string, variante: string | undefined, delta: number) => void
  quitar: (id: string, variante?: string) => void
  vaciar: () => void
}

export const useCarrito = create<Store>((set) => {
  const aplicar = (f: (l: Linea[]) => Linea[]) =>
    set((s) => {
      const lineas = f(s.lineas)
      guardar(lineas)
      return { lineas }
    })
  return {
    lineas: leer(),
    agregar: (id, variante, cant) =>
      aplicar((l) =>
        l.some((x) => igual(x, id, variante))
          ? l.map((x) => (igual(x, id, variante) ? { ...x, cant: Math.min(99, x.cant + cant) } : x))
          : [...l, { id, variante, cant }],
      ),
    cambiar: (id, variante, delta) =>
      aplicar((l) =>
        l.map((x) => (igual(x, id, variante) ? { ...x, cant: Math.min(99, x.cant + delta) } : x)).filter((x) => x.cant > 0),
      ),
    quitar: (id, variante) => aplicar((l) => l.filter((x) => !igual(x, id, variante))),
    vaciar: () => aplicar(() => []),
  }
})
