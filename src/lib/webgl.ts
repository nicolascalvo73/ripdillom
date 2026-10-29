/** true si el navegador puede crear un contexto WebGL (si no, App muestra el menú de respaldo). */
export function hayWebGL(): boolean {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}
