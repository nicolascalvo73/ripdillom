import { useEffect, useRef, useState, type CSSProperties } from 'react'
import musica from '../../content/musica.json'
import { useAudio } from '../../state/audio'
import { cargarYouTube, type YTPlayer } from '../../lib/youtube'
import { useLateral } from '../useLateral'
import '../../styles/musica.css'

const temas = musica.tracklist
const pad = (n: number) => String(n).padStart(2, '0')
const aSegundos = (d: string) => {
  const [m, s] = d.split(':').map(Number)
  return m * 60 + s
}
const mmss = (s: number) => `${Math.floor(s / 60)}:${pad(Math.floor(s % 60))}`
/** fin de cada tema = inicio del siguiente (el último usa su duración) */
const fin = (i: number) => (i < temas.length - 1 ? temas[i + 1].inicio : temas[i].inicio + aSegundos(temas[i].duracion))
const indiceEn = (t: number) => {
  let i = 0
  for (let k = 0; k < temas.length; k++) if (temas[k].inicio <= t + 0.5) i = k
  return i
}

type Estado = 'apagado' | 'cargando' | 'listo' | 'error'

const Barras = ({ n, className }: { n: number; className: string }) => (
  <span className={className} aria-hidden="true">
    {Array.from({ length: n }, (_, i) => (
      <span key={i} style={{ '--i': i } as CSSProperties} />
    ))}
  </span>
)

