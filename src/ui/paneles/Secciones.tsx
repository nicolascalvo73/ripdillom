import type { ReactNode } from 'react'
import redes from '../../content/redes.json'
import shows from '../../content/shows.json'
import quien from '../../content/quien-soy.json'

/** Enlace externo; si todavía no hay URL se muestra igual, deshabilitado, con el placeholder entre corchetes. */
function Enlace({ url, className, children }: { url: string | null; className: string; children: ReactNode }) {
  if (!url) {
    return (
      <span className={`${className} pendiente`} aria-disabled="true">
        {children}
      </span>
    )
  }
  return (
    <a className={className} href={url} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
}

export function Redes() {
  return (
    <>
      <div className="redes">
        {redes.redes.map((r) => (
          <Enlace key={r.nombre} url={r.url} className={`btn ${r.estilo === 'pk' ? '' : r.estilo} red`}>
            <span>{r.nombre}</span>
            <span className="lbl">{r.handle} ↗</span>
          </Enlace>
        ))}
      </div>
      {redes.contacto && (
        <div className="contacto">
          <div className="lbl">Contacto</div>
          <div className="nombre">{redes.contacto}</div>
        </div>
      )}
      <p className="lbl gris aviso">{redes.aviso}</p>
    </>
  )
}

export function Shows() {
  const hay = shows.fechas.length > 0
  return (
    <>
      <div className="lbl sec-et">{shows.titulo}</div>
      {hay ? (
        <ul className="lista">
          {(shows.fechas as { dia: string; mes: string; ciudad: string; detalle: string; entradas?: string }[]).map((f, i) => (
            <li className="row" key={i}>
              <div className="fd fecha">
                {f.dia}
                <br />
                <span>{f.mes}</span>
              </div>
              <div className="grow">
                <b>{f.ciudad}</b>
                <div className="lbl gris">{f.detalle}</div>
              </div>
              {f.entradas ? (
                <a className="btn entradas" href={f.entradas} target="_blank" rel="noopener noreferrer">
                  Entradas ↗
                </a>
              ) : (
                <span className="chip">Pronto</span>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="shows-vacio fd">{shows.vacio}</p>
      )}
      <div className="fd tira-amarilla">
        <span>{shows.pie}</span>
      </div>
    </>
  )
}

export function QuienSoy() {
  return (
    <>
      <div className="quien-cab">
        <div className="ph-box quien-ilus">
          {quien.ilustracion ? (
            <img src={quien.ilustracion} alt="" />
          ) : (
            <span className="lbl">
              [Ilustración
              <br />
              propia]
            </span>
          )}
        </div>
        <div>
          <div className="fd quien-nombre">{quien.nombre}</div>
          <div className="lbl">{quien.rol}</div>
          <div className="lbl rosa-osc">{quien.detalle}</div>
        </div>
      </div>
      <div className="bio">
        {quien.parrafos.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      <a className="btn yl wiki" href={quien.wikipedia} target="_blank" rel="noopener noreferrer">
        Seguir leyendo en Wikipedia <span>↗</span>
      </a>
      {quien.aviso && <p className="lbl gris aviso">{quien.aviso}</p>}
    </>
  )
}
