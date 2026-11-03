/** true si el navegador puede crear un contexto WebGL2 (three ya no soporta WebGL1); si no, App muestra el menú de respaldo. */
export function hayWebGL(): boolean {
  try {
    const c = document.createElement('canvas')
    return !!c.getContext('webgl2')
  } catch {
    return false
  }
}
