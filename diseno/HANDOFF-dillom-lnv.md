# HANDOFF · Dillom — La nueva violencia

Paquete para desarrollo en **React + React Three Fiber**. Fuente de verdad visual: el proyecto de diseño publicado (lienzo con 50+ frames). Este documento fija valores exactos; donde el diseño no definió algo se marca **[PROPUESTA]** (decisión mía para destrabar, a confirmar) o **[PENDIENTE]** (falta contenido).

Alcance: experiencia de una sola pantalla, sin scroll en home, mobile first (390×844) y desktop (1440×900). Sin logo oficial ni fotos del artista.

---

## 0. Convenciones y supuestos

- Los renders del muñeco en el diseño (PNG de frente y de espalda) son **stand-ins 2D** del modelo 3D final. Las zonas tocables se definieron en % sobre esos renders; en R3F se deben reproducir como volúmenes/meshes invisibles equivalentes (ver §4).
- Nombre del archivo = nombre del frame (`Main.dc.html`, etc.). Los nombres exactos están en §3.
- El panel que se abre desde la espalda se llama **TIENDA** (título del panel); el globo de la zona dice **MERCH** (decisión del cliente). No unificar sin preguntar.
- Idioma de UI: español rioplatense. Sin emojis. Flechas tipográficas (`→ ← ↗ ↻`).

---

## 1. Sistema de diseño

### 1.1 Colores

| Token | Hex | Uso |
|---|---|---|
| `--pk` | `#FF2E9A` | Rosa principal: títulos de panel, globos rosa, acentos, ondas del mute |
| `--pk2` | `#B80F66` | Rosa oscuro: precios, sello RECHAZADO, ícono del mute |
| `--yl` | `#F7E92B` | Amarillo: botón primario, globos amarillos, billete, contornos de hotspot |
| `--bk` | `#0D0A0C` | Negro base: bordes, sombras duras, texto sobre hueso |
| `--bk2` | `#1C1418` | Negro cálido: superficies oscuras secundarias |
| `--bn` | `#F2EBDD` | Hueso: papel de paneles, texto sobre negro |
| `--bn2` | `#D9CDB6` | Hueso oscuro: cinta secundaria |
| `--gr` | `#A99FA5` | Gris: etiquetas secundarias sobre fondo oscuro |
| texto secundario sobre papel | `#5d5258` | Etiquetas `[placeholder]` y notas (usado inline) |
| overlay modales | `rgba(13,10,12,.62)` (carrito) / `.72–.74` (pago) | Atenuado del fondo |

Contraste: negro sobre amarillo/rosa/hueso cumple AA. `--pk2` sobre hueso se usa solo en texto grande (precios ≥24px).

### 1.2 Tipografías (Google Fonts)

- **Londrina Solid** 400/900 — display. Siempre `text-transform: uppercase`, `line-height: .9`, `letter-spacing: .01em`. Peso real usado: 900.
- **Space Mono** 400/700 — UI y texto corrido.

```
https://fonts.googleapis.com/css2?family=Londrina+Solid:wght@400;900&family=Space+Mono:wght@400;700&display=swap
```

| Uso | Familia / peso | Tamaño (mobile → desktop) | Line-height |
|---|---|---|---|
| Título DILLOM (letras recortadas) | Londrina 900 | ~54–74 px → 102–132 px (cada letra distinta) | .92 |
| Strap "La nueva / Violencia" | Londrina 900 | 30/42 px → 52/72 px | .9 |
| Título de panel (`.ph h2`) | Londrina 900 | 44 px (base), 40 px en Tienda mobile, 50–56 px en desktop | .9 |
| Globo de cómic | Londrina 900 | 28 px (base), 40 px en desktop de espalda | .92 |
| Nombre en tarjeta de producto (`.pc .nm`) | Space Mono 700 | 12 px | 1.25 |
| Precio (`.pc .pr`) | Londrina 900 | 24 px | 1.05 |
| Texto corrido de panel | Space Mono 400 | 13–15 px | 1.5–1.55 |
| Etiqueta (`.lbl`) | Space Mono 700 | 11 px, `letter-spacing:.1em`, uppercase | 1.4 |
| Botón (`.btn`) | Space Mono 700 | 13 px (11–16 según contexto), `letter-spacing:.06em`, uppercase | 1.4 |
| Chip | Space Mono 700 | 11 px, `.08em`, uppercase | — |
| Sello (`.stamp`) | Space Mono 700 | 10 px (11–13 en tienda), `.12em`, uppercase | 1.25 |
| Mensaje "AHRE QUE ERA DE MENTIRITA" | Londrina 900 | 66 px mobile / 112 px desktop | .84–.86 |
| Botón ENTRAR | Londrina 900 | 64 px mobile / 92 px desktop (`letter-spacing:.04em`) | .9 |
| Porcentaje de carga | Londrina 900 | 118–132 px mobile / 210–300 px desktop | .8 |

Base `.dl`: Space Mono 13 px / 1.4.

### 1.3 Espaciado

Escala (px): **4 · 6 · 8 · 10 · 12 · 14 · 16 · 18 · 20 · 24 · 28 · 32 · 36**.
- Gutter lateral mobile: 16 px (tienda) / 20 px (paneles de contenido). Desktop: 32–36 px.
- Gap de grilla de productos: 14×12 px mobile (2 col), 18 px desktop (3 col).
- Zona táctil mínima: **44×44 px** (todo botón, chip filtro 40 px de alto mínimo en filtros, `+ −` y quitar 44 px).

