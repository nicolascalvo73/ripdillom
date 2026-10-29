import { useState } from 'react'
import { Link } from 'react-router-dom'
import merch from '../../content/merch.json'
import { useCarrito } from '../../state/carrito'

type Producto = {
  id: string
  nombre: string
  desc: string
  precio: number
  categoria: string
  estrella?: boolean
  talles?: string[]
  imagenes: string[]
}

const productos = merch.productos as Producto[]
const porId = (id: string) => productos.find((p) => p.id === id)
const ars = (n: number) => '$' + n.toLocaleString('es-AR')

/** Imagen de producto; si falta (o no carga) se muestra fondo de fotocopia con el nombre. */
function Foto({ p, i = 0 }: { p: Producto; i?: number }) {
  const [falla, setFalla] = useState(false)
  const src = p.imagenes[i]
  if (!src || falla) {
    return (
      <div className="ph-box foto foto-vacia" role="img" aria-label={p.nombre}>
        <span className="fd">{p.nombre}</span>
      </div>
    )
  }
  return <img className="foto" src={src} alt={p.nombre} loading="lazy" onError={() => setFalla(true)} />
}

function Detalle({ p, volver }: { p: Producto; volver: () => void }) {
  const agregar = useCarrito((s) => s.agregar)
  const [img, setImg] = useState(0)
  const [talle, setTalle] = useState(p.talles?.[0])
  const [cant, setCant] = useState(1)
  const [ok, setOk] = useState(false)
  return (
    <div className="tienda-detalle">
      <button className="btn bk" onClick={volver}>
        ← Tienda
      </button>
      <Foto p={p} i={img} />
      {p.imagenes.length > 1 && (
        <div className="galeria">
          {p.imagenes.map((_, i) => (
            <button key={i} className={`mini${i === img ? ' on' : ''}`} aria-label={`Imagen ${i + 1}`} onClick={() => setImg(i)}>
              <Foto p={p} i={i} />
            </button>
          ))}
        </div>
      )}
      <h3 className="fd tienda-nombre">{p.nombre}</h3>
      <p>{p.desc}</p>
      <div className="fd tienda-precio">{ars(p.precio)}</div>
      {p.talles && (
        <div className="talles" role="radiogroup" aria-label="Talle">
          {p.talles.map((t) => (
            <button key={t} role="radio" aria-checked={t === talle} className={`chip talle${t === talle ? ' f-pk' : ''}`} onClick={() => setTalle(t)}>
              {t}
            </button>
          ))}
        </div>
      )}
      <div className="cant">
        <button className="btn bk" aria-label="Menos" onClick={() => setCant((c) => Math.max(1, c - 1))}>
          −
        </button>
        <b aria-live="polite">{cant}</b>
        <button className="btn bk" aria-label="Más" onClick={() => setCant((c) => Math.min(99, c + 1))}>
          +
        </button>
      </div>
      <button
        className="btn"
        onClick={() => {
          agregar(p.id, talle, cant)
          setOk(true)
        }}
      >
        {ok ? 'Agregado ✓ (de mentira)' : 'Agregar al carrito'}
      </button>
    </div>
  )
}

function Carrito({ volver }: { volver: () => void }) {
  const { lineas, cambiar, quitar, vaciar } = useCarrito()
  const [modal, setModal] = useState(false)
  const items = lineas.flatMap((l) => {
    const p = porId(l.id)
    return p ? [{ l, p }] : []
  })
  const subtotal = items.reduce((a, { l, p }) => a + l.cant * p.precio, 0)
  return (
    <div className="tienda-carrito">
      <button className="btn bk" onClick={volver}>
        ← Tienda
      </button>
      <div className="lbl sec-et">Carrito</div>
      {items.length === 0 ? (
        <p className="shows-vacio fd">Vacío, como tu billetera</p>
      ) : (
        <>
          <ul className="lista">
            {items.map(({ l, p }) => (
              <li className="row" key={l.id + (l.variante ?? '')}>
                <div className="grow">
                  <b>{p.nombre}</b>
                  <div className="lbl gris">
                    {l.variante ? `Talle ${l.variante} · ` : ''}
                    {ars(p.precio)}
                  </div>
                </div>
                <div className="cant">
                  <button className="btn bk" aria-label={`Menos ${p.nombre}`} onClick={() => cambiar(l.id, l.variante, -1)}>
                    −
                  </button>
                  <b>{l.cant}</b>
                  <button className="btn bk" aria-label={`Más ${p.nombre}`} onClick={() => cambiar(l.id, l.variante, 1)}>
                    +
                  </button>
                </div>
                <button className="btn bk" aria-label={`Quitar ${p.nombre}`} onClick={() => quitar(l.id, l.variante)}>
                  ✕
                </button>
              </li>
            ))}
          </ul>
          <div className="fd tienda-precio">Subtotal {ars(subtotal)}</div>
          <button className="btn" onClick={() => setModal(true)}>
            Ir a pagar
          </button>
        </>
      )}
      {modal && (
        <div className="mentirita" role="alertdialog" aria-modal="true" aria-label="Era de mentirita">
          <div className="mentirita-caja">
            <h3 className="fd">AHRE QUE ERA DE MENTIRITA</h3>
            <p>Los productos no existen y no se puede comprar nada. No pedimos datos personales ni tarjeta. Es una parodia de fans.</p>
            <button className="btn" onClick={() => setModal(false)}>
              Volver a la tienda
            </button>
            <button
              className="btn bk"
              onClick={() => {
                vaciar()
                setModal(false)
              }}
            >
              Vaciar carrito
            </button>
            <Link className="btn bn" to="/aporte">
              Tomá $100
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export function Merch() {
  const [cat, setCat] = useState('Todo')
  const [vista, setVista] = useState<string | 'carrito' | null>(null)
  const total = useCarrito((s) => s.lineas.reduce((a, l) => a + l.cant, 0))
  const sel = vista && vista !== 'carrito' ? porId(vista) : undefined

  let cuerpo
  if (vista === 'carrito') cuerpo = <Carrito volver={() => setVista(null)} />
  else if (sel) cuerpo = <Detalle p={sel} volver={() => setVista(null)} />
  else {
    const lista = productos
      .filter((p) => cat === 'Todo' || p.categoria === cat)
      .sort((a, b) => Number(!!b.estrella) - Number(!!a.estrella))
    cuerpo = (
      <>
        <div className="chips filtros" role="group" aria-label="Categorías">
          {merch.categorias.map((c) => (
            <button key={c} className={`chip${c === cat ? ' f-pk' : ''}`} aria-pressed={c === cat} onClick={() => setCat(c)}>
              {c}
            </button>
          ))}
        </div>
        <ul className="grilla">
          {lista.map((p) => (
            <li key={p.id} className={p.estrella ? 'estrella' : undefined}>
              <button className="prod" onClick={() => setVista(p.id)}>
                <Foto p={p} />
                <span className="fd">{p.nombre}</span>
                <span className="lbl">{ars(p.precio)}</span>
              </button>
            </li>
          ))}
        </ul>
      </>
    )
  }

  return (
    <>
      <div className="fd tira-amarilla sello">
        <span>{merch.sello}</span>
      </div>
      {vista !== 'carrito' && (
        <button className="btn bk ver-carrito" onClick={() => setVista('carrito')}>
          Carrito ({total})
        </button>
      )}
      {cuerpo}
    </>
  )
}
