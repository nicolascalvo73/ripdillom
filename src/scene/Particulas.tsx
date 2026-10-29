import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { CircleGeometry, Color, Object3D, PlaneGeometry, Shape, ShapeGeometry, Vector3, type BufferGeometry, type Group, type InstancedMesh, type PerspectiveCamera } from 'three'
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { useCalidad } from '../state/calidad'
import { reducirMovimiento } from '../lib/movimiento'
import { useTexturaBillete } from './billeteArte'

type Def = {
  geo: 'punto' | 'confeti' | 'billete' | 'estrella'
  n: number
  /** parallax: cuánto se mueve la capa al girar, relativo a un objeto fijo en el mundo (polvo .2×, confeti .5×, billetes y estrellas .9×) */
  k: number
  /** distancia a la cámara; siempre detrás del comuñe (la cámara llega a 3,6) */
  d: number
  /** tamaño relativo al alto visible a esa distancia */
  w: number
  h: number
  colores: string[]
  opacidad: number
  /** giro propio, rad/s */
  giro: number
  /** amplitud de la deriva, relativa al alto visible */
  deriva: number
}

const DEFS: Def[] = [
  { geo: 'punto', n: 70, k: 0.2, d: 9, w: 0.007, h: 0.007, colores: ['#f2ebdd'], opacidad: 0.75, giro: 0, deriva: 0.012 },
  { geo: 'confeti', n: 36, k: 0.5, d: 7, w: 0.02, h: 0.009, colores: ['#ff2e9a', '#f7e92b'], opacidad: 1, giro: 1.1, deriva: 0.02 },
  { geo: 'billete', n: 7, k: 0.9, d: 5.5, w: 0.05, h: 0.094, colores: ['#ffffff'], opacidad: 1, giro: 0.25, deriva: 0.03 },
  { geo: 'estrella', n: 8, k: 0.9, d: 5.5, w: 0.05, h: 0.05, colores: ['#f7e92b', '#ff2e9a'], opacidad: 0.95, giro: 0.45, deriva: 0.03 },
]

function estrella() {
  const s = new Shape()
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? 0.2 : 0.5
    const a = Math.PI / 2 + (i * Math.PI) / 5
    const x = Math.cos(a) * r
    const y = Math.sin(a) * r
    if (i === 0) s.moveTo(x, y)
    else s.lineTo(x, y)
  }
  return new ShapeGeometry(s)
}

function geometria(g: Def['geo']): BufferGeometry {
  if (g === 'punto') return new CircleGeometry(0.5, 8)
  if (g === 'estrella') return estrella()
  return new PlaneGeometry(1, 1)
}

// PRNG con semilla: el mismo cielo en cada carga
function mulberry32(a: number) {
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

type Item = { bx: number; by: number; fase: number; ciclo: number; rot: number; tam: number }

const tmp = new Object3D()
const dir = new Vector3()

/**
 * Polvo, confeti, billetes y estrellas detrás del comuñe, en 3 capas con parallax.
 * Las capas viven en el espacio de la cámara (la acompañan) y se corren según el azimut/elevación acumulados,
 * así que nunca se acaban al girar: dan la vuelta (wrap).
 */
export function Particulas() {
  const activa = useCalidad((s) => s.nivel < 1)
  if (!activa) return null
  return <Cielo />
}

function Cielo() {
  const grupo = useRef<Group>(null)
  const mallas = useRef<(InstancedMesh | null)[]>([])
  const { controls } = useThree()
  const billete = useTexturaBillete()
  const orient = useRef({ az: 0, el: 0, azPrev: null as number | null })

  const capas = useMemo(
    () =>
      DEFS.map((def, i) => {
        const r = mulberry32(1000 + i * 77)
        const items: Item[] = Array.from({ length: def.n }, () => ({
          bx: r(),
          by: r(),
          fase: r() * Math.PI * 2,
          ciclo: 12 + r() * 8,
          rot: r() * Math.PI * 2,
          tam: 0.7 + r() * 0.6,
        }))
        const cols = items.map(() => def.colores[Math.floor(r() * def.colores.length)])
        return { def, items, cols, geo: geometria(def.geo) }
      }),
    [],
  )

  useEffect(
    () => () => capas.forEach((c) => c.geo.dispose()),
    [capas],
  )

  // colores por instancia (una sola vez)
  useEffect(() => {
    capas.forEach((c, i) => {
      const m = mallas.current[i]
      if (!m) return
      const col = new Color()
      c.cols.forEach((hex, j) => m.setColorAt(j, col.set(hex)))
      if (m.instanceColor) m.instanceColor.needsUpdate = true
    })
  }, [capas])

  useFrame(({ camera, clock, size }) => {
    const g = grupo.current
    if (!g) return
    const cam = camera as PerspectiveCamera
    g.position.copy(cam.position)
    g.quaternion.copy(cam.quaternion)

    // azimut acumulado (sin saltos en ±π) y elevación de la cámara alrededor del comuñe
    const target = (controls as unknown as OrbitControls | null)?.target
    dir.copy(cam.position)
    if (target) dir.sub(target)
    const len = dir.length() || 1
    const az = Math.atan2(dir.x, dir.z)
    const o = orient.current
    if (o.azPrev !== null) {
      let d = az - o.azPrev
      if (d > Math.PI) d -= Math.PI * 2
      else if (d < -Math.PI) d += Math.PI * 2
      o.az += d
    }
    o.azPrev = az
    o.el = Math.asin(dir.y / len)

    const quieto = reducirMovimiento()
    const t = quieto ? 0 : clock.elapsedTime
    const aspecto = size.width / size.height
    const tanMitad = Math.tan((cam.fov * Math.PI) / 360)

    capas.forEach((c, i) => {
      const m = mallas.current[i]
      if (!m) return
      const { def, items } = c
      const altoVis = 2 * def.d * tanMitad
      const margen = 0.08 * altoVis
      const W = altoVis * aspecto + margen * 2
      const H = altoVis + margen * 2
      const dx = quieto ? 0 : -o.az * def.k * def.d
      const dy = quieto ? 0 : o.el * def.k * def.d

      for (let j = 0; j < items.length; j++) {
        const it = items[j]
        const f = (t / it.ciclo) * Math.PI * 2 + it.fase
        const x = ((((it.bx * W + dx + Math.sin(f) * def.deriva * altoVis) % W) + W) % W) - W / 2
        const y = ((((it.by * H + dy + Math.cos(f * 0.8) * def.deriva * altoVis) % H) + H) % H) - H / 2
        tmp.position.set(x, y, -def.d)
        tmp.rotation.set(0, 0, it.rot + t * def.giro * (j % 2 ? 1 : -1) * (0.6 + it.tam * 0.4))
        tmp.scale.set(def.w * altoVis * it.tam, def.h * altoVis * it.tam, 1)
        tmp.updateMatrix()
        m.setMatrixAt(j, tmp.matrix)
      }
      m.instanceMatrix.needsUpdate = true
    })
  })

  return (
    <group ref={grupo}>
      {capas.map((c, i) => (
        <instancedMesh
          key={i}
          ref={(m) => {
            mallas.current[i] = m
          }}
          args={[c.geo, undefined, c.def.n]}
          frustumCulled={false}
          renderOrder={-1}
        >
          <meshBasicMaterial transparent opacity={c.def.opacidad} depthWrite={false} toneMapped={false} map={c.def.geo === 'billete' ? billete : null} />
        </instancedMesh>
      ))}
    </group>
  )
}