### 1.4 Radios

Sistema casi sin radios: cantos **rectos** y bordes rasgados por `clip-path`. Excepciones: hotspot `border-radius: 42%`, ondas del mute y sombra del piso `50%`, letras recortadas `2px 5px 3px 6px`.

### 1.5 Bordes y sombras

- Borde estándar: **2 px sólido `--bk`**; modales y botón ENTRAR: 3 px (ENTRAR desktop 4 px).
- Sombras **duras, sin blur**: `3px 3px 0` (botones, mute, carrito), `4px 4px 0` (tarjeta, tira), `5–6px` (modal, ENTRAR).
- Sombras de contorno con `filter: drop-shadow` para elementos con `clip-path` (globo, panel, hoja): `.sh` = `drop-shadow(4px 4px 0 #0D0A0C)`, `.shu` = `drop-shadow(0 -4px 0 #0D0A0C)` (bottom sheet), panel lateral `drop-shadow(-6px 0 0 #0D0A0C)`. **El `clip-path` recorta cualquier `filter` del mismo elemento: poner el filtro en un wrapper.**
- Sombra del muñeco: `drop-shadow(0 22px 20px rgba(0,0,0,.6))`; sombra de piso = blob radial (`rgba(0,0,0,.75)` → transparente 70 %).

### 1.6 Texturas

| Textura | Receta |
|---|---|
| **Nebulosa sucia** (`.neb`) | Negro + 5 `radial-gradient`: rosa .78 (38×26 % en 8 % 20 %), amarillo .6 (30×20 % en 94 % 36 %), rosa .62 (52×30 % en 72 % 90 %), amarillo .3 (28×18 % en 14 % 74 %), violeta `#2b0f1f` central. Encima, semitono de puntos negros (`radial-gradient(circle, rgba(13,10,12,.92) 1.4px…)` a 6 px) enmascarado con `linear-gradient(115deg,#000,transparent 46%,#000)`. En paneles y espalda se espeja (`scaleX(-1)`). |
| **Grano** (`.grain::after`) | Overlay a pantalla completa, `mix-blend-mode: overlay`, opacidad .55, SVG `feTurbulence` fractalNoise `baseFrequency .9`, 2 octavas, tile 160 px, `z-index:60`, `pointer-events:none`. Textura fija, no se anima. |
| **Papel / fotocopia** (`.paper`) | Fondo `#F2EBDD` + puntos `rgba(13,10,12,.08)` a 5 px. Bordes superiores/laterales rasgados con `clip-path`. |
| **Semitono rosa** | `radial-gradient(circle, #FF2E9A 1.4–1.6px, transparent 1.9–2.1px)` a 5–7 px. Se usa en: placeholder de producto (`rgba(255,46,154,.55)` a 7 px), billete, hotspot activo (6 px), estrellas `.ht`, ondas del mute. |
| **Imagen faltante** | `#1C1418` + rayas a 45° `rgba(242,235,221,.14)` 2 px cada 12 px. |

### 1.7 Elementos decorativos

Estrellas (`clip-path` de 5 puntas, 20–80 px, amarillas o semitono rosa), confeti (11×5 px, rosa/amarillo), puntos (3 px, hueso .75), cinta adhesiva (84×26 px; amarillo / rosa / hueso `#D9CDB6`, opacidad .92, borde dentado). Capas de parallax y deriva en §5.

---

## 2. Componentes y estados

Convención de estados: **reposo · hover (puntero) · foco-teclado · presionado · deshabilitado · especial**. El foco de teclado usa el mismo lenguaje: contorno punteado amarillo 3 px, offset 2–3 px.

### 2.1 Globo de cómic (`.bub`)

- Clase base + color: `.bub` (hueso) · `.pk` · `.yl` · `.bk` (texto hueso).
- Cola por clase: `.t-bl` (abajo-izq) · `.t-br` · `.t-tl` · `.t-tr`; la cola apunta a la zona. Con cola arriba el padding vertical se invierte (26/11).
- Padding `11 20 26` (cola abajo); móvil 28 px de fuente, desktop 40 px (`14 24 30`).
- Rotación por variable `--r`, entre −6° y 6°. `white-space: nowrap`. Contorno con `.sh` en wrapper.
- Estados: **oculto** → **visible** (pop) → **saliendo**. En mobile el primer toque lo muestra (queda hasta 4 s); el segundo toque en la misma zona entra al panel.
- Variante ¡EPA!: sin navegación (ver §5.5).

### 2.2 Hotspot (zona tocable)

Elemento invisible (`<button>` con `aria-label`). Estados:
- **reposo**: invisible.
- **hover/activo (`.on`)**: contorno punteado amarillo 3 px + relleno de semitono rosa (`rgba(255,46,154,.95)` punto 1.6 px a 6 px). Duración 100 ms.
- **debug (`.dbg`)**: contorno punteado rosa 2 px + relleno rosa .12. Activar con `?debug` para ver las zonas.
- **tapada** (zona que mira para atrás): chip de borde "↻ Girá" (ver §5.3).
- Etiquetas accesibles exactas: "Cabeza — Música", "Pecho — Videos", "Brazo derecho — Redes", "Brazo izquierdo — Shows", "Espalda — Merch", "Billete — Tomá $100", "Pierna derecha — Quién soy", "Pierna izquierda — Tatuajes".

