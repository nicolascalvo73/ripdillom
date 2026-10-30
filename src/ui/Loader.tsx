import { useEffect, useRef, useState } from 'react'
import { useProgress } from '@react-three/drei'
import { useCarga } from '../state/carga'
import '../styles/carga.css'

const BASE = import.meta.env.BASE_URL
const MIN_MS = 1200 // el escaneo tarda al menos esto, aunque todo cargue al toque
const FRASES = [
  'Texturas · luces · pose',
  'Pegando los tatuajes',
  'Planchando el pantalón',
  'Buscando el billete de $100',
  'Peinando el flequillo',
]

/** Porcentaje mostrado: sigue al progreso real pero nunca más rápido que MIN_MS, y no pasa de 99 hasta que la escena esté lista. */
function usePorcentaje(objetivo: number) {
  const [valor, setValor] = useState(0)
  const objetivoRef = useRef(objetivo)
  objetivoRef.current = objetivo

  useEffect(() => {
    let raf = 0
    let ultimo = performance.now()
    const paso = (ahora: number) => {
      const dt = ahora - ultimo
      ultimo = ahora
      setValor((v) => {
        const meta = objetivoRef.current
        if (v >= meta) return v
        return Math.min(meta, v + Math.max(0.15, (meta - v) * 0.08), v + (dt * 100) / MIN_MS)
      })
      raf = requestAnimationFrame(paso)
    }
    raf = requestAnimationFrame(paso)
    return () => cancelAnimationFrame(raf)
  }, [])
  return valor
}

export function Loader() {
  const progreso = useProgress((s) => s.progress)
  const listo = useCarga((s) => s.listo)
  const entro = useCarga((s) => s.entro)
  const entrar = useCarga((s) => s.entrar)
  const pct = usePorcentaje(listo ? 100 : Math.min(progreso, 99))
  const entero = Math.round(pct)
  const termino = listo && entero >= 100

  const [frase, setFrase] = useState(0)
  useEffect(() => {
    if (termino) return
    const id = setInterval(() => setFrase((f) => (f + 1) % FRASES.length), 1400)
    return () => clearInterval(id)
  }, [termino])

  const [fuera, setFuera] = useState(false)
  const boton = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (termino) boton.current?.focus()
  }, [termino])

  if (fuera) return null

  return (
    <div
      className={`carga neb${entro ? ' sale' : ''}`}
      role="dialog"
      aria-label="Cargando"
      onAnimationEnd={(e) => {
        if (e.animationName === 'carga-sale') setFuera(true)
      }}
    >
      {termino && <div className="flash" aria-hidden="true" />}

      <div className="carga-top">
        <span className="chip f-yl">{termino ? 'Listo' : 'Fotocopiando'}</span>
      </div>

      <div className="carga-hoja-zona">
        <div className="hoja-wrap">
          <div className={`hoja sh${termino ? '' : ' copiando'}`}>
            <div className="paper hoja-papel" />
            <div className="hoja-img">
              <img className="fantasma" src={`${BASE}img/muneco-v5-frente.png`} alt="" />
              <img
                className="color"
                src={`${BASE}img/muneco-v5-frente.png`}
                alt="Comuñe armándose"
                style={{ clipPath: `inset(0 0 ${100 - pct}% 0)` }}
              />
              {!termino && <div className="scan" style={{ top: `${pct}%` }} />}
            </div>
            <div className="tape" style={{ left: -18, top: 14, transform: 'rotate(-38deg)' }} />
            <div className="tape pk" style={{ right: -18, bottom: 14, transform: 'rotate(-34deg)' }} />
          </div>

          {termino && (
            <div className="entrar-wrap">
              <div className="tape" style={{ left: -14, top: -10, width: 70, height: 30, transform: 'rotate(-30deg)', zIndex: 2 }} />
              <div className="tape pk" style={{ right: -14, bottom: -10, width: 70, height: 30, transform: 'rotate(-30deg)', zIndex: 2 }} />
              <button ref={boton} className="btn yl entrar" onClick={entrar}>
                ENTRAR
                <span className="entrar-sub">Con sonido · podés silenciarlo</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="carga-pie">
        <div className="pct">
          <div className="fd pct-num">{entero}</div>
          <div className="fd pct-sig">%</div>
        </div>
        <div className="carga-txt" aria-live="polite">
          <div className="lbl">{termino ? 'Comuñe listo' : 'Armando comuñe'}</div>
          <div className="lbl carga-gris">{termino ? 'Todo cargado' : FRASES[frase]}</div>
        </div>
      </div>

      <div
        className="barra"
        role="progressbar"
        aria-valuenow={entero}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progreso de carga"
      >
        <div className="barra-lleno" style={{ width: `${pct}%` }} />
        <div className="barra-marcas" />
      </div>
    </div>
  )
}
