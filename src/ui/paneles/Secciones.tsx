import type { ReactNode } from 'react'
import musica from '../../content/musica.json'
import videos from '../../content/videos.json'
import redes from '../../content/redes.json'
import shows from '../../content/shows.json'
import quien from '../../content/quien-soy.json'
import { Embed } from './Embed'
import { useLateral } from '../useLateral'

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

const pad = (n: number) => String(n).padStart(2, '0')

export function Musica() {
  const lateral = useLateral()
  return (
    <>
      <div className="mus-cab">
        <div className="mus-tapa">
          <span className="fd">{musica.sigla}</span>
        </div>
        <div>
          <div className="fd mus-album">{musica.album}</div>
          <div className="lbl">{musica.detalle}</div>
          <div className="mus-chip">
            <span className="chip f-yl">{musica.cantidadTemas}</span>
          </div>
        </div>
      </div>
      <div className="mus-embed">
        <Embed titulo={musica.embed.titulo} url={musica.embed.url} alto={152} etiqueta="Cargar reproductor" />
      </div>
      <div className="lbl sec-et">Tracklist</div>
      <ol className="lista">
        {musica.tracklist.map((t, i) => (
          <li className="row" key={i}>
            <span className="fd num">{pad(i + 1)}</span>
            <span className="grow nombre">{t.nombre}</span>
            <span className="lbl">{t.duracion}</span>
          </li>
        ))}
      </ol>
      {lateral && <p className="lbl gris esc">Esc para volver</p>}
    </>
  )
}

export function Videos() {
  const p = videos.principal
  return (
    <>
      <div className="chips">
        {videos.categorias.map((c, i) => (
          <span key={c} className={`chip${i === 0 ? ' f-bk' : ''}`}>
            {c}
          </span>
        ))}
      </div>
      <div className="vid-principal">
        <Embed titulo={p.embed.titulo} url={p.embed.url} alto={178} etiqueta="Reproducir clip" />
      </div>
      <div className="fd vid-titulo">{p.titulo}</div>
      <div className="lbl gris">{p.detalle}</div>
      <div className="lbl sec-et">Más</div>
      <ul className="lista">
        {videos.mas.map((v, i) => (
          <li className="row" key={i}>
            <div className="ph-box miniatura" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 18 18">
                <path d="M3 1 L16 9 L3 17 Z" fill="#F7E92B" />
              </svg>
            </div>
            <div className="grow nombre">
              {v.titulo}
              <div className="lbl gris">{v.duracion}</div>
            </div>
          </li>
        ))}
      </ul>
    </>
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
      <div className="contacto">
        <div className="lbl">Contacto</div>
        <div className="nombre">{redes.contacto}</div>
      </div>
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