### 2.3 Panel — bottom sheet (mobile)

- Wrapper `.shu` (sombra superior) que contiene `.sheet.paper` con `clip-path` rasgado arriba. Alto: **544 px** (contenido), **724 px** (Tienda), **664 px** (cajón de carrito), 540 px (carrito vacío). Padding `34 20 0` (Tienda `34 16 0`).
- Asa: barra negra 56×6 px centrada, `top:18px`.
- Cabecera `.ph`: título en tira rosa (`h2`, rotado −1.5°, borde 2 px, sombra 4 px) + botón `.xb` (44 px, negro, X hueso, sombra rosa) a la derecha.
- Contenido con scroll interno; fade inferior de 56 px (`linear-gradient(transparent, #F2EBDD)`).
- Estados: **cerrado** (fuera de pantalla) · **abierto** · **arrastrando** (cierra con >80 px o >0,5 px/ms) · **cambiando contenido** (crossfade 180 ms).
- Sin scroll del muñeco mientras está abierto.

### 2.4 Panel — lateral (desktop)

- `.side.paper`, ancho **520 px** (paneles de contenido) o **820 px** (Tienda), alto completo, borde izquierdo en dientes de sierra (`clip-path`). Sombra `drop-shadow(-6px 0 0 #0D0A0C)`. Carrito: 480 px sobre la tienda.
- Cabecera igual a mobile; "Esc para volver" visible en el panel de Música.
- La cámara desplaza el foco a la izquierda del panel (−18 % del ancho).

### 2.5 Botones (`.btn`)

Alto mínimo 44 px, padding `0 18px`, borde 2 px, sombra `3px 3px 0 #0D0A0C`, texto mono 700 uppercase.

| Variante | Fondo | Texto | Uso |
|---|---|---|---|
| `.btn` (rosa) | `--pk` | `--bk` | Acción de apoyo, "Tomá $100" |
| `.btn.yl` | `--yl` | `--bk` | Primario (Agregar al carrito, Ir a pagar, Volver a la tienda) |
| `.btn.bn` | `--bn` | `--bk` | Secundario (Vaciar carrito, ← Tienda) |
| `.btn.bk` | `--bk` | `--bn` | Terciario, sombra rosa |

Estados: **hover**: traslado (−1,−1) y sombra 4–5 px **[PROPUESTA]**; **presionado**: `translate(2px,2px)`, sombra `1px`; **foco**: contorno punteado amarillo; **deshabilitado**: opacidad .45, sin sombra **[PROPUESTA]**; **agregado** (tarjeta): texto "✓ Agregada", fondo amarillo.
Otros: `.mn` (menú hamburguesa 44×44, hueso, sombra rosa), `.xb` (cerrar), `.cartb` (carrito 44×44 amarillo, sombra negra), `.chip` (filtro), `.sz` (talle), `.qty` (− n +).

### 2.6 Tarjeta de producto (`.pc`)

- Caja hueso, borde 2 px, sombra `4px 4px 0`. Imagen (`.pimg`, alto 118 px mobile / 130 px desktop) + cuerpo (`.in`, padding `8 10 10`): nombre, precio ARS, botón "Agregar" (44 px).
- Imagen placeholder: fondo negro con semitono rosa, nombre del producto en Londrina amarilla con sombra rosa, categoría `[Gorra]` en mono.
- Estados:
  - **normal**
  - **agregado**: sombra rosa, botón amarillo "✓ Agregada", sello `+1` amarillo rotado 6° sobre la imagen
  - **imagen faltante**: bloque `.nof` (rayas 45°, ícono de foto tachada rosa, "Sin foto" / "Se la comió el perro")
  - **hover/foco**: contorno punteado amarillo **[PROPUESTA]**
- Precio formateado `$18.500` (punto de miles, `es-AR`).

### 2.7 Carrito

- **Mobile**: cajón inferior de 664 px sobre overlay `rgba(13,10,12,.62)`. **Desktop**: panel lateral de 480 px.
- Línea (`.cl`): miniatura 64×64 (72 en desktop) · nombre (12–13 px 700) · variante (`.lbl`) · `.qty` (− n +, cada botón 44 px) · precio (Londrina 22–24 px rosa oscuro) · quitar (`.xb` 44 px, `aria-label="Quitar <producto>"`).
- Pie fijo: "Subtotal (N cosas que no existen)" + total en Londrina 34–40 px + botón "Ir a pagar" (amarillo, alto 52–56 px, con "→").
- Estados: **con ítems** · **vacío** ("Acá no hay nada" + frase + "Volver a la tienda") · **agregando** (contador rebota, ver §5.7).
- El contador `.cnt` (22 px, rosa) se ancla arriba-derecha del ícono del carrito; en estado "recién agregado" el botón pasa a rosa, rota −6° y escala 1,08, el contador a amarillo.

### 2.8 Modal "AHRE QUE ERA DE MENTIRITA"

