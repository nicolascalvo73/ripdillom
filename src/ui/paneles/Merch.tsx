import { Component, Suspense, lazy, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import merch from '../../content/merch.json'
import { useCarrito } from '../../state/carrito'

type Producto = {
  id: string
  nombre: string
  categoria: string
  precio: number
  desc: string
  variantes: string[]
  etiqueta_variante?: string
  imagen: string
  alt: string
  destacado?: boolean
  etiqueta?: string
  vista3d?: boolean
}

const Vista3D = lazy(() => import('./Vista3D'))

const productos = merch.productos as Producto[]
const porId = (id: string) => productos.find((p) => p.id === id)
const ars = (n: number) => '$' + n.toLocaleString('es-AR')
const url = (u: string) => import.meta.env.BASE_URL + u.replace(/^\//, '')
const etiquetaDe = (p: Producto) => p.etiqueta_variante ?? 'Variante'

// fotos extra de la galería del detalle, además de la imagen del producto
const EXTRA: Record<string, { src: string; alt: string }[]> = {
  muneco: [
    { src: '/img/muneco-v5-frente.png', alt: 'Muñequito visto de frente' },
    { src: '/img/muneco-v5-espalda-luz.png', alt: 'Muñequito visto de espaldas' },
  ],
}

/** Imagen de producto; si falta (o no carga) se muestra fondo de fotocopia con el nombre. */
function Foto({ p, src = p.imagen, alt = p.alt }: { p: Producto; src?: string; alt?: string }) {
  const [falla, setFalla] = useState(false)
  if (!src || falla) {
    return (
      <div className="ph-box foto foto-vacia" role="img" aria-label={p.nombre}>
        <span className="fd">{p.nombre}</span>
      </div>
    )
  }
  return <img className="foto" src={url(src)} alt={alt} loading="lazy" onError={() => setFalla(true)} />
}

/** Si la vista 3D falla (sin WebGL, etc.), cae a la foto. */
class Respaldo extends Component<{ children: ReactNode; respaldo: ReactNode }, { error: boolean }> {
  state = { error: false }
  static getDerivedStateFromError() {
    return { error: true }
  }
  render() {
    return this.state.error ? this.props.respaldo : this.props.children
  }
}

function Detalle({ p, volver }: { p: Producto; volver: () => void }) {
  const agregar = useCarrito((s) => s.agregar)
  const fotos = [{ src: p.imagen, alt: p.alt }, ...(EXTRA[p.id] ?? [])]
  const [ver, setVer] = useState(0) // índice en `fotos`; fotos.length = vista 3D
  const [variante, setVariante] = useState(p.variantes[0])
  const [cant, setCant] = useState(1)
  const [ok, setOk] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])
  const en3d = !!p.vista3d && ver === fotos.length
  const principal = fotos[ver] ?? fotos[0]
  const hayGaleria = fotos.length > 1 || !!p.vista3d

  return (
    <div className="tienda-detalle">
      <button className="btn bk" onClick={volver}>
        ← Tienda
      </button>
      <div className="visor">
        {en3d ? (
          <Respaldo respaldo={<Foto p={p} />}>
            <Suspense fallback={<Foto p={p} />}>
              <Vista3D />
            </Suspense>
          </Respaldo>
        ) : (
          <Foto key={principal.src} p={p} src={principal.src} alt={principal.alt} />
        )}
        {p.etiqueta && <span className="chip f-yl tienda-et">{p.etiqueta}</span>}
      </div>
      {hayGaleria && (
        <div className="galeria">
          {fotos.map((f, i) => (
            <button key={f.src} className={`mini${i === ver ? ' on' : ''}`} aria-label={`Ver foto ${i + 1}`} aria-pressed={i === ver} onClick={() => setVer(i)}>
              <img className="foto" src={url(f.src)} alt="" loading="lazy" />
            </button>
          ))}
          {p.vista3d && (
            <button className={`mini mini-3d fd${en3d ? ' on' : ''}`} aria-label="Ver en 3D" aria-pressed={en3d} onClick={() => setVer(fotos.length)}>
              3D
            </button>
          )}
        </div>
      )}
      <h3 className="fd tienda-nombre">{p.nombre}</h3>
      <p>{p.desc}</p>
      <div className="fd tienda-precio">{ars(p.precio)}</div>
      {p.variantes.length > 0 && (
        <div className="talles" role="radiogroup" aria-label={etiquetaDe(p)}>
          {p.variantes.map((t) => (
            <button
              key={t}
              role="radio"
              aria-checked={t === variante}
              className={`chip talle${t === variante ? ' f-pk' : ''}`}
              onClick={() => {
                setVariante(t)
                setOk(false)
              }}
            >
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
          agregar(p.id, variante, cant)
          setOk(true)
          clearTimeout(timer.current)
          timer.current = setTimeout(() => setOk(false), 1600)
        }}
      >
        {ok ? 'Agregado ✓' : 'Agregar al carrito'}
      </button>
    </div>
  )
}

function Carrito({ volver }: { volver: () => void }) {
  const { lineas, cambiar, quitar, vaciar } = useCarrito()
  const [modal, setModal] = useState(false)
  const pagar = useRef<HTMLButtonElement>(null)
  const volverBtn = useRef<HTMLButtonElement>(null)
  const dialogo = useRef<HTMLDivElement>(null)
  const items = lineas.flatMap((l) => {
    const p = porId(l.id)
    return p ? [{ l, p }] : []
  })
  const subtotal = items.reduce((a, { l, p }) => a + l.cant * p.precio, 0)

  // al abrir el modal el foco entra; al cerrarlo vuelve al botón que lo abrió
  useEffect(() => {
    if (modal) dialogo.current?.querySelector<HTMLElement>('button, a')?.focus()
  }, [modal])
  const cerrar = () => {
    setModal(false)
    requestAnimationFrame(() => (pagar.current ?? volverBtn.current)?.focus())
  }
  const teclado = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation() // que el panel no se cierre detrás
      cerrar()
    } else if (e.key === 'Tab') {
      const f = [...(dialogo.current?.querySelectorAll<HTMLElement>('button, a') ?? [])]
      if (!f.length) return
      const primero = f[0]
      const ultimo = f[f.length - 1]
      if (e.shiftKey && document.activeElement === primero) {
        e.preventDefault()
        ultimo.focus()
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault()
        primero.focus()
      }
    }
  }

  return (
    <div className="tienda-carrito">
      <button ref={volverBtn} className="btn bk" onClick={volver}>
        ← Tienda
      </button>
      <div className="lbl sec-et">Carrito</div>
      {items.length === 0 ? (
        <p className="shows-vacio fd">Vacío, como tu billetera</p>
      ) : (
        <>
          <ul className="lista">
            {items.map(({ l, p }) => (
              <li className="row" key={`${l.id}|${l.variante ?? ''}`}>
                <div className="grow">
                  <b>{p.nombre}</b>
                  <div className="lbl gris">
                    {l.variante ? `${etiquetaDe(p)} ${l.variante} · ` : ''}
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
          <button ref={pagar} className="btn" onClick={() => setModal(true)}>
            Ir a pagar
          </button>
        </>
      )}
      {modal && (
        <div className="mentirita" role="alertdialog" aria-modal="true" aria-label="Era de mentirita" ref={dialogo} onKeyDown={teclado}>
          <div className="mentirita-caja">
            <h3 className="fd">AHRE QUE ERA DE MENTIRITA</h3>
            <p>Los productos no existen y no se puede comprar nada. No pedimos datos personales ni tarjeta.</p>
            <button className="btn" onClick={cerrar}>
              Volver a la tienda
            </button>
            <button
              className="btn bk"
              onClick={() => {
                vaciar()
                cerrar()
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
    const lista = [...productos]
      .filter((p) => cat === 'Todo' || p.categoria === cat)
      .sort((a, b) => Number(!!b.destacado) - Number(!!a.destacado))
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
            <li key={p.id}>
              <button className="prod" aria-label={`${p.nombre}, ${ars(p.precio)}`} onClick={() => setVista(p.id)}>
                <Foto p={p} />
                {p.etiqueta && <span className="chip f-yl tienda-et">{p.etiqueta}</span>}
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
    <div className="tienda">
      {vista !== 'carrito' && (
        <button className="btn bk ver-carrito" aria-label={`Ver carrito, ${total} ${total === 1 ? 'producto' : 'productos'}`} onClick={() => setVista('carrito')}>
          Carrito ({total})
        </button>
      )}
      {cuerpo}
    </div>
  )
}
