import { useState } from 'react'
import { DEBUG, useTatuajes } from '../state/tatuajes'

/** Panel del modo ?debug=1: elegir tatuaje, ajustar y exportar el JSON de posiciones. */
export function DebugPanel() {
  const { items, selected, select, patch, reset } = useTatuajes()
  const [copiado, setCopiado] = useState(false)
  if (!DEBUG) return null

  const json = JSON.stringify(items, null, 2)
  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(json)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 1500)
    } catch {
      window.prompt('Copiá el JSON:', json)
    }
  }
  const sel = items.find((t) => t.id === selected)

  return (
    <aside className="debug" aria-label="Modo debug de tatuajes">
      <p className="lbl">Debug · tatuajes</p>
      <p className="dbg-hint">Tocá un tatuaje y arrastralo sobre la piel. Shift + rueda: tamaño.</p>
      <ul>
        {items.map((t) => (
          <li key={t.id}>
            <button className={t.id === selected ? 'on' : ''} onClick={() => select(t.id === selected ? null : t.id)}>
              {t.id}
            </button>
            <span>
              {t.x.toFixed(3)}, {t.y.toFixed(3)} · {t.alto.toFixed(3)}
            </span>
          </li>
        ))}
      </ul>
      {sel && (
        <div className="dbg-row">
          <button onClick={() => patch(sel.id, { alto: +(sel.alto * 0.94).toFixed(3) })}>−</button>
          <button onClick={() => patch(sel.id, { alto: +(sel.alto * 1.06).toFixed(3) })}>+</button>
        </div>
      )}
      <div className="dbg-row">
        <button onClick={copiar}>{copiado ? '¡Copiado!' : 'Copiar JSON'}</button>
        <button onClick={reset}>Reset</button>
      </div>
    </aside>
  )
}