- `role="dialog" aria-modal="true" aria-label="El pago es de mentira"`. Hoja de papel rotada −1.4° (mobile 354 px de ancho; desktop 600 px), borde 3 px, con **dos cintas** (amarilla arriba-izq a −34°, rosa arriba-der a 30°) y sello **RECHAZADO** (borde 3–4 px `--pk2`, texto Londrina 22/36 px, rotado 11°).
- Titular "AHRE QUE ERA DE MENTIRITA" Londrina 66/112 px, sombra `4/6px` rosa.
- Texto aclaratorio, tres botones (mobile apilados, desktop en fila): **Volver a la tienda** (amarillo) · **Vaciar carrito** (hueso) · **Tomá $100** (rosa, lleva al panel de contribución). Nota: "El aporte va al creador de la web, no al artista".
- Fondo atenuado `rgba(13,10,12,.72–.74)`. Cierra con Esc / "Volver a la tienda". Foco inicial en "Volver a la tienda".

### 2.9 Botón ENTRAR (final de la carga)

- Aparece al 100 %. Tira amarilla rotada −3° (mobile 334 px, alto 84) / −2,4° (desktop 480 px, alto 112), borde 3–4 px, sombra dura 6–8 px, dos cintas en esquinas opuestas.
- Texto "ENTRAR" + subtítulo "Con sonido · podés silenciarlo" (mono 10–12 px).
- Estados: **oculto** (<100 %) · **aparece** (pop, §5.8) · **hover/foco**: contorno punteado + sube 1 px **[PROPUESTA]** · **presionado**: `translate(2px,2px)`.
- Acción: es el gesto de usuario que desbloquea `AudioContext`; inicia la experiencia y el sonido. Es el **único** camino al home.

### 2.10 Botón de mute (`.mt`)

44×44, borde 2 px, fondo hueso con semitono suave, sombra rosa 3 px. Ubicación: esquina superior izquierda, **a la derecha del menú** (mobile `left:68 top:14`; desktop `left:92 top:24` en panel/tienda, `left:32 top:76` en la espalda, bajo el sello). No pisa globos, zonas ni la X (que va a la derecha dentro de la hoja).

| Estado | Aspecto |
|---|---|
| Sonando | Altavoz negro con ondas rosa oscuro + anillo de ondas de semitono rosa alrededor (decorativo) |
| Silenciado (`.off`) | Fondo negro, altavoz hueso, cruz rosa, sombra hueso, sin ondas |
| Hover / foco (`.hv`) | Contorno punteado amarillo 3 px, offset 2 px; desktop: etiqueta "Silenciar" **[PROPUESTA]** |
| Presionado (`.pr`) | `translate(2px,2px)`, sombra 1 px |

`aria-pressed`: `false` = suena; `true` = silenciado. Labels: "Silenciar sonido" / "Activar sonido". Persistir en `localStorage` (try/catch).

### 2.11 Sello de tienda de mentira

`.stamp` ancho completo, centrado, rotado −1° (mobile) / −.8° (desktop). Texto **"Tienda de mentira"**, borde 2 px negro, sombra `3px 3px 0 #FF2E9A`. **Fijo y siempre visible** bajo el título de la tienda, en el catálogo, el carrito y las variantes. No debe poder ocultarse.

### 2.12 Otros componentes

Chip filtro (`.fl .chip`, activo = negro/hueso, 40 px alto) · selector de talle (`.sz`, 52×44, activo = rosa con sombra) · cantidad `.qty` · aviso de agregado (toast negro con sombra amarilla, `role="status"`) · hoja de carga fotocopiada · tira de título (`.strap`) · chip de borde "↻ Girá".

---

## 3. Pantallas y frames

Todos los archivos son `*.dc.html` en `project/`. Todos usan el fondo `.neb` + `.grain` (salvo Sistema/Componentes/Animacion, que son documentación).

### Documentación (1440 wide)
| Frame | Contenido |
|---|---|
| `Sistema` — "Sistema de diseño" | colores, tipos, espaciados, texturas |
| `Componentes` — "Componentes" | globos, hotspots, paneles, mapa de zonas |
| `Animacion` — "Notas de animación" | tiempos, fly-to, ambiente, rendimiento |

