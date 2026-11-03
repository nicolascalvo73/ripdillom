import { useEffect, useRef, useState, type CSSProperties } from 'react'
import videos from '../../content/videos.json'
import { reducirMovimiento } from '../../lib/movimiento'
import { useLateral } from '../useLateral'
import '../../styles/videos.css'

type Clip = (typeof videos.clips)[number]

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
const fecha = (iso: string) => new Date(`${iso}T12:00:00`)
const corta = (iso: string) => {
  const d = fecha(iso)
  return `${MESES[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`
}
const larga = (iso: string) => {
  const d = fecha(iso)
  return `${d.getDate()} ${MESES[d.getMonth()]} ${d.getFullYear()}`
}

// línea de tiempo del más viejo al más nuevo; la edad del muñeco (0 = bebé, 1 = adulto) sale de la fecha real
const cronologico = [...videos.clips].reverse()
const t0 = fecha(cronologico[0].fecha).getTime()
const t1 = fecha(cronologico[cronologico.length - 1].fecha).getTime()
const edad = (c: Clip) => (fecha(c.fecha).getTime() - t0) / (t1 - t0)
const etapa = (k: number) => (k < 0.2 ? 'Bebé' : k < 0.5 ? 'Pibe' : k < 0.8 ? 'Adolescente' : 'Adulto')

const lerp = (a: number, b: number, k: number) => a + (b - a) * k
/** px de pantalla por unidad del dibujo: el adulto mide ~160 px y el bebé ~110 */
const ESCALA = 1.15

/**
 * Silueta del comuñe armada con formas simples. Con la edad cambian las proporciones:
 * de bebé cabeza grande y piernas cortas, de adulto como el muñeco del home.
 */
function Silueta({ k }: { k: number }) {
  const pierna = lerp(12, 46, k)
  const torso = lerp(24, 40, k)
  const cabeza = lerp(19, 15.5, k) // radio
  const anchoTorso = lerp(36, 44, k)
  const brazo = lerp(20, 38, k)
  const zapato = 5
  const cadera = 7
  const alto = zapato + pierna + cadera + torso + 2 + cabeza * 2 + 5

  const piso = alto
  const yPierna = piso - zapato - pierna
  const yCadera = yPierna - cadera
  const yTorso = yCadera - torso
  const yCabeza = yTorso - 2 - cabeza // centro
  const xT = 50 - anchoTorso / 2

  return (
    <svg className="silueta" viewBox={`12 0 76 ${alto}`} width={76 * ESCALA} height={alto * ESCALA} aria-hidden="true">
      <g fill="currentColor">
        {/* zapatos */}
        <rect x={50 - 17} y={piso - zapato} width={15} height={zapato} rx={2.5} />
        <rect x={50 + 2} y={piso - zapato} width={15} height={zapato} rx={2.5} />
        {/* piernas y cadera */}
        <rect x={50 - 15} y={yPierna} width={13} height={pierna + 1} rx={2} />
        <rect x={50 + 2} y={yPierna} width={13} height={pierna + 1} rx={2} />
        <rect x={50 - 17} y={yCadera} width={34} height={cadera + 1} rx={2} />
        {/* torso y brazos con la mano en C */}
        <path d={`M${xT + 3} ${yTorso} H${xT + anchoTorso - 3} L${50 + 17} ${yCadera + 1} H${50 - 17} Z`} />
        <rect x={xT - 6} y={yTorso + 1} width={10} height={brazo} rx={5} transform={`rotate(8 ${xT - 1} ${yTorso + 1})`} />
        <rect x={xT + anchoTorso - 4} y={yTorso + 1} width={10} height={brazo} rx={5} transform={`rotate(-8 ${xT + anchoTorso + 1} ${yTorso + 1})`} />
        <circle cx={xT - 1 - Math.sin(0.14) * brazo} cy={yTorso + 1 + brazo + 2} r={5.5} />
        <circle cx={xT + anchoTorso + 1 + Math.sin(0.14) * brazo} cy={yTorso + 1 + brazo + 2} r={5.5} />
        {/* cabeza y pelo tipo casco con flequillo recto */}
        <rect x={50 - 5} y={yTorso - 4} width={10} height={6} />
        <rect x={50 - cabeza * 0.92} y={yCabeza - cabeza} width={cabeza * 1.84} height={cabeza * 2} rx={cabeza * 0.8} />
        <path
          d={`M${50 - cabeza * 1.12} ${yCabeza + cabeza * 0.15}
              C${50 - cabeza * 1.2} ${yCabeza - cabeza * 1.5} ${50 + cabeza * 1.2} ${yCabeza - cabeza * 1.5} ${50 + cabeza * 1.12} ${yCabeza + cabeza * 0.15}
              L${50 + cabeza * 1.12} ${yCabeza + cabeza * 0.55} L${50 + cabeza * 0.8} ${yCabeza + cabeza * 0.55}
              L${50 + cabeza * 0.8} ${yCabeza - cabeza * 0.25} L${50 - cabeza * 0.8} ${yCabeza - cabeza * 0.25}
              L${50 - cabeza * 0.8} ${yCabeza + cabeza * 0.55} L${50 - cabeza * 1.12} ${yCabeza + cabeza * 0.55} Z`}
        />
      </g>
    </svg>
  )
}

