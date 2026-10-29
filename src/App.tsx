import { Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Scene } from './scene/Scene'
import { DebugPanel } from './ui/DebugPanel'
import { Loader } from './ui/Loader'
import { Listo } from './scene/Listo'
import { DEBUG } from './state/tatuajes'
import { Panel } from './ui/Panel'
import { ChipGira } from './ui/ChipGira'
import { NavRespaldo } from './ui/NavRespaldo'
import { RutaSync } from './ui/RutaSync'
import { useEscena, useTatuando } from './state/escena'
import { Tatuador } from './ui/Tatuador'
import { useCalidad } from './state/calidad'
import { Fondo } from './ui/Fondo'
import { Sonido } from './ui/Sonido'
import { Pie } from './ui/Pie'
import { MenuSinWebGL } from './ui/MenuSinWebGL'
import { hayWebGL } from './lib/webgl'

// ?debug=1&az=180 → cámara inicial en ese azimut (grados), para revisar la espalda sin orbitar a mano
const az = DEBUG ? (Number(new URLSearchParams(window.location.search).get('az')) * Math.PI) / 180 : 0
const CAM: [number, number, number] = [3.0 * Math.sin(az), 0.55, 3.0 * Math.cos(az)]

export default function App() {
  const [webgl] = useState(hayWebGL)
  if (webgl) return <App3D />
  return (
    <>
      <RutaSync />
      <Fondo />
      <MenuSinWebGL />
      <Panel />
      <Pie />
    </>
  )
}

function App3D() {
  const hayPanel = useEscena((s) => !!s.zona)
  const tatuando = useTatuando()
  const ocultarGlobo = useEscena((s) => s.ocultarGlobo)
  const tope = useCalidad((s) => (s.nivel >= 3 ? 1.5 : window.innerWidth < 768 ? 1.5 : 2))
  return (
    <>
      <RutaSync />
      <Fondo />
      <div className="stage">
        <Canvas
          dpr={[1, Math.min(window.devicePixelRatio, tope)]}
          camera={{ fov: 32, position: CAM, near: 0.05, far: 50 }}
          gl={{ antialias: true, alpha: true }}
          onPointerMissed={() => ocultarGlobo()}
        >
          <Suspense fallback={null}>
            <Scene />
            <Listo />
          </Suspense>
        </Canvas>
      </div>
      <div id="globos" />
      <Loader />
      <DebugPanel />
      <ChipGira />
      <NavRespaldo />
      <Sonido />
      <Panel />
      <Tatuador />
      <Pie />
      <div className="hud" data-panel={hayPanel ? '' : undefined} data-tatuador={tatuando ? '' : undefined}>
        <h1 className="fd title">Dillom</h1>
        <p className="lbl hint">Arrastrá para girar · tocá el comuñe</p>
        <div className="fd strap">
          <span>La nueva violencia</span>
        </div>
      </div>
    </>
  )
}
