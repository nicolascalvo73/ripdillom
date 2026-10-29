import { useEffect, useState } from 'react'
import { esLateral } from '../lib/layout'

/** ¿Panel lateral (desktop, tablet, celu horizontal) o bottom sheet? Sigue al tamaño de la ventana. */
export function useLateral() {
  const [lateral, setLateral] = useState(esLateral)
  useEffect(() => {
    const f = () => setLateral(esLateral())
    window.addEventListener('resize', f)
    return () => window.removeEventListener('resize', f)
  }, [])
  return lateral
}
