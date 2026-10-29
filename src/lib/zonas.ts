import data from '../content/zonas.json'

export type Zona = {
  id: string
  aria: string
  globo: string
  color: 'pk' | 'yl' | 'bn' | 'bk'
  ruta: string
  titulo: string
  ancho?: number
  alto?: number
  caja: { c: [number, number, number]; s: [number, number, number] }
  ancla: [number, number, number]
  cam: { az: number; el: number; dist: number; ms: number; foco: [number, number, number] }
}

export const ZONAS = data as Zona[]

/** La zona de la pierna izquierda abre el modo tatuador (pantalla propia), no un panel. */
export const ID_TATUADOR = 'pierna-izquierda'

export const zonaPorRuta = (pathname: string) =>
  ZONAS.find((z) => pathname === z.ruta || pathname.startsWith(z.ruta + '/')) ?? null

/** Easter egg: no está en ZONAS (no tiene ruta ni entra en la navegación). La caja es solo para el globo y el modo `?zonas=1`; el slip real es un trapecio (ver Zonas.tsx). */
export const EPA: Zona = {
  id: 'epa',
  aria: 'Entrepierna — easter egg',
  globo: '¡EPA!',
  color: 'yl',
  ruta: '',
  titulo: '¡EPA!',
  caja: { c: [0, 0.37, 0.06], s: [0.16, 0.14, 0.12] },
  ancla: [0.02, 0.44, 0.12],
  cam: { az: 0, el: 0, dist: 1, ms: 0, foco: [0, 0.5, 0] },
}