### Mobile 390×844
| # | Frame (archivo) | Componentes |
|---|---|---|
| 01 | `Carga-m` — Carga | hoja fotocopiada, scan, porcentaje, barra |
| 02 | `Main` — Home en reposo + hint | título DILLOM, strap, muñeco frente, menú, sello, hint |
| 03 | `Home-globo-m` — Home globo (1er toque) | globo "Música", chip "↻ Girá", hotspot activo |
| 04 | `Home-espalda-m` — Home espalda: merch + billete | muñeco espalda, billete, globo "Merch", mute, hotspots |
| 05 | `Home-epa-m` — Easter egg ¡EPA! | globo "¡EPA!", rebote |
| 06 | `P-musica-m` — Panel Música | bottom sheet, tracklist, embed |
| 07 | `P-videos-m` — Panel Videos | sheet, embed, lista |
| 08 | `P-redes-m` — Panel Redes / Contacto | sheet, filas de redes |
| 09 | `P-shows-m` — Panel Shows / Entradas | sheet, filas de fechas |
| 11 | `P-quien-m` — Panel Quién soy | sheet, ilustración propia, bio |
| 12 | `P-donar-m` — Panel Tomá $100 | sheet, montos, nota |
| 13 | `Tatuador-m` — Modo tatuador | barra de herramientas, contador 4/7 |
| 14 | `Error-webgl-m` — Error WebGL, menú de respaldo | lista de botones, "Reintentar 3D" |
| 15 | `Landscape-m` — Orientación horizontal (844×390) | panel lateral 320 px |
| 16 | `Carga-entrar-m` — Carga al 100 % — ENTRAR | ENTRAR, cintas |
| 17 | `Audio-m` — Botón de sonido (estados) | mute × 4 estados + ubicación |
| 18 | `Tienda-catalogo-m` | sheet 724, sello, carrito+contador, filtros, tarjetas |
| 19 | `Tienda-detalle-m` | galería, talle, `.qty`, botón |
| 20 | `Tienda-carrito-m` | cajón, líneas, subtotal, pagar |
| 21 | `Tienda-vacio-m` | estado vacío |
| 22 | `Tienda-pago-m` — Pago "de mentirita" | modal, cintas, RECHAZADO |
| 23 | `Tienda-agregado-m` | toast, contador activo, tarjeta agregada |
| 24 | `Tienda-sinimagen-m` | `.nof` en tarjeta y en detalle |

(El número 10 quedó libre: el panel Merch viejo fue reemplazado por la tienda. Los números 16–24 no son consecutivos en el lienzo físico; usar el nombre de archivo.)

### Desktop 1440×900
| # | Frame | Contenido |
|---|---|---|
| D1 | `Carga-d` | carga 73 % |
| D2 | `Home-d` — Home con globo | frente, globo "Música", chip de borde, ayudas |
| D3 | `Espalda-d` — Espalda: merch + billete | espalda, globo "Merch" y globo "Tomá $100", mute |
| D4 | `Panel-d` — Panel lateral (Música) | `.side` 520 |
| D5 | `Tatuador-d` — Modo tatuador | paleta de 7, guardar, compartir |
| D6 | `Carga-entrar-d` | ENTRAR |
| D7 | `Tienda-d` | panel 820, filtros (11 categorías), grilla 3 col |
| D8 | `Tienda-detalle-d` | galería + selector + CTA |
| D9 | `Tienda-carrito-d` | panel lateral 480 |
| D10 | `Tienda-pago-d` | modal |
| D11 | `Tienda-estados-d` | agregado, vacío, sin imagen |
| D12 | `Audio-d` | mute × 4 estados + ubicación |

---

## 4. Mapa de zonas tocables

Lados del **muñeco** (su derecha/izquierda), no de la pantalla. Rutas: **[PROPUESTA]** (el diseño define panel, no URL); implementar con hash o router.

| Zona | Texto del globo | Panel / ruta | Cámara (§5.2) |
|---|---|---|---|
| Cabeza | **Música** | `#/musica` | az 0°, +8°, 0,55 |
| Pecho | **Videos** | `#/videos` | az 0°, 0°, 0,60 |
| Brazo derecho (pantalla-izq. de frente) | **Redes** | `#/redes` | −55° |
| Brazo izquierdo (pantalla-der. de frente) | **Shows** | `#/shows` | +55° |
| Espalda (torso trasero) | **Merch** | `#/tienda` (título del panel: TIENDA) | 180°, 0°, 0,60 |
| Billete (zona baja de la espalda, lado derecho del muñeco) | **Tomá $100** | `#/dona` | 180°, −5°, 0,35 |
| Pierna derecha + pie | **Quién soy** | `#/quien-soy` | ±35°, −10°, 0,65 |
| Pierna izquierda + pie | **Tatuajes** | `#/tatuador` (modo tatuador) | ±35°, −10°, 0,65 |
| Entrepierna | **¡EPA!** | sin ruta | sin movimiento |

Los textos de los globos del diseño: "Música" (visto), "Merch", "Tomá $100", "¡EPA!". Los de Videos, Redes, Shows, Quién soy y Tatuajes **no están dibujados**: usar el nombre del panel tal cual la tabla.

### 4.1 Geometría de referencia (% del wrapper del render)

Wrapper del frente: relación **422×897**. Home mobile: 262×556 px en (64,140). Home desktop: 282×600 en (579,166).

Frente: cabeza `l20 t0 w58 h30` · pecho `l19 t30.5 w57 h24` · brazo derecho (pantalla-izq.) `l1 t31 w22 h38` · brazo izquierdo `l76 t31 w23 h39` · pierna (pantalla-izq.) `l21 t63 w29 h36` · pierna (pantalla-der.) `l50.5 t63 w31 h36` · entrepierna `l41.5 t62 w14 h6.7`.
Espalda (imagen 460×897, colocada con `left:-5.69%; width:109%`): cabeza `l21 t0 w56 h28` · torso/Merch `l19 t28 w61 h27.5` · billete `l58 t54.5 w20 h14` · pierna del lado derecho del muñeco (pantalla-der.) → Quién soy `l51 t67.5 w30 h31.5` · pierna del lado izquierdo (pantalla-izq.) → Tatuajes `l19 t67.5 w30 h31.5`.
Billete (objeto aparte): `l62% t55.5% w12% h11%`, rot −10°, amarillo, borde 2 px, sombra 4 px, círculo de semitono rosa, "$100" vertical (`writing-mode: vertical-rl`). **La espalda no tiene bolsillo dibujado.**

