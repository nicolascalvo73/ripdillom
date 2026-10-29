import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { Color, Mesh, MeshPhysicalMaterial, MeshStandardMaterial, type Group } from 'three'
import { Tatuajes } from './Tatuajes'
import { Billete } from './Billete'
import { Zonas } from './Zonas'
import { reducirMovimiento } from '../lib/movimiento'
import { bezier } from '../lib/bezier'
import { useEscena } from '../state/escena'

const MODEL_URL = `${import.meta.env.BASE_URL}models/dilloms.opt.glb`

// plástico brillante: clearcoat alto y roughness baja; face_ink queda mate
const PLASTICO: Record<string, { clearcoat: number; roughness: number }> = {
  skin: { clearcoat: 0.8, roughness: 0.38 },
  hair: { clearcoat: 1, roughness: 0.3 },
  pants: { clearcoat: 0.6, roughness: 0.45 },
  shoes: { clearcoat: 1, roughness: 0.25 },
}

// ¡EPA!: sube 22 % del alto de la cabeza (≈0,27) en 140 ms y vuelve en 260 ms con rebote
const SALTO = 0.22 * 0.27
const SUBE_MS = 140
const BAJA_MS = 260
const rebote = bezier(0.3, 1.6, 0.5, 1)

function salto() {
  const t0 = useEscena.getState().epaT
  if (!t0) return 0
  const k = performance.now() - t0
  if (k < SUBE_MS) return SALTO * (1 - (1 - k / SUBE_MS) ** 3)
  if (k < SUBE_MS + BAJA_MS) return SALTO * (1 - rebote((k - SUBE_MS) / BAJA_MS))
  return 0
}

export function Muneco() {
  const { scene } = useGLTF(MODEL_URL) // Meshopt activado por defecto en drei
  const ref = useRef<Group>(null)

  const { skin, pants } = useMemo(() => {
    scene.traverse((o) => {
      if (!(o instanceof Mesh)) return
      const viejo = o.material as MeshStandardMaterial
      if (o.name in PLASTICO) {
        if (viejo instanceof MeshPhysicalMaterial) return // ya convertido (StrictMode / caché de useGLTF)
        o.material = new MeshPhysicalMaterial({ color: new Color(viejo.color), ...PLASTICO[o.name] })
      } else if (o.name === 'face_ink') {
        o.material = new MeshStandardMaterial({ color: new Color(viejo.color), roughness: 1, metalness: 0 })
      }
    })
    return { skin: scene.getObjectByName('skin') as Mesh, pants: scene.getObjectByName('pants') as Mesh }
  }, [scene])

  useFrame(({ clock }) => {
    if (!ref.current) return
    if (reducirMovimiento()) return ref.current.position.set(0, 0, 0)
    // flote suave ±6px en ~4s (en unidades del modelo: la figura mide 1.0)
    ref.current.position.y = Math.sin((clock.elapsedTime / 4) * Math.PI * 2) * 0.012 + salto()
  })

  return (
    <group ref={ref}>
      <primitive object={scene} />
      <Tatuajes skin={skin} />
      <Billete pants={pants} />
      <Zonas />
    </group>
  )
}

useGLTF.preload(MODEL_URL)
