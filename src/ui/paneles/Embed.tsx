import { useEffect, useState } from 'react'
import { useAudio } from '../../state/audio'

type Props = {
  titulo: string
  /** URL del embed (Spotify / YouTube). Sin URL queda el placeholder del diseño. */
  url: string | null
  alto: number
  etiqueta?: string
}

const iconoPlay = (n: number, color = '#0D0A0C') => (
  <svg width={n} height={n} viewBox="0 0 18 18" aria-hidden="true">
    <path d="M3 1 L16 9 L3 17 Z" fill={color} />
  </svg>
)

/** Embed con carga diferida: no baja nada de Spotify/YouTube hasta que se toca el botón. */
export function Embed({ titulo, url, alto, etiqueta = 'Reproducir' }: Props) {
  const [cargado, setCargado] = useState(false)
  const embedCargado = useAudio((s) => s.embedCargado)
  // mientras haya un embed cargado el fondo baja para que no se pise
  useEffect(() => (cargado && url ? embedCargado() : undefined), [cargado, url, embedCargado])
  if (url && cargado) {
    return (
      <iframe
        className="embed-frame"
        src={url}
        title={titulo}
        height={alto}
        loading="lazy"
        allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    )
  }
  return (
    <div className="ph-box embed" style={{ height: alto }}>
      <button className="btn yl embed-play" aria-label={etiqueta} disabled={!url} onClick={() => setCargado(true)}>
        {iconoPlay(24)}
      </button>
      <span className="chip f-pk embed-et">{titulo}</span>
    </div>
  )
}
