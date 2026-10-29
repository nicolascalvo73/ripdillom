import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { registrarNavegar, useEscena } from '../state/escena'
import { zonaPorRuta } from '../lib/zonas'

/** Puente entre React Router y el resto (el Canvas vive en otro árbol de React y no ve el contexto del router). */
export function RutaSync() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const setZona = useEscena((s) => s.setZona)

  useEffect(() => {
    registrarNavegar((to) => navigate(to))
  }, [navigate])

  useEffect(() => {
    const z = zonaPorRuta(pathname)
    setZona(z)
    document.title = z ? `${z.titulo} — rip.dillom` : 'rip.dillom — La nueva violencia'
  }, [pathname, setZona])

  return null
}
