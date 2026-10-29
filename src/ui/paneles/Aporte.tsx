import { useState } from 'react'
import { useLocation } from 'react-router-dom'

const ATAJOS = [100, 500, 1000]
const MIN = 100
const MAX = 100000

const FINALES: Record<string, { titulo: string; texto: string }> = {
  gracias: { titulo: 'GRACIAS', texto: 'Tu aporte llegó al creador de la web. Sos un grande.' },
  error: { titulo: 'NO SALIÓ', texto: 'El pago no se completó. No se cobró nada. Podés intentar de nuevo.' },
  pendiente: { titulo: 'PENDIENTE', texto: 'Mercado Pago está procesando el pago. Cuando se acredite, listo.' },
}

export function Aporte() {
  const { pathname } = useLocation()
  const final = FINALES[pathname.split('/')[2] ?? '']
  const [monto, setMonto] = useState('100')
  const [nombre, setNombre] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [estado, setEstado] = useState<'libre' | 'enviando'>('libre')
  const [error, setError] = useState('')

  const n = Number(monto)
  const valido = Number.isInteger(n) && n >= MIN && n <= MAX

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    if (!valido) {
      setError(`Poné un monto entero entre $${MIN} y $${MAX}.`)
      return
    }
    setError('')
    setEstado('enviando')
    try {
      const r = await fetch('/api/aporte', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ monto: n, nombre, mensaje }),
      })
      const d = (await r.json().catch(() => ({}))) as { init_point?: string; error?: string }
      if (!r.ok || !d.init_point) throw new Error(d.error ?? 'No pudimos iniciar el aporte.')
      window.location.assign(d.init_point)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Algo falló. Probá de nuevo.')
      setEstado('libre')
    }
  }

  if (final) {
    return (
      <div className="aporte-final">
        <p className="fd aporte-titulo">{final.titulo}</p>
        <p>{final.texto}</p>
      </div>
    )
  }

  return (
    <form className="aporte" onSubmit={enviar} noValidate>
      <p className="aporte-aviso">
        Este aporte va <b>al creador de la web</b>, no al artista. El pago se hace en Mercado Pago: acá no guardamos datos de tarjeta ni de pago.
      </p>
      <div className="lbl">Monto (ARS)</div>
      <div className="chips" role="group" aria-label="Montos rápidos">
        {ATAJOS.map((a) => (
          <button type="button" key={a} className={`chip${n === a ? ' f-pk' : ''}`} aria-pressed={n === a} onClick={() => setMonto(String(a))}>
            ${a}
          </button>
        ))}
      </div>
      <input
        className="campo"
        inputMode="numeric"
        aria-label="Monto en pesos"
        value={monto}
        onChange={(e) => setMonto(e.target.value.replace(/\D/g, '').slice(0, 6))}
      />
      <label className="lbl" htmlFor="ap-nombre">
        Nombre (opcional)
      </label>
      <input id="ap-nombre" className="campo" maxLength={40} value={nombre} onChange={(e) => setNombre(e.target.value)} />
      <label className="lbl" htmlFor="ap-msg">
        Mensaje (opcional)
      </label>
      <textarea id="ap-msg" className="campo" maxLength={140} rows={2} value={mensaje} onChange={(e) => setMensaje(e.target.value)} />
      {error && (
        <p className="aporte-error" role="alert">
          {error}
        </p>
      )}
      <button className="btn" type="submit" disabled={estado === 'enviando'}>
        {estado === 'enviando' ? 'Abriendo Mercado Pago…' : `Aportar $${valido ? n : '…'}`}
      </button>
    </form>
  )
}
