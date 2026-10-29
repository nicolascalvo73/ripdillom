const LINK = 'https://link.mercadopago.com.ar/tomacienpeso'

export function Aporte() {
  return (
    <div className="aporte">
      <p className="fd aporte-titulo">TOMÁ $100</p>
      <p className="aporte-aviso">
        Este aporte va <b>al creador de la web</b>, no al artista. El pago se hace en Mercado Pago: acá no pedimos ni guardamos datos de tarjeta ni de pago.
      </p>
      <a className="btn" href={LINK} target="_blank" rel="noopener noreferrer">
        Aportar con Mercado Pago ↗
      </a>
    </div>
  )
}
