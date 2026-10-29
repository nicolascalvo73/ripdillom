import { useEffect, useMemo, useState } from 'react'
import { useThree } from '@react-three/fiber'
import { Line, useTexture } from '@react-three/drei'
import {
  Euler, Mesh, MultiplyBlending, Raycaster, SRGBColorSpace, Vector2, Vector3,
  TextureLoader, type BufferGeometry, type Texture,
} from 'three'
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { DecalGeometry } from 'three/examples/jsm/geometries/DecalGeometry.js'
import { zSuperficie } from './superficie'
import { DEBUG, useTatuajes, type Tatuaje } from '../state/tatuajes'
import { useTatuando } from '../state/escena'
import { registrarFuente } from '../lib/captura'

const BASE = `${import.meta.env.BASE_URL}tatuajes/`
const ray = new Raycaster()
// el decal tocado en este pointerdown (lo marca el listener de R3F; ver `down` en Arrastre)
let pressed = false

/** Genera el decal en el espacio del comuñe en reposo (ignora el flote del grupo padre). */
function buildDecal(skin: Mesh, t: Tatuaje, aspect: number): BufferGeometry {
  const z = zSuperficie(skin, t.x, t.y, 1, 0.1)
  const saved = skin.matrixWorld.clone()
  skin.matrixWorld.copy(skin.matrix)
  const g = new DecalGeometry(skin, new Vector3(t.x, t.y, z), new Euler(0, 0, t.rot ?? 0), new Vector3(t.alto * aspect, t.alto, 0.08))
  skin.matrixWorld.copy(saved)
  if (t.espejo) {
    const uv = g.attributes.uv
    for (let i = 0; i < uv.count; i++) uv.setX(i, 1 - uv.getX(i))
    uv.needsUpdate = true
  }
  return g
}

function Decal({ skin, t, map, editable }: { skin: Mesh; t: Tatuaje; map: Texture; editable: boolean }) {
  const img = map.image as { width: number; height: number }
  const aspect = img.width / img.height
  const geometry = useMemo(
    () => buildDecal(skin, t, aspect),
    [skin, t.x, t.y, t.alto, t.rot, t.espejo, aspect], // eslint-disable-line react-hooks/exhaustive-deps
  )
  useEffect(() => () => geometry.dispose(), [geometry])
  const select = useTatuajes((s) => s.select)
  const selected = useTatuajes((s) => s.selected === t.id)

  return (
    <>
      <mesh
        geometry={geometry}
        renderOrder={2}
        onPointerDown={
          editable
            ? (e) => {
                e.stopPropagation()
                pressed = true
                select(t.id)
              }
            : undefined
        }
      >
        {/* multiplica sobre la piel: la línea negra queda como tinta, el transparente no toca nada */}
        <meshBasicMaterial
          map={map}
          transparent
          premultipliedAlpha
          blending={MultiplyBlending}
          depthWrite={false}
          polygonOffset
          polygonOffsetFactor={-4}
          color={selected && editable ? '#ff2e9a' : '#ffffff'}
        />
      </mesh>
      {selected && editable && <Marco skin={skin} t={t} aspect={aspect} />}
    </>
  )
}

/** Tatuaje subido: la textura sale del data URL, se carga de forma asíncrona y el decal aparece cuando está lista. */
function DecalPropio({ skin, t, editable }: { skin: Mesh; t: Tatuaje; editable: boolean }) {
  const [map, setMap] = useState<Texture | null>(null)
  useEffect(() => {
    let vivo = true
    let tex: Texture | null = null
    new TextureLoader().load(t.file, (m) => {
      if (!vivo) return m.dispose()
      m.colorSpace = SRGBColorSpace
      m.anisotropy = 8
      tex = m
      setMap(m)
    })
    return () => {
      vivo = false
      tex?.dispose()
    }
  }, [t.file])
  return map ? <Decal skin={skin} t={t} map={map} editable={editable} /> : null
}

/** Contorno punteado amarillo del tatuaje elegido (se oculta al sacar la foto). */
function Marco({ skin, t, aspect }: { skin: Mesh; t: Tatuaje; aspect: number }) {
  const z = useMemo(() => zSuperficie(skin, t.x, t.y, 1, 0.1) + 0.006, [skin, t.x, t.y])
  const puntos = useMemo(() => {
    const w = (t.alto * aspect) / 2 + 0.006
    const h = t.alto / 2 + 0.006
    return [new Vector3(-w, -h, 0), new Vector3(w, -h, 0), new Vector3(w, h, 0), new Vector3(-w, h, 0), new Vector3(-w, -h, 0)]
  }, [t.alto, aspect])
  return (
    <group name="marco-seleccion" position={[t.x, t.y, z]} rotation={[0, 0, t.rot ?? 0]} renderOrder={5}>
      <Line points={puntos} color="#f7e92b" lineWidth={2} dashed dashSize={0.008} gapSize={0.005} depthTest={false} transparent />
    </group>
  )
}

/**
 * Arrastrar el tatuaje elegido sobre la piel (modo mover) o girarlo / escalarlo arrastrando de costado.
 * Rueda: tamaño (Alt + rueda: giro). En ?debug=1 solo se mueve, y el tamaño va con Shift + rueda.
 */