En 3D: reemplazar por meshes invisibles (cápsulas/cajas) anclados a huesos o a la jerarquía del modelo; raycast contra ellos, no contra el modelo.

---

## 5. Animación

### 5.1 Regla general
Toque/click → feedback de zona en **100 ms**. Movimientos "con peso": cubic-bezier con aceleración marcada, **sin rebote elástico** salvo ¡EPA!. `prefers-reduced-motion`: ver §6.

### 5.2 Fly-to de cámara
Easing `cubic-bezier(.7, 0, .2, 1)`, duración 650–800 ms. El muñeco se corre del centro con *view offset* en el mismo tiempo (arriba en mobile −22 % del alto; a la izquierda del panel en desktop −18 % del ancho). Al cerrar, vuelve a la pose previa en **600 ms**.

| Zona | Azimut | Elev. | Distancia* | ms |
|---|---|---|---|---|
| Cabeza | 0° | +8° | 0,55 | 700 |
| Pecho | 0° | 0° | 0,60 | 700 |
| Brazo derecho | −55° | 0° | 0,60 | 750 |
| Brazo izquierdo | +55° | 0° | 0,60 | 750 |
| Espalda | 180° | 0° | 0,60 | 800 |
| Billete | 180° | −5° | 0,35 | 800 |
| Piernas + pies | ±35° | −10° | 0,65 | 750 |

\*Relativa al encuadre completo (1,0).

### 5.3 Giro y chip "↻ Girá"
Si la zona mira para atrás: el chip aparece en el borde en 180 ms. Tocarlo gira el muñeco **180° en 700 ms**.

### 5.4 Paneles
- Entrada: `translateY(100%) → 0` (mobile) / `translateX(520px) → 0` (desktop), **420 ms**, `cubic-bezier(.2, .9, .2, 1)`.
- Cierre: **280 ms**, `ease-in`. Gesto de cierre: arrastre >80 px o >0,5 px/ms. Esc cierra.
- Cascada de contenido: cada fila `translateY(12px) + opacity 0 → 1`, **40 ms** de retraso entre filas (máx. 8).
- La tira del título se "pega" con escala 1,08 → 1.
- Cambio entre paneles: crossfade de contenido **180 ms** mientras viaja la cámara.

### 5.5 Globos y ¡EPA!
- Globo: entra con pop `escala .6 → 1,08 → 1` en **120 ms**, sale en **80 ms** (opacidad + escala .9).
- ¡EPA!: solo por tap/click, **nunca hover**; cooldown 600 ms. Salto: sube 22 % del alto de la cabeza en **140 ms** (ease-out), vuelve en **260 ms** con `cubic-bezier(.3, 1.6, .5, 1)`; la sombra del piso se achica a .7 y vuelve. Globo con pop de 100 ms sobre estallido rosa; desaparece solo a los **1.500 ms** con fade de **120 ms**. Sin navegación. Vibración 15 ms si hay soporte.

### 5.6 Carga
Barra de escaneo baja de la cabeza a los pies, atada al progreso **real** de descarga (modelo + texturas); mínimo **1,2 s** visible. Al 100 %: destello hueso **80 ms** → la hoja se desliza **300 ms**. En el diseño nuevo, al 100 % **no entra directo**: aparece ENTRAR y se espera el toque.

### 5.7 Tienda **[PROPUESTA — no estaba en la hoja de animación]**
- Agregar al carrito: botón pasa a "✓ Agregada" (instantáneo), sello `+1` pop 120 ms, ícono del carrito rota −6°/escala 1,08 durante 220 ms y vuelve; toast entra desde arriba 200 ms y se va a los **2.500 ms** (fade 150 ms).
- Cajón de carrito: sube 380 ms con la curva de paneles; overlay fade 200 ms.
- Modal de pago: la hoja entra con `scale .92 + rotate −3° → 1 / −1,4°` en 220 ms; el sello RECHAZADO "se estampa" 140 ms después (`scale 1.6 → 1`, opacidad 0 → .9, 120 ms).

### 5.8 Audio **[PROPUESTA — el audio no estaba en la hoja de animación]**
- Arranca al tocar ENTRAR (gesto del usuario). Fade-in **0 → 0,6 de volumen en 1.200 ms**, curva lineal-exponencial (`exponentialRampToValueAtTime` desde 0,001).
- Mute/unmute: fade de **200 ms** (no cortar en seco). Estado persistido.
- Al abrir un panel el fondo baja a 0,4 en 300 ms y vuelve al cerrarlo (ducking, opcional).
- Pausar al perder foco de pestaña (`visibilitychange`).
- Ondas del mute: anillo de semitono con pulso lento (escala 1 → 1,08, 1.200 ms, ease-in-out, loop) solo mientras suena. **[PROPUESTA]**
- ENTRAR aparece con el pop del globo (120 ms) tras el 100 %.

### 5.9 Ambiente
Flote del muñeco ±6 px en 4 s (ease-in-out) con giro ±3°, pausa al arrastrar. Parallax en 3 capas: polvo .2×, confeti .5×, billetes y estrellas .9× (arrastre y giroscopio). Deriva de objetos en ciclos de 12–20 s con desfase. Nebulosa estática (solo se espeja al girar). Grano fijo.