export function Musica() {
  const lateral = useLateral()
  const host = useRef<HTMLDivElement>(null)
  const player = useRef<YTPlayer | null>(null)
  // a dónde saltar apenas el reproductor esté listo (si se toca un tema mientras carga)
  const pendiente = useRef(0)
  const [estado, setEstado] = useState<Estado>('apagado')
  const [sonando, setSonando] = useState(false)
  const [tiempo, setTiempo] = useState(0)
  const embedCargado = useAudio((s) => s.embedCargado)

  const actual = indiceEn(tiempo)
  const tema = temas[actual]
  const largo = fin(actual) - tema.inicio
  const transcurrido = Math.min(Math.max(0, tiempo - tema.inicio), largo)

  // mientras el reproductor existe, la música de fondo se corre
  useEffect(() => (estado === 'listo' ? embedCargado() : undefined), [estado, embedCargado])

  useEffect(() => {
    if (estado !== 'listo') return
    const id = window.setInterval(() => {
      const p = player.current
      if (p) setTiempo(p.getCurrentTime())
    }, 250)
    return () => window.clearInterval(id)
  }, [estado])

  useEffect(
    () => () => {
      player.current?.destroy()
      player.current = null
    },
    [],
  )

  const encender = (seg: number) => {
    pendiente.current = seg
    setTiempo(seg)
    if (estado === 'cargando') return
    setEstado('cargando')
    cargarYouTube()
      .then((YT) => {
        if (!host.current) return
        player.current?.destroy() // reintento después de un error
        // YouTube reemplaza el nodo que recibe: le damos uno propio para no pisar el de React
        host.current.replaceChildren()
        const el = document.createElement('div')
        host.current.appendChild(el)
        player.current = new YT.Player(el, {
          videoId: musica.youtube.id,
          host: 'https://www.youtube-nocookie.com',
          width: '100%',
          height: '100%',
          playerVars: { autoplay: 1, playsinline: 1, rel: 0, start: Math.floor(seg) },
          events: {
            onReady: (e) => {
              setEstado('listo')
              e.target.seekTo(pendiente.current, true)
              e.target.playVideo()
            },
            onStateChange: (e) => setSonando(e.data === YT.PlayerState.PLAYING || e.data === YT.PlayerState.BUFFERING),
            onError: () => setEstado('error'),
          },
        })
      })
      .catch(() => setEstado('error'))
  }

  const ir = (seg: number) => {
    const p = player.current
    if (p && estado === 'listo') {
      p.seekTo(seg, true)
      p.playVideo()
      setTiempo(seg)
    } else encender(seg)
  }

  const alternar = () => {
    const p = player.current
    if (!p || estado !== 'listo') return encender(tema.inicio)
    if (sonando) p.pauseVideo()
    else p.playVideo()
  }

  // anterior: si ya pasaron 3 s vuelve al principio del tema, como cualquier reproductor
  const anterior = () => ir(transcurrido > 3 || actual === 0 ? tema.inicio : temas[actual - 1].inicio)
  const siguiente = () => actual < temas.length - 1 && ir(temas[actual + 1].inicio)

  const on = estado === 'listo' && sonando

  return (
    <div className={`musica${on ? ' on' : ''}`}>
      <div className="mus-cab">
        <div className="mus-disco">
          <span className="vinilo-riel" aria-hidden="true">
            <span className="vinilo">
              <span className="fd">{musica.sigla}</span>
            </span>
          </span>
          <div className="mus-tapa">
            <span className="fd">{musica.sigla}</span>
          </div>
        </div>
        <div>
          <div className="fd mus-album">{musica.album}</div>
          <div className="lbl">{musica.detalle}</div>
          <div className="mus-chip">
            <span className="chip f-yl">{musica.cantidadTemas}</span>
          </div>
        </div>
      </div>

      <div className="deck">
        <div className="tele">
          <div className="tele-pantalla" ref={host} />
          {estado !== 'listo' && (
            <button
              className="tele-tapa"
              onClick={() => encender(tema.inicio)}
              disabled={estado === 'cargando'}
              aria-label={estado === 'error' ? 'Reintentar cargar el reproductor' : `Reproducir ${tema.nombre}`}
            >
              <span className="estatica" aria-hidden="true" />
              <span className="tele-play" aria-hidden="true">
                <svg width="26" height="26" viewBox="0 0 18 18">
                  <path d="M3 1 L16 9 L3 17 Z" fill="currentColor" />
                </svg>
              </span>
              <span className="chip f-pk tele-et">{estado === 'cargando' ? 'Sintonizando…' : estado === 'error' ? 'Sin señal · reintentar' : 'Encender'}</span>
            </button>
          )}
        </div>

        <div className="deck-info">
          <div className="lbl gris">
            {on ? 'Sonando' : estado === 'listo' ? 'En pausa' : 'Elegí un tema'} · {pad(actual + 1)}/{pad(temas.length)}
          </div>
          <div className="fd deck-tema" key={actual} data-texto={tema.nombre}>
            {tema.nombre}
          </div>
          <Barras n={12} className="eq" />
        </div>

        <div className="deck-ctrl">
          <input
            type="range"
            className="deck-barra"
            min={0}
            max={largo}
            step={1}
            value={transcurrido}
            disabled={estado !== 'listo'}
            aria-label={`Posición en ${tema.nombre}`}
            aria-valuetext={`${mmss(transcurrido)} de ${mmss(largo)}`}
            style={{ '--p': `${(transcurrido / largo) * 100}%` } as CSSProperties}
            onChange={(e) => ir(tema.inicio + Number(e.target.value))}
          />
          <div className="deck-tiempos lbl">
            <span>{mmss(transcurrido)}</span>
            <span>{mmss(largo)}</span>
          </div>
          <div className="deck-botones">
            <button className="btn bn deck-btn" onClick={anterior} aria-label="Tema anterior">
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                <path d="M3 2 H5 V16 H3 Z M16 2 L6 9 L16 16 Z" fill="currentColor" />
              </svg>
            </button>
            <button className="btn yl deck-btn deck-play" onClick={alternar} aria-label={on ? 'Pausar' : 'Reproducir'} disabled={estado === 'cargando'}>
              {on ? (
                <svg width="22" height="22" viewBox="0 0 18 18" aria-hidden="true">
                  <path d="M3 2 H7 V16 H3 Z M11 2 H15 V16 H11 Z" fill="currentColor" />
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 18 18" aria-hidden="true">
                  <path d="M3 1 L16 9 L3 17 Z" fill="currentColor" />
                </svg>
              )}
            </button>
            <button className="btn bn deck-btn" onClick={siguiente} aria-label="Tema siguiente" disabled={actual === temas.length - 1}>
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                <path d="M13 2 H15 V16 H13 Z M2 2 L12 9 L2 16 Z" fill="currentColor" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="lbl sec-et">Tracklist · tocá un tema</div>
      <ol className="lista temas">
        {temas.map((t, i) => {
          const activo = i === actual && estado !== 'apagado'
          return (
            <li key={t.nombre}>
              <button
                className={`row tema${activo ? ' activo' : ''}`}
                aria-current={activo ? 'true' : undefined}
                onClick={() => ir(t.inicio)}
                style={activo ? ({ '--p': `${(transcurrido / largo) * 100}%` } as CSSProperties) : undefined}
              >
                {activo && on ? <Barras n={4} className="eq-mini" /> : <span className="fd num">{pad(i + 1)}</span>}
                <span className="grow nombre">{t.nombre}</span>
                <span className="lbl">{t.duracion}</span>
              </button>
            </li>
          )
        })}
      </ol>

      <a className="btn bn mus-spotify" href={musica.spotify} target="_blank" rel="noopener noreferrer">
        Escuchar en Spotify <span aria-hidden="true">↗</span>
      </a>
      {lateral && <p className="lbl gris esc">Esc para volver</p>}
    </div>
  )
}
