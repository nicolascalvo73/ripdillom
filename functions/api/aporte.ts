/// Cloudflare Pages Function: POST /api/aporte → crea una preferencia de Mercado Pago Checkout Pro y devuelve el init_point.
/// El Access Token vive solo como variable secreta (MP_ACCESS_TOKEN). No se guarda nada ni se registran datos de pago.

interface Env {
  MP_ACCESS_TOKEN: string
  /** Origen público del sitio (https://dominio, sin barra final). Se usa para CORS y back_urls. */
  SITE_URL?: string
  MONTO_MIN?: string
  MONTO_MAX?: string
}

type Contexto = { request: Request; env: Env }

const VENTANA_MS = 60_000
const MAX_POR_VENTANA = 5
/** Rate limit básico por IP, en memoria del isolate (best effort). */
const visitas = new Map<string, number[]>()

function limitado(ip: string): boolean {
  const ahora = Date.now()
  const recientes = (visitas.get(ip) ?? []).filter((t) => ahora - t < VENTANA_MS)
  recientes.push(ahora)
  visitas.set(ip, recientes)
  if (visitas.size > 5000) visitas.clear()
  return recientes.length > MAX_POR_VENTANA
}

const limpiar = (v: unknown, max: number) =>
  typeof v === 'string' ? v.replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, max) : ''

function json(cuerpo: unknown, status: number, origen: string | null) {
  return new Response(JSON.stringify(cuerpo), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...(origen ? { 'access-control-allow-origin': origen, vary: 'Origin' } : {}),
    },
  })
}

export const onRequestOptions = ({ request, env }: Contexto) => {
  const origen = request.headers.get('origin')
  const permitido = env.SITE_URL ?? new URL(request.url).origin
  if (origen !== permitido) return new Response(null, { status: 403 })
  return new Response(null, {
    status: 204,
    headers: {
      'access-control-allow-origin': permitido,
      'access-control-allow-methods': 'POST, OPTIONS',
      'access-control-allow-headers': 'content-type',
      vary: 'Origin',
    },
  })
}

export const onRequestPost = async ({ request, env }: Contexto) => {
  const sitio = env.SITE_URL ?? new URL(request.url).origin
  const origen = request.headers.get('origin')
  if (origen && origen !== sitio) return json({ error: 'Origen no permitido.' }, 403, null)

  if (!env.MP_ACCESS_TOKEN) return json({ error: 'El aporte no está configurado todavía.' }, 503, origen)

  const ip = request.headers.get('cf-connecting-ip') ?? 'desconocida'
  if (limitado(ip)) return json({ error: 'Demasiados intentos. Probá de nuevo en un minuto.' }, 429, origen)

  let datos: Record<string, unknown>
  try {
    datos = (await request.json()) as Record<string, unknown>
  } catch {
    return json({ error: 'Pedido inválido.' }, 400, origen)
  }

  const min = Number(env.MONTO_MIN ?? 100)
  const max = Number(env.MONTO_MAX ?? 100000)
  const monto = datos.monto
  if (typeof monto !== 'number' || !Number.isInteger(monto) || monto < min || monto > max) {
    return json({ error: `El monto debe ser un número entero entre $${min} y $${max}.` }, 400, origen)
  }
  const nombre = limpiar(datos.nombre, 40)
  const mensaje = limpiar(datos.mensaje, 140)

  const ref = crypto.randomUUID()
  const preferencia = {
    items: [{ title: 'Aporte para el creador de la web', quantity: 1, unit_price: monto, currency_id: 'ARS' }],
    external_reference: ref,
    back_urls: {
      success: `${sitio}/aporte/gracias`,
      failure: `${sitio}/aporte/error`,
      pending: `${sitio}/aporte/pendiente`,
    },
    auto_return: 'approved',
    ...(nombre || mensaje ? { metadata: { nombre, mensaje } } : {}),
  }

  let respuesta: Response
  try {
    respuesta = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${env.MP_ACCESS_TOKEN}` },
      body: JSON.stringify(preferencia),
    })
  } catch {
    return json({ error: 'Mercado Pago no responde. Probá más tarde.' }, 502, origen)
  }
  if (!respuesta.ok) return json({ error: 'Mercado Pago rechazó el pedido. Probá más tarde.' }, 502, origen)

  const pref = (await respuesta.json()) as { init_point?: string; sandbox_init_point?: string }
  // Con credenciales de prueba (TEST-…) corresponde el sandbox.
  const destino = env.MP_ACCESS_TOKEN.startsWith('TEST-') ? (pref.sandbox_init_point ?? pref.init_point) : pref.init_point
  if (!destino) return json({ error: 'Respuesta inesperada de Mercado Pago.' }, 502, origen)
  return json({ init_point: destino }, 200, origen)
}
