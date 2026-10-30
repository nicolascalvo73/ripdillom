import { Suspense, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { Center, OrbitControls, useGLTF } from '@react-three/drei'

const MODEL_URL = `${import.meta.env.BASE_URL}models/dilloms.opt.glb`

function Modelo() {
  const { scene } = useGLTF(MODEL_URL)
  // el Canvas de la escena ya usa este mismo objeto: acá va una copia
  const copia = useMemo(() => scene.clone(true), [scene])
  return (
    <Center>
      <primitive object={copia} />
    </Center>
  )
}

/** Vista 3D giratoria del muñeco para el detalle del producto. Se carga recién cuando se pide (React.lazy). */
export default function Vista3D() {
  return (
    <Canvas className="vista3d" dpr={[1, 1.5]} camera={{ position: [0, 0, 2.4], fov: 35 }} aria-label="Muñequito en 3D, girá arrastrando">
      <ambientLight intensity={1.1} />
      <directionalLight position={[2, 3, 4]} intensity={2.2} />
      <directionalLight position={[-3, 1, -2]} intensity={0.8} color="#ff2e9a" />
      <Suspense fallback={null}>
        <Modelo />
      </Suspense>
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={3} />
    </Canvas>
  )
}
