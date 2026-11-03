# rip.dillom — La nueva violencia

Sitio interactivo (Mondilab · Mondi Studio): un muñeco 3D para girar, tocar y tatuar. Cada parte del cuerpo abre una sección (música, videos, redes, shows, tienda, aporte, quién soy) y hay un modo tatuador.

## Correrlo

Requiere Node 22 o superior.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + build a dist/
npm run preview    # sirve dist/ localmente
npm run lint       # oxlint
npm run typecheck  # tsc -b
```

`?debug=1` en la URL activa el panel para ajustar las posiciones de los tatuajes y exportarlas como JSON (pegarlo en `src/content/tatuajes.json`).

## Variables de entorno

| Variable | Dónde | Para qué |
|---|---|---|
| `BASE_PATH` | build | Ruta base del sitio. Por defecto `/ripdillom/`. En `npm run dev` siempre es `/`. |

No hay secretos: el aporte usa un link de pago de Mercado Pago (ver Decisiones), así que no hace falta `MP_ACCESS_TOKEN`.

## Estructura

```
src/
  App.tsx            rutas, canvas y paneles
  scene/             escena 3D (muñeco, cámara, zonas tocables, tatuajes, billete, partículas)
  ui/                interfaz DOM (carga, panel, sonido, tatuador, pie, navegación de respaldo)
  ui/paneles/        contenido de cada sección (Merch, Aporte, Embed, Vista3D, Secciones)
  state/             stores de Zustand (escena, carrito, tatuajes, audio, carga, calidad)
  content/*.json     textos y datos editables sin tocar código
  styles/            CSS por área
  lib/               utilidades (captura PNG, zonas, WebGL, layout)
public/
  models/            dilloms.glb (original) y dilloms.opt.glb (el que se carga)
  audio/fondo.mp3    música de fondo
  tatuajes/          PNG de los 7 tatuajes
  img/, img/merch/   renders del muñeco y fotos de productos
diseno/              diseño de referencia (HTML/CSS por frame + handoff)
docs/                prompts y especificación del proyecto
```

Rutas: `/musica`, `/videos`, `/redes`, `/shows`, `/merch`, `/aporte`, `/quien-soy`, `/tatuador`.

### Editar contenido

- `src/content/merch.json`: catálogo de la tienda (la base está en `docs/merch.json`).
- `src/content/audio.json`: canción de fondo (`src`, `titulo`, `artista`, `volumen`, `url`).
- `src/content/zonas.json`: hitboxes, textos de los globos y encuadre de cámara por sección.
- `musica`, `videos`, `redes`, `shows`, `quien-soy`: textos y links de cada panel.

Para regenerar el modelo optimizado después de cambiar `dilloms.glb`: `npm run optimize:model`.

## Deploy

Se publica en **GitHub Pages** con `.github/workflows/pages.yml`: cada push a `main` corre lint y build, copia `index.html` a `404.html` (GitHub Pages no tiene rewrites, así las rutas profundas funcionan) y despliega `dist/`.

Para publicar en otro lado (por ejemplo Cloudflare Pages en `labs.mondistudio.com.ar/ripdillom`):

1. Build command `npm run build`, output `dist`, con `BASE_PATH` igual a la ruta donde va a vivir.
2. Configurar que las rutas desconocidas sirvan `index.html` (SPA).
3. Actualizar `og:url` e imágenes de Open Graph en `index.html`, que hoy apuntan a GitHub Pages.

## Decisiones

- **Aporte con link de pago en vez de Checkout Pro.** La especificación original pedía una Pages Function que creara preferencias de Mercado Pago con `MP_ACCESS_TOKEN`. Se reemplazó por un link de pago fijo (`link.mercadopago.com.ar/tomacienpeso`): no hay backend ni secretos que custodiar y funciona en hosting estático. Contra: el monto lo elige la persona en Mercado Pago, sin validación propia.
- **GitHub Pages en vez de Cloudflare Pages.** Al no haber función de servidor, alcanza con hosting estático.
- **Sin aviso "fan · no oficial".** Se quitó a pedido. Igual se mantiene el criterio legal: sin logo oficial, fotos del artista ni tapa del álbum; el muñeco es ilustración propia.
- **La tienda se presenta como real.** Lo único que revela que es de mentira es el modal final de "Ir a pagar". No se piden datos personales ni de tarjeta.
- **Lint con oxlint en vez de ESLint.** El proyecto usa TypeScript 7, que no expone la API de JavaScript que necesita typescript-eslint. Las pocas supresiones que hay en el código llevan el motivo al lado.
- **Contenido sin datos inventados.** Shows "a confirmar" mientras no haya fechas verificadas; lo que falta queda como texto entre corchetes en `src/content/*.json`.

## Pendiente

- Bio de "Quién soy" (`src/content/quien-soy.json`): hoy tiene el texto entre corchetes. Tiene que ser propia, no copiada de Wikipedia.
