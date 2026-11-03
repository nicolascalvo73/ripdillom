import { Component, Fragment, Suspense, useState, type ReactNode } from 'react'
import { useGLTF, useTexture } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Scene } from './scene/Scene'
import { MODEL_URL } from './scene/Muneco'
import { urlsTatuajesBase } from './scene/Tatuajes'
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

// posición del último pointerdown: un arrastre (orbitar, pinch, zoom) no cuenta como "tocar afuera"
const abajo = { x: 0, y: 0 }
window.addEventListener('pointerdown', (e) => ((abajo.x = e.clientX), (abajo.y = e.clientY)), true)

// ?debug=1&az=180 → cámara inicial en ese azimut (grados), para revisar la espalda sin orbitar a mano
const az = DEBUG ? (Number(new URLSearchParams(window.location.search).get('az')) * Math.PI) / 180 : 0
const CAM: [number, number, number] = [3.0 * Math.sin(az), 0.55, 3.0 * Math.cos(az)]

const REINTENTOS = 3
const ESPERA_MS = [1000, 2000, 3000]

/** drei guarda en caché la promesa fallida: hay que borrarla o el reintento relee el mismo error. */
function limpiarCargas() {
  useGLTF.clear(MODEL_URL)
  useTexture.clear(urlsTatuajesBase())
}

/**
 * Si la escena 3D revienta al montar (típico: una descarga que se cortó en el celular) reintenta hasta 3 veces
 * y recién después cae al menú de respaldo, en vez de dejar la pantalla en blanco.
 * Los errores de WebGL no se reintentan: no los arregla volver a pedir los archivos.
 */
class Respaldo3D extends Component<{ children: ReactNode }, { fallo: boolean; intento: number }> {
  state = { fallo: false, intento: 0 }
  timer = 0
  static getDerivedStateFromError() {
    return { fallo: true }
  }
  componentDidCatch(error: unknown) {
    const esWebGL = /webgl/i.test(String((error as Error)?.message ?? error))
    console.error(`Escena 3D caída (intento ${this.state.intento + 1}/${REINTENTOS + 1}):`, error)
    if (esWebGL) return this.setState({ intento: REINTENTOS })
    if (this.state.intento >= REINTENTOS) return
    this.timer = window.setTimeout(() => {
      limpiarCargas()
      this.setState((s) => ({ fallo: false, intento: s.intento + 1 }))
    }, ESPERA_MS[this.state.intento])
  }
  componentWillUnmount() {
    clearTimeout(this.timer)
  }
  render() {
    if (!this.state.fallo) return <Fragment key={this.state.intento}>{this.props.children}</Fragment>
    if (this.state.intento >= REINTENTOS) return <SinWebGL />
    return (
      <>
        <Fondo />
        <p className="lbl" style={{ position: 'relative', zIndex: 6, textAlign: 'center', paddingTop: '45vh' }}>
          Reintentando…
        </p>
      </>
    )
  }
}

function SinWebGL() {
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

export default function App() {
  const [webgl] = useState(hayWebGL)
  if (!webgl) return <SinWebGL />
  return (
    <Respaldo3D>
      <App3D />
    </Respaldo3D>
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
          onPointerMissed={(e) => {
            if (Math.hypot(e.clientX - abajo.x, e.clientY - abajo.y) <= 6) ocultarGlobo()
          }}
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