function Arrastre({ skin }: { skin: Mesh }) {
  const { gl, camera, controls } = useThree()

  useEffect(() => {
    const el = gl.domElement
    const st = useTatuajes.getState
    let dragging = false
    let ultimoX = 0
    const ndc = new Vector2()
    const orbit = () => controls as unknown as OrbitControls | null

    const down = (e: PointerEvent) => {
      const x = e.clientX
      // R3F marca `pressed` en su propio listener; según el orden de los listeners puede correr antes o después
      // de este, así que se decide recién cuando terminó de despacharse el evento
      setTimeout(() => {
        const { selected, modo, commit } = st()
        const m = DEBUG ? 'mover' : modo
        const tocoDecal = pressed
        pressed = false
        if (!selected || (m === 'mover' && !tocoDecal)) return
        commit()
        dragging = true
        ultimoX = x
        const c = orbit()
        if (c) c.enabled = false
      }, 0)
    }
    const move = (e: PointerEvent) => {
      const { selected: id, modo, items, patch } = st()
      if (!dragging || !id) return
      const m = DEBUG ? 'mover' : modo
      if (m === 'mover') {
        const r = el.getBoundingClientRect()
        ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
        ray.setFromCamera(ndc, camera)
        const hit = ray.intersectObject(skin, false)[0]
        if (hit) patch(id, { x: +hit.point.x.toFixed(3), y: +hit.point.y.toFixed(3) })
        return
      }
      const t = items.find((i) => i.id === id)
      if (!t) return
      const dx = e.clientX - ultimoX
      ultimoX = e.clientX
      if (m === 'rotar') patch(id, { rot: +((t.rot ?? 0) + dx * 0.012).toFixed(3) })
      else patch(id, { alto: +Math.min(0.2, Math.max(0.01, t.alto * Math.exp(dx * 0.006))).toFixed(3) })
    }
    const up = () => {
      if (!dragging) return
      dragging = false
      const c = orbit()
      // en el tatuador la órbita queda apagada (la maneja la cámara); en debug se devuelve
      if (c && DEBUG) c.enabled = true
    }
    const wheel = (e: WheelEvent) => {
      const { selected, items, patch, commit } = st()
      const t = items.find((i) => i.id === selected)
      if (!t) return
      if (DEBUG) {
        if (!e.shiftKey) return
        e.preventDefault()
        patch(t.id, { alto: +Math.max(0.01, t.alto * (e.deltaY < 0 ? 1.06 : 0.94)).toFixed(3) })
        return
      }
      e.preventDefault()
      commit()
      if (e.altKey) patch(t.id, { rot: +((t.rot ?? 0) + (e.deltaY < 0 ? 0.08 : -0.08)).toFixed(3) })
      else patch(t.id, { alto: +Math.min(0.2, Math.max(0.01, t.alto * (e.deltaY < 0 ? 1.06 : 0.94))).toFixed(3) })
    }
    // el decal captura pointerdown (R3F) y recién después llega el evento nativo a este listener
    el.addEventListener('pointerdown', down)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
    el.addEventListener('wheel', wheel, { passive: false })
    return () => {
      el.removeEventListener('pointerdown', down)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
      el.removeEventListener('wheel', wheel)
    }
  }, [gl, camera, controls, skin])

  return null
}

/** Le da al modo tatuador el canvas para sacar la foto (render + copia en el mismo tick, sin el marco de selección). */
function Captura() {
  const { gl, scene, camera } = useThree()
  useEffect(() => {
    registrarFuente(() => {
      const marco = scene.getObjectByName('marco-seleccion')
      const visible = marco?.visible
      if (marco) marco.visible = false
      gl.render(scene, camera)
      const copia = document.createElement('canvas')
      copia.width = gl.domElement.width
      copia.height = gl.domElement.height
      copia.getContext('2d')?.drawImage(gl.domElement, 0, 0)
      if (marco) marco.visible = visible ?? true
      return copia
    })
    return () => registrarFuente(null)
  }, [gl, scene, camera])
  return null
}

export function Tatuajes({ skin }: { skin: Mesh }) {
  const items = useTatuajes((s) => s.items)
  const tatuando = useTatuando()
  const editable = DEBUG || tatuando
  // todas las texturas en una sola suspensión (el orden de `items` no cambia: solo se editan sus campos)
  // los subidos por la persona van aparte: sumar uno no re-suspende la paleta base
  const base = useMemo(() => items.filter((t) => !t.propio), [items])
  const propios = items.filter((t) => t.propio && t.puesto !== false)
  const maps = useTexture(base.map((t) => BASE + t.file), (tex) => {
    for (const m of Array.isArray(tex) ? tex : [tex]) {
      m.colorSpace = SRGBColorSpace
      m.anisotropy = 8
    }
  })
  return (
    <>
      {base.map((t, i) => (t.puesto === false ? null : <Decal key={t.id} skin={skin} t={t} map={maps[i]} editable={editable} />))}
      {propios.map((t) => (
        <DecalPropio key={t.id} skin={skin} t={t} editable={editable} />
      ))}
      {editable && <Arrastre skin={skin} />}
      <Captura />
    </>
  )
}
