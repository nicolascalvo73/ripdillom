import { useEffect, useRef } from 'react'
import config from '../content/audio.json'
import { useAudio } from '../state/audio'
import { useCarga } from '../state/carga'
import { useEscena } from '../state/escena'
import '../styles/sonido.css'

const BASE = import.meta.env.BASE_URL
const FADE_ENTRADA = 1500
const FADE_MUTE = 200
const FADE_DUCK = 300
const DUCK_PANEL = 0.67 // 0,6 → 0,4 al abrir un panel
const DUCK_EMBED = 0.15

/** Rampa lineal del volumen de un <audio>; devuelve la función que la cancela. */
function rampa(el: HTMLAudioElement, destino: number, ms: number, fin?: () => void) {
  const desde = el.volume
  const t0 = performance.now()
  let raf = 0
  const paso = (t: number) => {
    const k = Math.min(1, (t - t0) / ms)
    el.volume = Math.min(1, Math.max(0, desde + (destino - desde) * k))
    if (k < 1) raf = requestAnimationFrame(paso)
    else fin?.()
  }
  raf = requestAnimationFrame(paso)
  return () => cancelAnimationFrame(raf)
}

/** Audio de fondo: arranca con ENTRAR, loop, mute persistente, ducking con paneles/embeds, pausa al ocultar la pestaña. */
export function Sonido() {
  const entro = useCarga((s) => s.entro)
  const silenciado = useAudio((s) => s.silenciado)
  const alternar = useAudio((s) => s.alternar)
  const embeds = useAudio((s) => s.embeds)
  const hayPanel = useEscena((s) => !!s.zona)

  const el = useRef<HTMLAudioElement | null>(null)
  const cancelar = useRef<() => void>(() => {})
  const sonando = useRef(false) // arrancó alguna vez
  const oculta = useRef(document.hidden)

  const nivel = config.volumen * (embeds > 0 ? DUCK_EMBED : hayPanel ? DUCK_PANEL : 1)

  // un solo efecto decide el estado deseado y lo aplica con la rampa que corresponda
  const ultimo = useRef({ activo: false, nivel: 0 })
  const aplicar = (activo: boolean, objetivo: number, ms: number) => {
    const a = el.current
    if (!a) return
    cancelar.current()
    if (!activo && ms === 0) {
      // pestaña oculta: requestAnimationFrame no corre, se corta directo
      a.pause()
      return
    }
    if (activo) {
      const arrancar = a.paused
      if (arrancar) {
        a.volume = 0
        a.play().catch(() => {})
      }
      cancelar.current = rampa(a, objetivo, arrancar ? FADE_ENTRADA : ms)
    } else {
      cancelar.current = rampa(a, 0, ms, () => a.pause())
    }
  }

  useEffect(() => {
    if (!entro) return
    if (!el.current) {
      const a = new Audio(`${BASE}${config.src}`)
      a.loop = true
      a.preload = 'auto'
      el.current = a
    }
    const activo = !silenciado && !oculta.current
    const prev = ultimo.current
    const ms = !sonando.current ? FADE_ENTRADA : prev.activo !== activo ? FADE_MUTE : FADE_DUCK
    ultimo.current = { activo, nivel }
    if (activo) sonando.current = true
    aplicar(activo, nivel, ms)
  }, [entro, silenciado, nivel])

  useEffect(() => {
    const f = () => {
      oculta.current = document.hidden
      if (!entro) return
      const activo = !silenciado && !document.hidden
      ultimo.current = { activo, nivel }
      // al volver a la pestaña, retoma desde el volumen actual sin pegar un salto
      aplicar(activo, nivel, document.hidden ? 0 : FADE_DUCK)
    }
    document.addEventListener('visibilitychange', f)
    return () => document.removeEventListener('visibilitychange', f)
  }, [entro, silenciado, nivel])

  useEffect(
    () => () => {
      cancelar.current()
      el.current?.pause()
    },
    [],
  )

  if (!entro) return null

  return (
    <div className="sonido" hidden={hayPanel}>
      <button
        className={`mt${silenciado ? ' off' : ''}`}
        aria-pressed={silenciado}
        aria-label={silenciado ? 'Activar sonido' : 'Silenciar sonido'}
        onClick={alternar}
      >
        {!silenciado && <span className="mt-ondas" aria-hidden="true" />}
        <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
          <path d="M3 9 H8 L14 4 V22 L8 17 H3 Z" fill={silenciado ? '#F2EBDD' : '#0D0A0C'} />
          {silenciado ? (
            <path d="M17 9 L23 17 M23 9 L17 17" stroke="#FF2E9A" strokeWidth="2.6" strokeLinecap="square" />
          ) : (
            <>
              <path d="M17 9 Q20 13 17 17" fill="none" stroke="#B80F66" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M20 6 Q25 13 20 20" fill="none" stroke="#B80F66" strokeWidth="2.2" strokeLinecap="round" />
            </>
          )}
        </svg>
      </button>
      <a className="lbl sonido-cred" href={config.url} target="_blank" rel="noopener noreferrer">
        ♪ {config.titulo} — {config.artista}
      </a>
    </div>
  )
}
