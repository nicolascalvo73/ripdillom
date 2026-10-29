import { useEffect, useRef } from 'react'
import { AnimatePresence, motion, useDragControls, type PanInfo } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useEscena } from '../state/escena'
import { ID_TATUADOR } from '../lib/zonas'
import { useLateral } from './useLateral'
import { Musica, Videos, Redes, Shows, QuienSoy } from './paneles/Secciones'
import { reducirMovimiento } from '../lib/movimiento'
import '../styles/panel.css'
import '../styles/contenido.css'
import '../styles/tienda.css'
import { Merch } from './paneles/Merch'
import { Aporte } from './paneles/Aporte'

const CONTENIDO: Record<string, () => React.JSX.Element> = {
  cabeza: Musica,
  pecho: Videos,
  'brazo-derecho': Redes,
  'brazo-izquierdo': Shows,
  'pierna-derecha': QuienSoy,
  espalda: Merch,
  billete: Aporte,
}

/** Panel de sección: bottom sheet en celu vertical, lateral en el resto. El tatuador tiene su propia pantalla. */
export function Panel() {
  const zonaRuta = useEscena((s) => s.zona)
  const zona = zonaRuta?.id === ID_TATUADOR ? null : zonaRuta
  const lateral = useLateral()
  const navigate = useNavigate()
  const cerrar = () => navigate('/')
  const cerrarRef = useRef<HTMLButtonElement>(null)
  const arrastre = useDragControls()
  const quieto = reducirMovimiento()

  useEffect(() => {
    if (!zona) return
    const f = (e: KeyboardEvent) => e.key === 'Escape' && navigate('/')
    window.addEventListener('keydown', f)
    return () => window.removeEventListener('keydown', f)
  }, [zona, navigate])

  // el foco entra al panel al abrirlo
  const abierto = !!zona
  useEffect(() => {
    if (abierto) cerrarRef.current?.focus({ preventScroll: true })
  }, [abierto])

  const alSoltar = (_: unknown, i: PanInfo) => {
    if (i.offset.y > 80 || i.velocity.y > 500) cerrar() // >80 px o >0,5 px/ms
  }

  const Contenido = zona ? CONTENIDO[zona.id] : undefined
  const entrada = lateral ? { x: '100%' } : { y: '100%' }
  const dur = quieto ? 0.2 : 0.42

  return (
    <AnimatePresence>
      {zona && (
        <motion.aside
          key="panel"
          className={`panel ${lateral ? 'panel-lat' : 'panel-sheet'}`}
          style={lateral ? { width: `min(${zona.ancho ?? 520}px, 100vw)` } : { height: `min(${zona.alto ?? 544}px, calc(100dvh - 64px))` }}
          role="dialog"
          aria-label={zona.titulo}
          initial={quieto ? { opacity: 0 } : entrada}
          animate={quieto ? { opacity: 1 } : { x: 0, y: 0 }}
          exit={quieto ? { opacity: 0, transition: { duration: 0.2 } } : { ...entrada, transition: { duration: 0.28, ease: 'easeIn' } }}
          transition={{ duration: dur, ease: [0.2, 0.9, 0.2, 1] }}
          drag={lateral ? false : 'y'}
          dragControls={arrastre}
          dragListener={false}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0, bottom: 0.4 }}
          onDragEnd={alSoltar}
        >
          <div className="panel-borde">
            <div className="paper panel-hoja">
              {!lateral && <span className="asa" aria-hidden="true" />}
              {!lateral && <div className="asa-zona" onPointerDown={(e) => arrastre.start(e)} aria-hidden="true" />}
              <header className="ph" onPointerDown={lateral ? undefined : (e) => arrastre.start(e)}>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.h2
                    key={zona.id}
                    initial={{ opacity: 0, scale: 1.08 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    {zona.titulo}
                  </motion.h2>
                </AnimatePresence>
                <button ref={cerrarRef} className="btn bk volver" aria-label="Volver al comuñe" onClick={cerrar}>
                  ← Volver
                </button>
              </header>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={zona.id}
                  className="panel-cuerpo"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  {Contenido ? <Contenido /> : <p className="lbl vacio">[«{zona.titulo}» — llega en una fase próxima]</p>}
                </motion.div>
              </AnimatePresence>
              <div className="panel-fade" aria-hidden="true" />
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