const miniatura = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`

export function Videos() {
  const lateral = useLateral()
  // arranca en el más nuevo (el último de la línea de tiempo)
  const [sel, setSel] = useState(cronologico.length - 1)
  const [reproduciendo, setReproduciendo] = useState(false)
  const pista = useRef<HTMLOListElement>(null)
  const primera = useRef(true)
  const clip = cronologico[sel]
  const k = edad(clip)

  // la silueta elegida queda centrada en la línea de tiempo
  useEffect(() => {
    const el = pista.current?.children[sel] as HTMLElement | undefined
    el?.scrollIntoView({ behavior: primera.current || reducirMovimiento() ? 'auto' : 'smooth', inline: 'center', block: 'nearest' })
    primera.current = false
  }, [sel])

  const elegir = (i: number) => {
    if (i < 0 || i >= cronologico.length) return
    setSel(i)
  }

  return (
    <div className="videos">
      <div className="vid-tele">
        {reproduciendo ? (
          // YouTube necesita scripts, popups y su propio origen: un sandbox lo rompe
          // oxlint-disable-next-line react/iframe-missing-sandbox
          <iframe
            key={clip.id}
            className="vid-frame"
            src={`https://www.youtube-nocookie.com/embed/${clip.id}?autoplay=1&rel=0&playsinline=1`}
            title={`${clip.titulo} — ${clip.detalle}`}
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <button className="vid-poster" key={clip.id} onClick={() => setReproduciendo(true)} aria-label={`Reproducir ${clip.titulo}`}>
            <img src={miniatura(clip.id)} alt="" loading="lazy" />
            <span className="vid-play" aria-hidden="true">
              <svg width="26" height="26" viewBox="0 0 18 18">
                <path d="M3 1 L16 9 L3 17 Z" fill="currentColor" />
              </svg>
            </span>
          </button>
        )}
      </div>

      <div className="vid-ficha" key={clip.id}>
        <div className="grow">
          <div className="fd vid-titulo">{clip.titulo}</div>
          <div className="lbl gris">
            {clip.detalle} · {larga(clip.fecha)}
          </div>
        </div>
        <span className="chip f-yl vid-etapa">{etapa(k)}</span>
      </div>

      <div className="vid-nav">
        <button className="btn bn" onClick={() => elegir(sel - 1)} disabled={sel === 0} aria-label="Video más viejo">
          ← Antes
        </button>
        <span className="lbl gris">
          {sel + 1} / {cronologico.length}
        </span>
        <button className="btn bn" onClick={() => elegir(sel + 1)} disabled={sel === cronologico.length - 1} aria-label="Video más nuevo">
          Después →
        </button>
      </div>

      <div className="lbl sec-et">
        Cómo fue creciendo · {corta(cronologico[0].fecha)} → {corta(cronologico[cronologico.length - 1].fecha)}
      </div>
      <div className="crecer">
        <ol className="crecer-pista" ref={pista}>
          {cronologico.map((c, i) => {
            const anio = fecha(c.fecha).getFullYear()
            const nuevoAnio = i === 0 || fecha(cronologico[i - 1].fecha).getFullYear() !== anio
            return (
              <li key={c.id} className={nuevoAnio ? 'anio-nuevo' : undefined} data-anio={anio} style={{ '--i': i } as CSSProperties}>
                <button
                  className={`hito${i === sel ? ' sel' : ''}`}
                  onClick={() => {
                    elegir(i)
                    setReproduciendo(true)
                  }}
                  aria-current={i === sel ? 'true' : undefined}
                  aria-label={`${c.titulo}, ${larga(c.fecha)}`}
                >
                  <span className="hito-marca">
                    <span className="hito-fecha">{corta(c.fecha)}</span>
                  </span>
                  <Silueta k={edad(c)} />
                  <span className="hito-titulo">{c.titulo}</span>
                </button>
              </li>
            )
          })}
        </ol>
      </div>

      <a className="btn red vid-canal" href={videos.canal} target="_blank" rel="noopener noreferrer">
        <span>Ver el canal</span>
        <span className="lbl">YouTube ↗</span>
      </a>
      {lateral && <p className="lbl gris esc">Esc para volver</p>}
    </div>
  )
}
