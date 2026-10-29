import { useEffect, useMemo } from 'react'
import { DoubleSide, PlaneGeometry, type Mesh } from 'three'
import { zSuperficie } from './superficie'
import { useTexturaBillete } from './billeteArte'

const LARGO = 0.13
const ANCHO = 0.075

export function Billete({ pants }: { pants: Mesh }) {
  const textura = useTexturaBillete()

  // plano doblado: la parte que asoma se curva hacia afuera
  const geometry = useMemo(() => {
    const g = new PlaneGeometry(ANCHO, LARGO, 4, 12)
    const p = g.attributes.position
    for (let i = 0; i < p.count; i++) {
      const t = (p.getY(i) + LARGO / 2) / LARGO // 0 abajo, 1 arriba
      p.setZ(i, -0.02 * Math.max(0, t - 0.4) ** 2 * 6)
    }
    g.computeVertexNormals()
    return g
  }, [])
  useEffect(() => () => geometry.dispose(), [geometry])

  // bolsillo trasero derecho del comuñe (−x), mirando desde atrás
  const x = -0.07
  const y = 0.36
  const z = zSuperficie(pants, x, y, -1, -0.1)

  return (
    // la cara del plano mira a −z (hacia afuera de la espalda); inclinado: la punta sale del pantalón
    <group position={[x, y + LARGO * 0.18, z - 0.004]} rotation={[0, Math.PI, (-10 * Math.PI) / 180]}>
      <group rotation={[(25 * Math.PI) / 180, 0, 0]}>
        <mesh geometry={geometry}>
          <meshStandardMaterial map={textura} side={DoubleSide} roughness={0.55} />
        </mesh>
      </group>
    </group>
  )
}
