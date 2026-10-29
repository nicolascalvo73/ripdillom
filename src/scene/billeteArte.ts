import { useEffect, useMemo } from 'react'
import { CanvasTexture, SRGBColorSpace } from 'three'

/** Billete de $100 de juguete: violeta de la paleta, borde negro, semitono rosa y "$100" grande en la parte que asoma. */
function dibujar(canvas: HTMLCanvasElement) {
  const w = canvas.width
  const h = canvas.height
  const c = canvas.getContext('2d')!
  c.fillStyle = '#8a4dff'
  c.fillRect(0, 0, w, h)
  // semitono rosa dentro de un círculo, detrás del número
  const cy = h * 0.27
  c.save()
  c.beginPath()
  c.arc(w / 2, cy, w * 0.46, 0, Math.PI * 2)
  c.clip()
  c.fillStyle = '#ff2e9a'
  const paso = w * 0.05
  for (let y = 0; y < h; y += paso) {
    for (let x = 0; x < w; x += paso) {
      c.beginPath()
      c.arc(x + ((y / paso) % 2 ? paso / 2 : 0), y, paso * 0.3, 0, Math.PI * 2)
      c.fill()
    }
  }
  c.restore()
  c.strokeStyle = '#0d0a0c'
  c.lineWidth = w * 0.03
  c.beginPath()
  c.arc(w / 2, cy, w * 0.46, 0, Math.PI * 2)
  c.stroke()
  // "$100": hueso con contorno negro y sombra dura rosa
  c.textAlign = 'center'
  c.textBaseline = 'middle'
  c.font = `900 ${w * 0.36}px "Londrina Solid", Impact, sans-serif`
  c.lineJoin = 'round'
  c.lineWidth = w * 0.07
  c.strokeStyle = '#0d0a0c'
  c.fillStyle = '#0d0a0c'
  c.fillText('$100', w / 2 + w * 0.025, cy + w * 0.025)
  c.strokeText('$100', w / 2, cy)
  c.fillStyle = '#f2ebdd'
  c.fillText('$100', w / 2, cy)
  // rayas decorativas abajo (parte que queda dentro del bolsillo)
  c.fillStyle = '#0d0a0c'
  for (let i = 0; i < 4; i++) c.fillRect(w * 0.14, h * (0.62 + i * 0.08), w * 0.72, h * 0.015)
  // borde
  c.lineWidth = w * 0.05
  c.strokeStyle = '#0d0a0c'
  c.strokeRect(0, 0, w, h)
}

/** Textura del billete de $100 (vertical, 256×480). Se redibuja cuando llega la tipografía del diseño. */
export function useTexturaBillete() {
  const canvas = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 256
    c.height = 480
    return c
  }, [])
  const textura = useMemo(() => {
    const t = new CanvasTexture(canvas)
    t.colorSpace = SRGBColorSpace
    t.anisotropy = 8
    return t
  }, [canvas])

  useEffect(() => {
    dibujar(canvas)
    textura.needsUpdate = true
    document.fonts?.load('900 40px "Londrina Solid"').then(() => {
      dibujar(canvas)
      textura.needsUpdate = true
    })
    return () => textura.dispose()
  }, [canvas, textura])

  return textura
}
