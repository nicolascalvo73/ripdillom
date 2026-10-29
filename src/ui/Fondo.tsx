import { useEscena, useTatuando } from '../state/escena'
import { useCarga } from '../state/carga'
import { useCalidad } from '../state/calidad'
import '../styles/fondo.css'

/**
 * Fondo de la escena: nebulosa sucia con semitono (CSS, estática) y grano fijo por encima de todo.
 * La nebulosa se espeja al mirar la espalda y con un panel abierto, igual que en el diseño.
 * El grano se enciende al ENTRAR: la pantalla de carga ya trae el suyo.
 */
export function Fondo() {
  const espejo = useEscena((s) => s.atras || !!s.zona)
  const entro = useCarga((s) => s.entro)
  const oscuro = useTatuando()
  const sinSemitono = useCalidad((s) => s.nivel >= 2)
  return (
    <>
      <div className={`fondo neb${espejo ? ' espejo' : ''}${sinSemitono ? ' sin-semitono' : ''}${oscuro ? ' oscuro' : ''}`} aria-hidden="true" />
      {entro && <div className="grano" aria-hidden="true" />}
    </>
  )
}
