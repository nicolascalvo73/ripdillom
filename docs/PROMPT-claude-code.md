# Prompt para Claude Code — rip.dillom (Mondilab)

> Pegar todo lo de abajo en Claude Code, abierto en una carpeta NUEVA y vacía para el proyecto
> (ej. `C:\Users\nicol\Documents\codiguito\ripdillom-web`). Copiar antes en esa carpeta:
> `models/dilloms-v5-coloreado.glb`, `concept/tatuajes/*.png` (7), `claude-design-assets/muneco-v5-*.png`,
> y el export/handoff del diseño de Claude Design (frames, sistema de diseño, notas de animación).

---

## PROMPT

Vas a construir **"rip.dillom — La nueva violencia"**, un tributo fan (no oficial) como **Mondilab de Mondi Studio**. Desplegado en `labs.mondistudio.com.ar/ripdillom`. Mobile-first, sin scroll en el home, inmersivo.

### Qué es
Una escena 3D: un muñeco estilo Playmobil de Dillom flota en una nebulosa; el usuario lo orbita y hace zoom. Texto "DILLOM" arriba y "LA NUEVA VIOLENCIA" abajo. Cada parte del cuerpo abre una sección. El diseño ya está hecho en Claude Design (adjunto: frames, sistema de diseño, notas de animación). **El diseño manda**: colores, tipografías (Londrina Solid + Space Mono), globos de cómic, paneles, tiempos.

### Stack
Vite + React + TypeScript · three + @react-three/fiber + @react-three/drei · React Router · Zustand · Framer Motion (o CSS) · gltf-transform (CLI) para optimizar. Sin backend propio, salvo **una Cloudflare Pages Function** (`functions/api/aporte.ts`) para crear el pago de Mercado Pago. Deploy: Cloudflare Pages. Node LTS, pnpm o npm.

### Assets
- `public/models/dilloms.glb`: optimizarlo con gltf-transform (Meshopt/Draco, sin texturas; 5 meshes con material plano: `skin`, `hair`, `pants`, `shoes`, `face_ink`). Mantené los nombres. Cambiá `skin`, `hair`, `pants`, `shoes` a MeshPhysicalMaterial con clearcoat (~0.6–1.0) y roughness baja para un plástico brillante. Dejá `face_ink` mate.
- Unidades del modelo: la figura mide 1.0 de alto, pies en y=0, mira hacia +z. El lado derecho del muñeco es −x.
- Tatuajes: PNG con fondo transparente (línea negra). Se aplican como `<Decal>` de drei sobre la mesh `skin`, con multiplicación sobre la piel (que se vean como tinta, no como sticker).
- Billete de $100: objeto aparte (plano doblado levemente + textura generada o SVG según el diseño), asomando del bolsillo trasero derecho. Si el diseño trae el arte del billete, usalo.

### Posiciones de tatuajes (provisorias; deben ser editables en un JSON)
| Archivo | x | y | alto | Zona |
|---|---|---|---|---|
| drip.png | −0.075 | 0.805 | 0.035 | mejilla derecha (cara) |
| parca.png | −0.07 | 0.66 | 0.07 | pectoral derecho |
| retrato.png | +0.07 | 0.67 | 0.04 | pectoral izquierdo |
| espinas.png | 0.00 | 0.625 | 0.03 | esternón |
| dientes.png | 0.00 | 0.565 | 0.04 | abdomen alto |
| asap.png | −0.02 | 0.49 | 0.045 | abdomen bajo |
| calavera-muletas.png | +0.10 | 0.52 | 0.07 | flanco bajo (ajustar) |
Construí un **modo debug** (`?debug=1`) para arrastrar decals sobre el muñeco y exportar el JSON, así se afinan a ojo.

### Zonas tocables (hitboxes invisibles sobre el mismo modelo, no segmentes la malla)
"Derecho/izquierdo" = del muñeco. Cada zona: globo de cómic al hover (desktop) o primer toque (mobile); segundo toque/click entra. Distinguí toque de arrastre (umbral de movimiento) para no abrir secciones al orbitar.
| Zona | Aprox. en el modelo | Ruta | Globo |
|---|---|---|---|
| Cabeza | y 0.73–1.0 | /musica | MÚSICA |
| Pecho | frente, y 0.50–0.74, \|x\|<0.17 | /videos | VIDEOS |
| Brazo derecho | x<−0.17, y 0.30–0.72 | /redes | REDES |
| Brazo izquierdo | x>+0.17, y 0.30–0.72 | /shows | SHOWS |
| Espalda | z<0, y 0.45–0.74 | /merch | TIENDA |
| Pierna derecha + pie | x<0, y<0.30 | /quien-soy | QUIÉN SOY |
| Pierna izquierda + pie | x>0, y<0.30 | /tatuador | TATUAJES |
| Billete $100 | bolsillo trasero derecho (x≈−0.07, y≈0.36, z≈−0.14) | /aporte | TOMÁ $100 |
| Entrepierna (easter egg) | trapecio invertido frontal tipo slip: de la cintura baja (y≈0.443) a y≈0.30, ancho ±0.08 arriba a ±0.03 abajo, solo z>0 | ninguna | ¡EPA! (al tocar, 1.5 s, el muñeco rebota) |
Las zonas de piernas arrancan debajo de y=0.30 para no pisar la del easter egg. **Probar en celular** que no se activen por error. Si la zona está de espaldas a la cámara, mostrar indicador de borde "↻ girá".

