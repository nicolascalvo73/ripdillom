import { useNavigate } from 'react-router-dom'
import { ZONAS } from '../lib/zonas'

/** Navegación de respaldo para teclado y lectores de pantalla: invisible hasta que recibe foco. */
export function NavRespaldo() {
  const navigate = useNavigate()
  return (
    <nav className="nav-respaldo" aria-label="Secciones">
      <ul>
        {ZONAS.map((z) => (
          <li key={z.id}>
            <button onClick={() => navigate(z.ruta)}>{z.aria}</button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
