import { useState, type ReactNode } from 'react'
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

type Fecha = { fecha: string; hasta?: string; ciudad: string; detalle: string; entradas?: string; chip?: string; estado?: string }

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
const dia = (iso: string) => new Date(`${iso}T12:00:00`)
const MAX_FECHAS = 10

export function Shows() {
  const [hoy] = useState(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  })
  // las que ya pasaron se ocultan solas; se muestran las próximas 10
  const proximas = (shows.fechas as Fecha[])
    .filter((f) => dia(f.hasta ?? f.fecha) >= hoy)
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
    .slice(0, MAX_FECHAS)
  return (
    <>
      <div className="lbl sec-et">{shows.titulo}</div>
      {proximas.length > 0 ? (
        <ul className="lista">
          {proximas.map((f) => {
            const d = dia(f.fecha)
            const otroAnio = d.getFullYear() !== hoy.getFullYear()
            const agotado = f.estado === 'agotado'
            return (
              <li className={`row show${agotado ? ' agotado' : ''}`} key={f.fecha + f.ciudad}>
                <div className={`fd fecha${f.hasta ? ' rango' : ''}`}>
                  {f.hasta ? `${d.getDate()}–${dia(f.hasta).getDate()}` : String(d.getDate()).padStart(2, '0')}
                  <br />
                  <span>
                    {MESES[d.getMonth()]}
                    {otroAnio && <small> {String(d.getFullYear()).slice(2)}</small>}
                  </span>
                </div>
                <div className="grow">
                  <b>{f.ciudad}</b>
                  <div className="lbl gris">{f.detalle}</div>
                </div>
                {agotado ? (
                  <span className="chip f-pk">Agotado</span>
                ) : f.entradas ? (
                  <a className="btn entradas" href={f.entradas} target="_blank" rel="noopener noreferrer">
                    Entradas ↗
                  </a>
                ) : (
                  <span className="chip">{f.chip ?? 'Pronto'}</span>
                )}
              </li>
            )
          })}
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
