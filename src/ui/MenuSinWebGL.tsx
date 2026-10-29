import { Link } from 'react-router-dom'
import { ID_TATUADOR, ZONAS } from '../lib/zonas'

/** Respaldo cuando el navegador no tiene WebGL: las mismas secciones, sin el muñeco 3D. */
export function MenuSinWebGL() {
  return (
    <main className="sin-webgl">
      <h1 className="fd title">Dillom</h1>
      <p className="lbl">Tu navegador no puede mostrar el comuñe en 3D. Igual podés ver todo:</p>
      <nav aria-label="Secciones">
        <ul>
          {ZONAS.filter((z) => z.id !== ID_TATUADOR).map((z) => (
            <li key={z.id}>
              <Link className="btn" to={z.ruta}>
                {z.globo}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </main>
  )
}
