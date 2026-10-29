import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTatuando } from '../state/escena'
import { useTatuajes, type Modo } from '../state/tatuajes'
import { componerImagen, compartir, descargar, puedeCompartir } from '../lib/captura'
import '../styles/tatuador.css'

const BASE = import.meta.env.BASE_URL

/** Pantalla del modo tatuador (ruta /tatuador): barra superior, herramientas y paleta sobre el comuñe en el canvas. */
export function Tatuador() {
  const tatuando = useTatuando()
  if (!tatuando) return null
  return <Pantalla />
}

function Pantalla() {
  const navigate = useNavigate()
  const items = useTatuajes((s) => s.items)
  const selected = useTatuajes((s) => s.selected)
  const modo = useTatuajes((s) => s.modo)
  const hayHistorial = useTatuajes((s) => s.historial.length > 0)
  const { select, setModo, colocar, borrar, espejar, deshacer, guardar, reset, patch, commit } = useTatuajes.getState()

  const [aviso, setAviso] = useState('')
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const decir = useCallback((t: string) => {
    clearTimeout(timer.current)
    setAviso(t)
    timer.current = setTimeout(() => setAviso(''), 2500)
  }, [])

  const salir = useCallback(() => navigate('/'), [navigate])

  // al salir: sin selección ni modo pegado
  useEffect(
    () => () => {
      clearTimeout(timer.current)
      select(null)
      setModo('mover')
    },
    [select, setModo],
  )

  useEffect(() => {
    const f = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (t && /input|textarea|select/i.test(t.tagName)) return
      if (e.key === 'Escape') return salir()
      const sel = useTatuajes.getState().items.find((i) => i.id === useTatuajes.getState().selected)
      if (!sel) return
      const paso = e.shiftKey ? 3 : 1
      if (e.key === 'Delete' || e.key === 'Backspace') borrar()
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault()
        const d = e.key === 'ArrowRight' ? 1 : -1
        commit()
        const modoActual = useTatuajes.getState().modo
        if (modoActual === 'rotar') patch(sel.id, { rot: +((sel.rot ?? 0) + d * 0.087 * paso).toFixed(3) })
        else if (modoActual === 'escalar') patch(sel.id, { alto: +Math.min(0.2, Math.max(0.01, sel.alto * (1 + d * 0.06 * paso))).toFixed(3) })
        else patch(sel.id, { x: +(sel.x + d * 0.004 * paso).toFixed(3) })
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault()
        commit()
        patch(sel.id, { y: +(sel.y + (e.key === 'ArrowUp' ? 1 : -1) * 0.004 * paso).toFixed(3) })
      }
    }
    window.addEventListener('keydown', f)
    return () => window.removeEventListener('keydown', f)
  }, [salir, borrar, commit, patch])

  const puestos = items.filter((t) => t.puesto !== false).length
  const sel = items.find((t) => t.id === selected && t.puesto !== false)

  const elegirModo = (m: Modo) => setModo(modo === m ? 'mover' : m)
  const sinSel = !sel

  const guardarLocal = () => decir(guardar() ? 'Guardado en este dispositivo' : 'No se pudo guardar (el navegador lo bloquea)')

  const foto = async () => {
    const blob = await componerImagen()
    if (!blob) return decir('No se pudo sacar la foto')
    descargar(blob)
    decir('Imagen guardada')
  }
  const compartirFoto = async () => {
    const blob = await componerImagen()
    if (!blob) return decir('No se pudo sacar la foto')
    if (!(await compartir(blob))) {
      descargar(blob)
      decir('Tu navegador no comparte archivos: se descargó')
    }
  }

  const Herramientas = (
    <>
      <button className="btn bn" aria-pressed={modo === 'rotar'} disabled={sinSel} onClick={() => elegirModo('rotar')}>
        Rotar
      </button>
      <button className="btn bn" aria-pressed={modo === 'escalar'} disabled={sinSel} onClick={() => elegirModo('escalar')}>
        Escalar
      </button>
      <button className="btn bn" disabled={sinSel} onClick={espejar}>
        Espejar
      </button>
      <button className="btn bn" disabled={!hayHistorial} onClick={deshacer}>
        Deshacer
      </button>
      <button className="btn bk" disabled={sinSel} onClick={borrar}>
        Borrar
      </button>
      <button className="btn bn" onClick={reset}>
        Reiniciar
      </button>
    </>
  )

  return (
    <section className="tat" aria-label="Modo tatuador">
      <div className="tat-top">
        <button className="btn bk volver" aria-label="Volver al comuñe" onClick={salir}>
          ← Volver
        </button>
        <h1 className="fd tat-titulo sh">
          <span>Tatuador</span>
        </h1>
        <button className="btn tat-guardar" onClick={guardarLocal}>
          Guardar
        </button>
      </div>

      <p className="lbl tat-ayuda" id="tat-ayuda">
        {sel
          ? modo === 'rotar'
            ? 'Arrastrá de costado para rotar'
            : modo === 'escalar'
              ? 'Arrastrá de costado para cambiar el tamaño'
              : 'Arrastrá el tatuaje sobre la piel'
          : 'Tocá un tatuaje del comuñe o de la paleta'}
      </p>
      <span className="chip f-yl tat-cuenta">{puestos} / {items.length} puestos</span>

      <div className="tat-tools" role="group" aria-label="Herramientas">
        <span className="lbl tat-sel">{sel ? `Seleccionado: ${sel.nombre}` : 'Nada seleccionado'}</span>
        {Herramientas}
        <button className="btn bn solo-m" onClick={foto}>
          Imagen
        </button>
        {puedeCompartir() && (
          <button className="btn bn solo-m" onClick={compartirFoto}>
            Compartir
          </button>
        )}
      </div>

      <div className="tat-paleta paper sh-paleta">
        <div className="fd tat-paleta-t">Paleta</div>
        <div className="lbl gris tat-paleta-s">{items.length} tatuajes · tocá para sumar</div>
        <div className="tat-tiles">
          {items.map((t) => {
            const puesto = t.puesto !== false
            return (
              <button
                key={t.id}
                className={`tile${t.id === selected && puesto ? ' on' : ''}${puesto ? ' puesto' : ''}`}
                aria-pressed={puesto}
                aria-label={`${t.nombre}${puesto ? ' (puesto)' : ''}`}
                onClick={() => (puesto ? select(t.id === selected ? null : t.id) : colocar(t.id))}
              >
                <img src={`${BASE}tatuajes/${t.file}`} alt="" />
              </button>
            )
          })}
        </div>
        <div className="tat-paleta-acc solo-d">
          <button className="btn yl" onClick={foto}>
            Guardar imagen
          </button>
          {puedeCompartir() && (
            <button className="btn bk" onClick={compartirFoto}>
              Compartir
            </button>
          )}
        </div>
      </div>

      <div className="tat-aviso" role="status" aria-live="polite">
        {aviso && <span className="chip f-bk">{aviso}</span>}
      </div>
    </section>
  )
}
