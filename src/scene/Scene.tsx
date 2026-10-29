import { OrbitControls, Environment, Lightformer, PerformanceMonitor } from '@react-three/drei'
import { Muneco } from './Muneco'
import { Camara } from './Camara'
import { Particulas } from './Particulas'
import { AUTO, useCalidad } from '../state/calidad'

// El comuñe mide 1.0, pies en y=0: el centro visual está a media altura.
const TARGET: [number, number, number] = [0, 0.5, 0]

export function Scene() {
  const bajar = useCalidad((s) => s.bajar)
  return (
    <>
      {/* < 45 fps durante ~2 s: apaga partículas, luego semitono, luego baja el pixel ratio */}
      {AUTO && <PerformanceMonitor bounds={() => [45, 240]} ms={250} iterations={8} onDecline={bajar} />}
      <ambientLight intensity={0.35} />
      {/* key */}
      <directionalLight position={[1.6, 2.2, 2.4]} intensity={2.2} />
      {/* rim rosa y amarillo para integrar con la paleta */}
      <directionalLight position={[-2.2, 1.2, -1.6]} intensity={2.6} color="#ff2e9a" />
      <directionalLight position={[2.2, 0.6, -1.8]} intensity={1.8} color="#f7e92b" />

      {/* mapa de entorno chico, generado en código (sin descargar nada) */}
      <Environment resolution={64} frames={1}>
        <Lightformer form="rect" intensity={2} position={[0, 3, 3]} scale={[6, 2, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#ff2e9a" position={[-4, 1, -1]} scale={[3, 4, 1]} />
        <Lightformer form="rect" intensity={1} color="#f7e92b" position={[4, 1, -1]} scale={[3, 4, 1]} />
      </Environment>

      <Particulas />
      <Muneco />

      <OrbitControls
        makeDefault
        target={TARGET}
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minDistance={0.9}
        maxDistance={3.6}
        minPolarAngle={Math.PI * 0.2}
        maxPolarAngle={Math.PI * 0.72}
        rotateSpeed={0.8}
      />
      <Camara />
    </>
  )
}
