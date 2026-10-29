import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { PerspectiveCamera, Vector3 } from 'three'
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { useEscena } from '../state/escena'
import { bezier } from '../lib/bezier'
import { esLateral, esTatuadorAncho } from '../lib/layout'
import { reducirMovimiento } from '../lib/movimiento'
import { ID_TATUADOR, type Zona } from '../lib/zonas'

/** Distancia del encuadre completo (1,0): las `dist` de zonas.json son relativas a esta. */
export const DIST_BASE = 3
const RAD = Math.PI / 180
const ease = bezier(0.7, 0, 0.2, 1)

type Pose = { az: number; el: number; dist: number; foco: Vector3; ox: number; oy: number }

const TAU = Math.PI * 2
const delta = (a: number, b: number) => ((((b - a + Math.PI) % TAU) + TAU) % TAU) - Math.PI

/** El comuñe se corre para dejar lugar al panel: arriba en mobile (−22 % del alto), a la izquierda en desktop (−18 % del ancho). */
function desplazamiento() {
  return esLateral() ? { ox: 0.18, oy: 0 } : { ox: 0, oy: 0.22 }
}

/** Tatuador: cuerpo entero, de frente, sin panel que lo tape. En celu el comuñe sube un poco para dejar lugar a la barra de abajo. */
function poseTatuador(): Pose {
  const ancho = esTatuadorAncho()
  return { az: 0, el: 3 * RAD, dist: (ancho ? 0.8 : 0.9) * DIST_BASE, foco: new Vector3(0, ancho ? 0.5 : 0.39, 0), ox: 0, oy: 0 }
}

function poseDeZona(z: Zona): Pose {
  if (z.id === ID_TATUADOR) return poseTatuador()
  const { ox, oy } = desplazamiento()
  return { az: z.cam.az * RAD, el: z.cam.el * RAD, dist: z.cam.dist * DIST_BASE, foco: new Vector3(...z.cam.foco), ox, oy }
}

/**
 * Vuelo de cámara al abrir/cerrar un panel y giro de 180° del chip "↻ Girá".
 * Mientras hay panel abierto, los controles de órbita quedan apagados (el comuñe no se mueve debajo del panel).
 */
export function Camara() {
  const { camera, controls, size, invalidate } = useThree()
  const zona = useEscena((s) => s.zona)
  const giros = useEscena((s) => s.giros)
  const setAtras = useEscena((s) => s.setAtras)

  const previa = useRef<Pose | null>(null) // pose antes de abrir el primer panel
  const vuelo = useRef<{ desde: Pose; hasta: Pose; t0: number; ms: number } | null>(null)
  const off = useRef({ ox: 0, oy: 0 })
  const atras = useRef(false)
  const girosPrevios = useRef(giros)
  const v = useRef(new Vector3())

  const orbit = () => controls as unknown as OrbitControls | null

  const poseActual = (): Pose => {
    const c = orbit()
    const foco = c ? c.target.clone() : new Vector3(0, 0.5, 0)
    const d = v.current.copy(camera.position).sub(foco)
    const dist = d.length()
    return {
      az: Math.atan2(d.x, d.z),
      el: Math.asin(d.y / dist),
      dist,
      foco,
      ox: off.current.ox,
      oy: off.current.oy,
    }
  }

  const volarA = (hasta: Pose, ms: number) => {
    vuelo.current = { desde: poseActual(), hasta, t0: performance.now(), ms: reducirMovimiento() ? 0 : ms }
    const c = orbit()
    if (c) c.enabled = false
    invalidate()
  }

  // abrir / cambiar / cerrar panel
  const primera = useRef(true)
  useEffect(() => {
    const inicial = primera.current
    primera.current = false
    if (inicial && !zona) return
    if (zona) {
      previa.current ??= poseActual()
      // entrada directa por URL: sin vuelo, ya en la pose del panel
      volarA(poseDeZona(zona), inicial ? 0 : zona.cam.ms)
    } else if (previa.current) {
      const p = previa.current
      previa.current = null
      volarA({ ...p, ox: 0, oy: 0 }, 600)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zona])

  // chip "↻ Girá": media vuelta alrededor del comuñe
  useEffect(() => {
    if (giros === girosPrevios.current) return
    girosPrevios.current = giros
    const p = poseActual()
    volarA({ ...p, az: p.az + Math.PI }, 700)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [giros])

  useFrame(() => {
    const c = orbit()
    const f = vuelo.current
    if (f && c) {
      const k = f.ms === 0 ? 1 : Math.min(1, (performance.now() - f.t0) / f.ms)
      const e = ease(k)
      const { desde: a, hasta: b } = f
      const az = a.az + delta(a.az, b.az) * e
      const el = a.el + (b.el - a.el) * e
      const dist = a.dist + (b.dist - a.dist) * e
      c.target.lerpVectors(a.foco, b.foco, e)
      const h = dist * Math.cos(el)
      camera.position.set(c.target.x + h * Math.sin(az), c.target.y + dist * Math.sin(el), c.target.z + h * Math.cos(az))
      off.current.ox = a.ox + (b.ox - a.ox) * e
      off.current.oy = a.oy + (b.oy - a.oy) * e
      c.update()
      if (k >= 1) {
        vuelo.current = null
        c.enabled = !useEscena.getState().zona
      }
    }

    // view offset: corre el encuadre sin tocar la cámara (y sigue al tamaño del canvas)
    const cam = camera as PerspectiveCamera
    const { ox, oy } = off.current
    if (ox !== 0 || oy !== 0) {
      cam.setViewOffset(size.width, size.height, ox * size.width, oy * size.height, size.width, size.height)
    } else if (cam.view?.enabled) {
      cam.clearViewOffset()
    }

    // ¿la cámara mira al comuñe desde atrás?
    const detras = camera.position.z - (c?.target.z ?? 0) < 0
    if (detras !== atras.current) {
      atras.current = detras
      setAtras(detras)
    }
  })

  return null
}
