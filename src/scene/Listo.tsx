import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { useCarga } from '../state/carga'

/**
 * Se monta recién cuando el comuñe terminó de descargarse (cuelga del mismo Suspense).
 * Compila los shaders sin bloquear el hilo y espera dos frames: ahí la escena está realmente lista.
 */
export function Listo() {
  const { gl, scene, camera } = useThree()
  const marcarListo = useCarga((s) => s.marcarListo)

  useEffect(() => {
    let cancelado = false
    gl.compileAsync(scene, camera)
      .catch(() => {})
      .finally(() => {
        if (cancelado) return
        requestAnimationFrame(() => requestAnimationFrame(marcarListo))
      })
    return () => {
      cancelado = true
    }
  }, [gl, scene, camera, marcarListo])

  return null
}