---

## 6. Responsive y rendimiento

### Responsive
- Breakpoints: **mobile** <768 px (bottom sheet) · **desktop** ≥768 px o ≥1024 px (panel lateral). El diseño cubre 390×844 y 1440×900; **tablet no está diseñada** → usar la lógica desktop con panel de 520 px a partir de 768 px **[PROPUESTA]**.
- **Home sin scroll** (`overflow:hidden`, `100dvh`). Solo los paneles scrollean por dentro.
- **Horizontal móvil (844×390)**: títulos a la izquierda, muñeco al centro, hint a la derecha; paneles como lateral de **320 px**.
- Muñeco: en desktop el wrapper es 282×600 centrado; en mobile 262×556. En R3F usar encuadre relativo (distancia relativa al encuadre completo) y *view offset* para dejar espacio al panel.
- Targets táctiles ≥44 px. Ninguna ayuda/botón debe tapar globos, zonas ni la X de los paneles.
- Acceso por teclado: Tab recorre zonas (botones invisibles con etiqueta), Enter entra, Esc cierra, flechas orbitan.
- `prefers-reduced-motion`: sin flote, sin parallax, sin salto; fly-to pasa a fundido de **200 ms**.
- **Fallback sin WebGL / modelo caído**: pantalla "Error 3D" con menú de botones (Música, Videos, Redes, Shows, Merch, Quién soy, Tatuador, Tomá $100) y "Reintentar 3D". Debe cubrir el 100 % de las rutas.

### Rendimiento
- glTF ≤ **5 MB**, ≤ **60 000 triángulos**; texturas **KTX2** 1K–2K; pixel ratio máx. **2**.
- Luces: principal + contorno + mapa de entorno chico. Sombra de piso falsa (blob).
- **Máx. 2 efectos pesados a la vez** (de: grano a pantalla completa, semitono, bloom, partículas). En reposo: grano + partículas.
- Degradación automática: <45 fps durante 2 s → apagar partículas, luego semitono, luego bajar pixel ratio a 1,5.
- Fuentes: `font-display: swap`, precarga de Londrina 900 y Space Mono 700.
- Las texturas de grano/semitono son CSS/SVG; no usar shaders de pantalla completa para ellas.
- Audio: un solo archivo en loop, ≤ 1–2 MB, `preload="none"` hasta ENTRAR. **[PROPUESTA]**
- Cargar la tienda (imágenes de producto, si llegan a existir) de forma perezosa.

---

## 7. Textos exactos de interfaz

### 7.1 Global / home
- - Título: **DILLOM** (letras recortadas); strap: "La nueva" / "Violencia".
- Hints: "Arrastrá para girar · tocá el muñeco" (mobile) · "← Arrastrá para girar · rueda para zoom →" (desktop) · "Tocá de nuevo para entrar" (tras el globo) · "← Arrastrá para girar →" + "Tocá el muñeco" (horizontal) · "Tocá la espalda · tocá el billete" (mobile, espalda) · "Tocá el billete o la espalda" (desktop, espalda).
- Chip de borde: "↻ Girá · Merch · $100" (mobile) · "Girá para ver · Merch · Tomá $100" (desktop, de frente) · "Girá para ver · Música · Videos" (desktop, de espalda).
- Menú: "Menú" · `aria-label` "Abrir menú". Cierre: "Cerrar panel". Esc: "Esc para volver".
- Vista espalda: sello "Vista espalda".

### 7.2 Carga
"Fotocopiando" · "Armando muñeco" · "Texturas · luces · pose" · al 100 %: chip "Listo" · "Muñeco listo" · "Todo cargado" · botón "ENTRAR" · "Con sonido · podés silenciarlo".

### 7.3 Paneles
- **Música**: "Música" · "LNV" · "La nueva violencia" · "Álbum · agosto 2026" · "Tracklist" · filas "01 [Nombre del tema] [0:00]".
- **Videos**: "Videos" · "Clips" · "Visuales" · "Más".
- **Redes**: "Redes" · "Instagram @rip.dillom ↗" · "YouTube [@canal] ↗" · "Spotify [artista] ↗" · "X [@usuario] ↗" · "Contacto" · "Sin vínculo con el artista."
- **Shows**: "Shows" · "Próximas fechas · gira 2026" · 01 Nov Santiago de Chile (Chile · [venue]) · 05 Nov Ciudad de México (México · [venue]) · 14 Nov Montevideo (Uruguay · [venue]) · ?? Nov La Plata (Argentina · a confirmar, "Pronto") · ?? Dic Buenos Aires (Argentina · a confirmar, "Pronto") · botón "Entradas ↗" · "+ Fechas por anunciar".
- **Quién soy**: "Quién soy" · "rip.dillom" · "Artista argentino" · "Último álbum · agosto 2026" · "Seguir leyendo en Wikipedia ↗" · ""
- **Tomá $100**: título "Tomá $100" · "Esta web la hizo una persona, a mano. Si te gustó, tirále unos pesos a quien la armó." · "Elegí cuánto" · $100 / $500 / $1.000 / Otro · botón "Donar $100 ↗" · "Aporte voluntario para el creador de la web. No va al artista ni a su equipo.."
- **Tatuador**: "Tatuador" · "Guardar" · "Rotar" · "Escalar" · "Espejar" · "Borrar" · "Deshacer" · "4 / 7 puestos" · desktop: "Seleccionado: calavera" · "Paleta" · "7 tatuajes · tocá para sumar" · "Guardar imagen" · "Compartir".
- **Error 3D**: "Error 3D" · "No se pudo prender el muñeco" · "Tu celu no pudo abrir WebGL. Igual podés entrar a todo desde acá." · botones (Música, Videos, Redes, Shows, Merch, Quién soy, Tatuador, Tomá $100) · "Versión sin 3D" · "Reintentar 3D" · "LA NUEVA VIOLENCIA".