### Audio de fondo
- Una canción en loop de fondo, desde que termina la carga. Los navegadores bloquean el autoplay, así que la pantalla de carga termina en un botón **"ENTRAR"** (en el estilo del diseño) y el audio arranca con ese toque, con fade-in de ~1.5 s.
- Botón de **mute/unmute** siempre visible (esquina, accesible, con `aria-pressed` y `aria-label`), con ícono animado mínimo. Recordar la preferencia en localStorage (try/catch). Si el usuario ya había muteado, entra silenciado.
- Canción: **"Souvenir"** (del álbum La nueva violencia). Dejá la fuente configurable en `src/content/audio.json` (`src`, `titulo`, `artista`, `volumen`) para poder cambiarla sin tocar código, y mostrá un crédito discreto "♪ Souvenir — Dillom" (link al tema en Spotify/YouTube) junto al botón de mute.
- Archivo: `public/audio/fondo.mp3` (o .ogg + .mp3), ~128 kbps, ideal < 3 MB, loop sin corte audible; **no lo precargues** antes de "ENTRAR" para no frenar la carga. Usar `<audio>` o Web Audio; pausar al ocultarse la pestaña (`visibilitychange`) y reanudar al volver; bajar el volumen al abrir un video embebido y restaurarlo al cerrarlo (que no se pisen).
- Los efectos de sonido opcionales (hover/tap) quedan para después y respetan el mismo mute.
- El archivo de audio lo provee Choro; mientras no esté, el botón de mute funciona sin romper nada.

### Cámara y escena
OrbitControls con damping, límites de zoom (min/max) y de polar angle; sin pan. Fly-to de cámara (tween) al abrir cada sección, centrando la parte tocada y desplazando el muñeco para que el panel no lo tape; volver al cerrar. Muñeco con flotación suave (sin rotar solo, salvo un giro lento de idle que se corta al interactuar). Luces: key + rim rosa/amarilla para integrar con la paleta; sombra/reflejo sutil, sin sobrecargar.

### Fondo
Nebulosa con shader propio (ruido fbm, paleta negro/rosa/amarillo), más grano y semitono (post-proceso liviano o shader en el fondo). Partículas instanciadas (polvo, confeti, billetes estilizados) con parallax. Máximo 2 efectos pesados simultáneos. DPR máx 1.5 en mobile / 2 en desktop; `PerformanceMonitor` de drei para degradar calidad si cae el FPS.

