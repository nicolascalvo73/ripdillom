/** Foto del comuñe tatuado: el canvas 3D (transparente) sobre una nebulosa dibujada a mano + una marca discreta. */

let fuente: (() => HTMLCanvasElement | null) | null = null
/** La escena registra cómo copiar su canvas (hay que renderizar y copiar en el mismo tick). */
export const registrarFuente = (fn: (() => HTMLCanvasElement | null) | null) => {
  fuente = fn
}

const W = 1080
const H = 1350

function nebulosa(g: CanvasRenderingContext2D) {
  g.fillStyle = '#0D0A0C'
  g.fillRect(0, 0, W, H)
  // mismas manchas que el fondo CSS: [cx, cy, rx, ry, color] en fracciones del cuadro
  const manchas: [number, number, number, number, string][] = [
    [0.08, 0.2, 0.38, 0.26, 'rgba(255,46,154,.78)'],
    [0.94, 0.36, 0.3, 0.2, 'rgba(247,233,43,.6)'],
    [0.72, 0.9, 0.52, 0.3, 'rgba(255,46,154,.62)'],
    [0.14, 0.74, 0.28, 0.18, 'rgba(247,233,43,.3)'],
    [0.5, 0.46, 0.6, 0.4, 'rgba(43,15,31,1)'],
  ]
  for (const [cx, cy, rx, ry, color] of manchas) {
    g.save()
    g.translate(cx * W, cy * H)
    g.scale(rx * W, ry * H)
    const gr = g.createRadialGradient(0, 0, 0, 0, 0, 1)
    gr.addColorStop(0, color)
    gr.addColorStop(0.72, 'rgba(0,0,0,0)')
    g.fillStyle = gr
    g.beginPath()
    g.arc(0, 0, 1, 0, Math.PI * 2)
    g.fill()
    g.restore()
  }
}

export async function componerImagen(): Promise<Blob | null> {
  const src = fuente?.()
  if (!src || !src.width || !src.height) return null
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const g = c.getContext('2d')
  if (!g) return null
  nebulosa(g)
  // el comuñe ocupa el alto del cuadro; si la pantalla era más ancha, se recortan los costados
  const k = H / src.height
  g.drawImage(src, (W - src.width * k) / 2, 0, src.width * k, H)
  g.textAlign = 'right'
  g.fillStyle = 'rgba(242,235,221,.8)'
  g.font = '700 24px "Space Mono", ui-monospace, monospace'
  g.fillText('rip.dillom', W - 40, H - 40)
  return new Promise((r) => c.toBlob(r, 'image/png'))
}

export function descargar(blob: Blob, nombre = 'comune-tatuado.png') {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nombre
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** Web Share con archivo si el navegador puede; si no, devuelve false. */
export async function compartir(blob: Blob): Promise<boolean> {
  const file = new File([blob], 'comune-tatuado.png', { type: 'image/png' })
  if (!navigator.canShare?.({ files: [file] })) return false
  try {
    await navigator.share({ files: [file], title: 'Mi comuñe tatuado — rip.dillom' })
    return true
  } catch {
    return false // cancelado
  }
}

export const puedeCompartir = () => typeof navigator !== 'undefined' && typeof navigator.share === 'function'
