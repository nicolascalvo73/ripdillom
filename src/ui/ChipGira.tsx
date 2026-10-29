import { useEscena } from '../state/escena'
import { useCarga } from '../state/carga'

/** Indicador de borde: hay zonas que hoy miran para el otro lado. Tocarlo da media vuelta al comuñe. */
export function ChipGira() {
  const zona = useEscena((s) => s.zona)
  const atras = useEscena((s) => s.atras)
  const girar = useEscena((s) => s.girar)
  const entro = useCarga((s) => s.entro)
  const visible = entro && !zona

  return (
    <div className={`chip-gira sh${visible ? ' on' : ''}`} aria-hidden={!visible}>
      <button onClick={girar} tabIndex={visible ? 0 : -1}>
        <span className="fd">↻</span>
        <span className="lbl">
          Girá
          <br />
          <em>{atras ? 'Música · Videos' : 'Merch · $100'}</em>
        </span>
      </button>
    </div>
  )
}