### Interfaz
- Rutas con React Router; cada sección es un panel DOM (bottom sheet en mobile, lateral en desktop) sobre el canvas, que persiste montado entre rutas (no recargar el 3D).
- Contenido editable en `src/content/*.json`: `musica`, `videos`, `redes`, `shows`, `merch`, `quien-soy`, `aporte`. Usar placeholders entre corchetes donde falten datos (tracklist, bio, handles, links). **No inventes datos reales**: fechas de shows solo si están verificadas; si no, estado "fechas por anunciar".
- Música/Videos: embeds de Spotify/YouTube con carga diferida (click-to-load para no bajar peso).
- Merch (`/merch`) = **mini tienda de mentira (parodia)**. Catálogo en `src/content/merch.json` (id, nombre, descripción corta y graciosa, precio en ARS, categoría, imágenes, talles/variantes opcionales). Productos (todos inexistentes, imágenes generadas con IA, tema "La nueva violencia"): **el muñequito de Dillom (producto estrella, primero en la grilla y destacado)**, gorras, remeras, buzos, tazas, mates, termos, toallitas femeninas, estampitas, manteles bordados, cartucheras para revólver, y más. El detalle del muñequito de Dillom muestra una **vista 3D giratoria del mismo modelo** (Canvas liviano cargado de forma diferida, con `muneco-v5-frente.png` como imagen de respaldo/miniatura). Funcionalidad: grilla con filtros por categoría, detalle de producto (galería, talle/variante, cantidad), **carrito** (drawer/panel: agregar, quitar, cambiar cantidad, subtotal; estado con Zustand, persistido en localStorage con try/catch), botón "Ir a pagar". Al avanzar al pago **no hay pago real**: se abre un modal en el estilo del diseño con el mensaje **"AHRE QUE ERA DE MENTIRITA"**, aclarando que los productos no existen y no se puede comprar; botones "Volver a la tienda", "Vaciar carrito" y, opcional, "Tomá $100" que lleva a `/aporte`. Dejar claro en toda la tienda (banner fijo o sello visible) que es una **tienda de mentira / parodia de fans**. No pedir datos personales ni tarjeta en ningún paso. Las imágenes de producto son placeholders hasta que las genere yo: usá un componente que tolere imagen faltante (fondo de fotocopia + nombre del producto). Sin logos oficiales ni fotos del artista en los productos.
- Aporte "Tomá $100" (`/aporte`): formulario simple (monto en ARS con atajos tipo $100/$500/$1000 y campo libre, nombre opcional, mensaje opcional corto). Al enviar, el front hace POST a `/api/aporte`; esa **Pages Function** crea una preferencia de **Mercado Pago Checkout Pro** (API de preferencias) y devuelve el `init_point`, al que se redirige al usuario. Requisitos de seguridad:
  - El **Access Token de Mercado Pago vive solo como variable secreta de entorno** (`MP_ACCESS_TOKEN` en Cloudflare); NUNCA en el código del front, en el repo ni en logs. Incluir `.env.example` sin valores y `.gitignore` que excluya `.env*`.
  - Validar en el servidor: monto numérico entero, mínimo y máximo razonables (configurables, ej. 100–100000 ARS), moneda ARS, longitud del nombre/mensaje; sanitizar. Ignorar cualquier precio que no pase la validación. Rate limit básico y CORS limitado al dominio propio.
  - Título de la preferencia fijo ("Aporte para el creador de la web"), `back_urls` (success/failure/pending) a pantallas dentro del sitio (`/aporte/gracias`, etc.) y `external_reference` generado en el servidor.
  - Aclarar en el formulario que el aporte va al creador de la web, no al artista; no guardar datos de tarjeta ni de pago (todo ocurre en Mercado Pago).
  - Manejo de errores claro (API caída, monto inválido) con mensajes en el estilo del diseño. Modo de prueba con credenciales de test mientras se desarrolla.
  - No implementes webhooks ni base de datos en esta versión; opcional como mejora futura.
- Quién soy: bio propia y corta + link a Wikipedia (no copiar texto de Wikipedia).
- Modo tatuador (`/tatuador`): pantalla dedicada, paleta de los 7 tatuajes, arrastrar/rotar/escalar sobre el muñeco, deshacer, reset, guardar en localStorage (siempre con try/catch) y exportar PNG (captura del canvas con marca discreta de la web).
- Pantalla de carga con progreso real (`useProgress`) que termina en el botón ENTRAR (ver Audio).
- Fallback sin WebGL: menú simple con las mismas secciones. Navegación de respaldo siempre disponible (también para teclado/lectores de pantalla): hotspots con rol de botón y `aria-label`; respetar `prefers-reduced-motion`.
- Footer/aviso: "Proyecto de fans, no oficial". Al final del proyecto, "Powered by Mondi Studio" enlazando a mondistudio.com.ar (dejarlo como último paso, no ahora).
- SEO: meta, Open Graph con una captura del muñeco, `title` por ruta.

### Legal / criterio
No usar el logo oficial, fotos del artista ni la tapa del álbum. Todo es ilustración propia (muñeco) con estética inspirada. No publicar datos que no estén verificados.

### Cómo trabajar (iterativo, con checkpoints)
Trabajá por fases y **pará al final de cada una** para que yo revise (`npm run dev` + captura o descripción):
1. Scaffold + escena con el modelo, luces, órbita/zoom y fondo simple. **Checkpoint.**
2. Material plástico, tatuajes como decals, billete, modo debug. **Checkpoint.**
3. Hitboxes, globos de cómic, hover/tap, fly-to y rutas con paneles vacíos. **Checkpoint.**
4. Fondo de nebulosa + grano/semitono + partículas; pantalla de carga. **Checkpoint.**
5. Contenido real de cada panel desde JSON, modo tatuador, easter egg. **Checkpoint.**
5b. Formulario de aporte + Pages Function de Mercado Pago (primero con credenciales de prueba). **Checkpoint.**
6. Rendimiento (probar en un celular medio), accesibilidad, fallback, SEO, deploy a Cloudflare Pages, y por último el "Powered by Mondi Studio".
Antes de empezar, leé el diseño adjunto, resumime en 10 líneas lo que entendiste y listá cualquier ambigüedad o dato que falte.

## FIN DEL PROMPT
