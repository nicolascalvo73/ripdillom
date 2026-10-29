const MAX_LADO = 320
const MAX_BYTES = 6 * 1024 * 1024

/**
 * Convierte una imagen subida en un tatuaje: PNG en blanco y negro, listo para el decal (que multiplica sobre la piel).
 * - Con transparencia real: se conserva el alfa y el color pasa a grises.
 * - Sin transparencia (fondo blanco, foto, dibujo escaneado): lo oscuro pasa a tinta negra y lo claro a transparente.
 * Devuelve el PNG como data URL.
 */
export async function convertirATatuaje(archivo: File): Promise<string> {
  if (!archivo.type.startsWith('image/')) throw new Error('Subí una imagen PNG.')
  if (archivo.size > MAX_BYTES) throw new Error('La imagen pesa más de 6 MB.')

  let bmp: ImageBitmap
  try {
    bmp = await createImageBitmap(archivo)
  } catch {
    throw new Error('No se pudo leer la imagen.')
  }
  const k = Math.min(1, MAX_LADO / Math.max(bmp.width, bmp.height))
  const w = Math.max(1, Math.round(bmp.width * k))
  const h = Math.max(1, Math.round(bmp.height * k))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) throw new Error('Tu navegador no puede procesar la imagen.')
  ctx.drawImage(bmp, 0, 0, w, h)
  bmp.close()

  const img = ctx.getImageData(0, 0, w, h)
  const d = img.data
  let transparentes = 0
  for (let i = 3; i < d.length; i += 4) if (d[i] < 250) transparentes++
  const conAlfa = transparentes > (d.length / 4) * 0.02

  if (conAlfa) {
    for (let i = 0; i < d.length; i += 4) {
      const g = Math.round(0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2])
      d[i] = d[i + 1] = d[i + 2] = g
    }
  } else {
    // estirar el contraste para que el fondo claro quede del todo transparente
    let min = 255
    let max = 0
    const lum = new Uint8Array(w * h)
    for (let i = 0, p = 0; i < d.length; i += 4, p++) {
      const l = Math.round(0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2])
      lum[p] = l
      if (l < min) min = l
      if (l > max) max = l
    }
    const rango = Math.max(1, max - min)
    for (let i = 0, p = 0; i < d.length; i += 4, p++) {
      const tinta = 1 - (lum[p] - min) / rango
      d[i] = d[i + 1] = d[i + 2] = 0
      d[i + 3] = Math.round(Math.min(1, Math.max(0, (tinta - 0.08) / 0.84)) * 255)
    }
  }
  ctx.putImageData(img, 0, 0)
  return canvas.toDataURL('image/png')
}
