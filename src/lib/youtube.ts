/** Carga diferida de la IFrame API de YouTube: el script se baja recién la primera vez que se pide. */

export type YTPlayer = {
  seekTo(segundos: number, permitirBuscar: boolean): void
  playVideo(): void
  pauseVideo(): void
  getCurrentTime(): number
  getPlayerState(): number
  destroy(): void
}

type YTEvento = { target: YTPlayer; data: number }

export type YTOpciones = {
  videoId: string
  host?: string
  width?: string | number
  height?: string | number
  playerVars?: Record<string, string | number>
  events?: {
    onReady?: (e: YTEvento) => void
    onStateChange?: (e: YTEvento) => void
    onError?: (e: YTEvento) => void
  }
}

export type YTApi = {
  Player: new (el: HTMLElement, opciones: YTOpciones) => YTPlayer
  PlayerState: { ENDED: number; PLAYING: number; PAUSED: number; BUFFERING: number }
}

declare global {
  interface Window {
    YT?: YTApi
    onYouTubeIframeAPIReady?: () => void
  }
}

let promesa: Promise<YTApi> | null = null

export function cargarYouTube(): Promise<YTApi> {
  if (window.YT?.Player) return Promise.resolve(window.YT)
  promesa ??= new Promise<YTApi>((resolver, rechazar) => {
    const previo = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      previo?.()
      if (window.YT) resolver(window.YT)
    }
    const s = document.createElement('script')
    s.src = 'https://www.youtube.com/iframe_api'
    s.async = true
    s.addEventListener('error', () => {
      promesa = null
      s.remove()
      rechazar(new Error('No cargó la API de YouTube'))
    })
    document.head.appendChild(s)
  })
  return promesa
}
