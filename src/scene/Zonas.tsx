import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, useCursor } from '@react-three/drei'
import { ExtrudeGeometry, Shape, Vector3, type Group } from 'three'
import { EPA, ZONAS, type Zona } from '../lib/zonas'
import { irA, useEscena, useTatuando } from '../state/escena'
import { DEBUG } from '../state/tatuajes'

const VER = DEBUG || new URLSearchParams(window.location.search).get('zonas') === '1'
const UMBRAL_TOQUE = 6 // px: más movimiento que esto es arrastre (orbitar), no toque
const GLOBO_TOUCH_MS = 4000
const EPA_GLOBO_MS = 1500
const EPA_COOLDOWN_MS = 600

// tipo del último puntero (mouse / touch / pen); el click de R3F no siempre lo trae
let tipoPuntero = 'mouse'
if (typeof window !== 'undefined') {
  window.addEventListener('pointerdown', (e) => (tipoPuntero = e.pointerType), true)
}

function Hitbox({ zona, inerte }: { zona: Zona; inerte: boolean }) {
  const mostrarGlobo = useEscena((s) => s.mostrarGlobo)
  const ocultarGlobo = useEscena((s) => s.ocultarGlobo)
  const [encima, setEncima] = useState(false)
  useCursor(encima && !DEBUG)

  return (
    <mesh
      position={zona.caja.c}
      // en ?debug=1 las cajas se ven pero no atrapan nada: el modo debug arrastra tatuajes
      raycast={DEBUG || inerte ? () => null : undefined}
      onPointerOver={(e) => {
        if (e.pointerType !== 'mouse' || e.buttons) return
        e.stopPropagation()
        setEncima(true)
        mostrarGlobo(zona.id)
      }}
      onPointerOut={(e) => {
        if (e.pointerType !== 'mouse') return
        setEncima(false)
        ocultarGlobo(zona.id)
      }}
      onClick={(e) => {
        e.stopPropagation()
        if (e.delta > UMBRAL_TOQUE) return
        // táctil: el primer toque muestra el globo, el segundo entra
        if (tipoPuntero !== 'mouse' && useEscena.getState().globo !== zona.id) {
          mostrarGlobo(zona.id, GLOBO_TOUCH_MS)
          return
        }
        ocultarGlobo()
        irA(zona.ruta)
      }}
    >
      <boxGeometry args={zona.caja.s} />
      {VER ? (
        <meshBasicMaterial color="#ff2e9a" wireframe transparent opacity={0.55} depthTest={false} />
      ) : (
        <meshBasicMaterial visible={false} />
      )}
    </mesh>
  )
}

/** Slip: trapecio invertido frontal de la cintura baja (y≈0,443) a y≈0,30, ±0,08 arriba y ±0,03 abajo, solo z>0. Solo tap/click, nunca hover. */
function Epa({ inerte }: { inerte: boolean }) {
  const mostrarGlobo = useEscena((s) => s.mostrarGlobo)
  const rebotar = useEscena((s) => s.rebotar)
  const ultimo = useRef(0)
  const geometria = useMemo(() => {
    const f = new Shape()
    f.moveTo(-0.08, 0.443)
    f.lineTo(0.08, 0.443)
    f.lineTo(0.03, 0.3)
    f.lineTo(-0.03, 0.3)
    f.closePath()
    return new ExtrudeGeometry(f, { depth: 0.14, bevelEnabled: false })
  }, [])
  useEffect(() => () => geometria.dispose(), [geometria])

  return (
    <mesh
      geometry={geometria}
      raycast={DEBUG || inerte ? () => null : undefined}
      onClick={(e) => {
        e.stopPropagation()
        if (e.delta > UMBRAL_TOQUE) return
        const ahora = performance.now()
        if (ahora - ultimo.current < EPA_COOLDOWN_MS) return
        ultimo.current = ahora
        mostrarGlobo(EPA.id, EPA_GLOBO_MS)
        rebotar()
        navigator.vibrate?.(15)
      }}
    >
      {VER ? (
        <meshBasicMaterial color="#f7e92b" wireframe transparent opacity={0.7} depthTest={false} />
      ) : (
        <meshBasicMaterial visible={false} />
      )}
    </mesh>
  )
}

const tmp = new Vector3()
// los globos viven fuera de .stage para quedar por encima del título (ver #globos en App)
const PORTAL = { get current() { return document.getElementById('globos') as HTMLElement } }

/** Globo de cómic anclado a la zona activa. La cola cambia de lado según la mitad de pantalla donde cae. */
function Globo() {
  const id = useEscena((s) => s.globo)
  const zona = id === EPA.id ? EPA : ZONAS.find((z) => z.id === id)
  const grupo = useRef<Group>(null)
  const [cola, setCola] = useState<'bl' | 'br'>('bl')

  useFrame(({ camera }) => {
    if (!grupo.current || !zona) return
    grupo.current.getWorldPosition(tmp).project(camera)
    const lado = tmp.x > 0.1 ? 'br' : 'bl'
    if (lado !== cola) setCola(lado)
  })

  if (!zona) return null
  return (
    <group ref={grupo} position={zona.ancla} key={zona.id}>
      <Html portal={PORTAL} zIndexRange={[25, 20]} style={{ pointerEvents: 'none' }}>
        <div className={`globo globo-${cola}${zona.id === EPA.id ? ' globo-epa' : ''}`}>
          {zona.id === EPA.id && <span className="estallido" aria-hidden="true" />}
          <div className="sh">
            <span className={`bub ${zona.color === 'bn' ? '' : zona.color} t-${cola}`} style={{ '--r': cola === 'bl' ? '4deg' : '-4deg' } as React.CSSProperties}>
              {zona.globo}
            </span>
          </div>
        </div>
      </Html>
    </group>
  )
}

export function Zonas() {
  // en el tatuador el muñeco es lienzo: las zonas no responden
  const inerte = useTatuando()
  // al cambiar de pantalla o perder el puntero, no dejar un globo colgado
  const ocultar = useEscena((s) => s.ocultarGlobo)
  useEffect(() => {
    const f = () => document.hidden && ocultar()
    document.addEventListener('visibilitychange', f)
    return () => document.removeEventListener('visibilitychange', f)
  }, [ocultar])

  return (
    <>
      {ZONAS.map((z) => (
        <Hitbox key={z.id} zona={z} inerte={inerte} />
      ))}
      <Epa inerte={inerte} />
      {!inerte && <Globo />}
    </>
  )
}