### 7.4 Tienda
- Título del panel: "Tienda". Sello: "Tienda de mentira".
- Filtros: Todo · Gorras · Remeras · Buzos · Tazas · Mates · Termos · Toallitas femeninas · Estampitas · Manteles bordados · Cartucheras para revólver · Otros.
- Productos de ejemplo (ARS): Gorra Visera Violenta $18.500 · Remera 100 % algodón, 0 % paz $24.900 · Buzo con bolsillo para el enojo / Buzo Canguro Cabreado $52.000 · Taza Tranqui (mentira) $9.800 · Mate Mala Leche, ya cebado $15.300 · Termo Tóxico de 1 litro $38.700 · Cartuchera para revólver de agua $21.000 · Mantel bordado "Paz y amor" (al revés) $33.400 · Toallitas Femeninas Furiosas $6.400.
- Detalle: "← Tienda" · "Talle" (S M L XL) · "Cantidad" · "Agregar al carrito" · "Tienda de mentira · el producto no existe" · descripción de ejemplo: "Tiene bolsillo para guardar el enojo. No incluye el enojo."
- Tarjeta: botón "Agregar" · tras agregar "✓ Agregada".
- Aviso: "**Gorra Visera Violenta** al carrito." + "Ya van 4 cosas que no existen." + botón "Ver" (mobile) / "Ver carrito" (desktop).
- Carrito: "Carrito" · "Subtotal (3 cosas que no existen)" · "Ir a pagar" · `aria-label` "Quitar <producto>" · "Menos" / "Más".
- Vacío: "Acá no hay nada" · "Tu carrito está más vacío que el bolsillo de atrás. Y eso que ni siquiera tiene bolsillo." · "Volver a la tienda".
- Pago: "RECHAZADO" · "AHRE QUE ERA DE MENTIRITA" · "Nada de esto existe y no se puede comprar. Es una tienda de mentira: no se cobró nada, no se mandó nada, no hay stock de nada." · "Volver a la tienda" · "Vaciar carrito" · "Tomá $100" · "El aporte va al creador de la web, no al artista".
- Sin imagen: "Sin foto" · "Se la comió el perro" · "Foto no disponible" · "Igual no existe el producto".

### 7.5 Reglas de contenido de la tienda
Sin logos oficiales ni fotos del artista en productos. Los productos son gráficos tipográficos con "LA NUEVA VIOLENCIA". Nombres y descripciones absurdos y graciosos. Ningún producto existe: **nunca** mostrar medios de pago reales ni pedir datos personales en el flujo de "pago".

### 7.6 Placeholders pendientes
| Pendiente | Dónde |
|---|---|
| Embed Spotify / YouTube Music, N° de temas, nombres y duraciones del tracklist | Música |
| Embed de YouTube, títulos, dirección y año de clips y visuales | Videos |
| @canal de YouTube, artista en Spotify, @usuario de X, mail de management/prensa | Redes |
| Venues y links de entradas de cada fecha; confirmar La Plata y Buenos Aires | Shows |
| Ilustración propia, bio de 3–4 líneas, segundo párrafo opcional, link a Wikipedia | Quién soy |
| Link de pago (Mercado Pago / Cafecito) y monto "Otro" | Tomá $100 |
| Catálogo final de productos, precios y gráficos tipográficos (se optimizan después) | Tienda |
| Archivo de audio de fondo (licencia y duración del loop) | ENTRAR / mute |
| Modelo glTF final y sus huesos/meshes para las zonas | Muñeco |
| Textos de globos de Videos, Redes, Shows, Quién soy y Tatuajes | Home |
| Rutas definitivas (las de §4 son propuesta) | Router |
| Diseño tablet (768–1023 px) | Responsive |
| Los 7 tatuajes (assets originales provistos por el cliente) | Tatuador |

---

## 8. Estado de lo que **no** está resuelto por el diseño

1. Animaciones de tienda, modal y audio (§5.7, §5.8) y estados hover/deshabilitado de botones: propuestos en este documento, no dibujados.
2. El mute en desktop tiene posición distinta en la vista de espalda (`left:32 top:76`) que en el resto (`left:92 top:24`) por el sello "Vista espalda". Unificar al implementar si se prefiere.
3. El mute no se dibujó en los frames de Música/Videos/Redes/Shows/Quién soy/Donar/Tatuador ni en Home/Main/Home-d: solo en los de espalda, tienda y `Audio-m`/`Audio-d`. Colocarlo en **todas** las pantallas con la posición indicada.
4. Los frames de panel conservan la nomenclatura anterior ("10 · Panel Merch" ya no existe).
