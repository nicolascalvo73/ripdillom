Leé CLAUDE.md y docs/PROMPT-claude-code.md (la línea de la Tienda ya está actualizada). El sitio ya está construido; este pedido es SOLO para completar y dejar lista la tienda (src/ui/paneles/Merch.tsx, src/state/carrito.ts, src/content/merch.json, src/styles/tienda.css). No toques escena, zonas, audio ni aporte.

Objetivo: que la tienda parezca una tienda real y completa. No tiene que decir en ningún lado que es de mentira, salvo el último paso: al tocar "Ir a pagar" se abre el modal "AHRE QUE ERA DE MENTIRITA" (ese modal queda tal cual, con "Volver a la tienda", "Vaciar carrito" y "Tomá $100" que va a /aporte).

1. Catálogo: reemplazá src/content/merch.json por el contenido de docs/merch.json (8 productos: Muñequito, Curitas, Mantel bordado, Boxers unisex, Manual de geografía, Caña de pescar, Barco pirata, Cassette). Actualizá el tipo Producto en Merch.tsx a los campos nuevos: id, nombre, categoria, precio, desc, variantes, etiqueta_variante ("Talle" para boxers, "Tamaño" para mantel), imagen, alt, destacado, etiqueta, vista3d. Borrá los productos viejos (gorra, remera, buzo, taza, mate, termo, toallitas, estampitas, etc.) y las categorías viejas. Categorías de filtro: Todo, Casa, Juguetes, Libros, Música, Ropa, Varios. Nombres visibles: solo lo que es cada producto. El campo `cancion` ya no se muestra en ningún lado.

2. Imágenes: las 8 finales ya están en public/img/merch/<id>.jpg (muneco, curitas, mantel, boxers, manual, cana, barco, cassette; 1024×1024). Usalas tal cual, con `alt` del JSON, sin tocarlas ni agregarles texto encima. Mantené el componente Foto con estado de imagen faltante como respaldo, pero con las 8 presentes no debería verse nunca. En la grilla, cuadradas, object-fit cover, lazy. En el detalle del Muñequito: galería con muneco.jpg + /img/muneco-v5-frente.png + /img/muneco-v5-espalda-luz.png, y la etiqueta "EDICIÓN LIMITADA" como chip; si podés, la vista 3D giratoria diferida del mismo modelo (Canvas liviano con carga diferida, solo en ese detalle), con la imagen como respaldo.

3. Quitar todo lo que diga que es de mentira (hoy está en estos lugares; buscá también cualquier otro):
   - src/ui/paneles/Merch.tsx: la tira amarilla `.sello` con {merch.sello} (borrala completa) y el texto 'Agregado ✓ (de mentira)' del botón (dejalo en 'Agregado ✓').
   - src/content/merch.json: la clave "sello".
   - src/styles/tienda.css: el comentario "Tienda de mentira" y la regla `.sello` si queda sin uso.
   - README.md, index.html, metadatos SEO, títulos/aria-labels y textos de la página /tienda: nada de "mentira", "parodia", "no existe", "ficticio", "no se puede comprar".
   - Lo único que se conserva: el modal `.mentirita` del carrito (título AHRE QUE ERA DE MENTIRITA y su texto).

4. Flujo completo y pulido:
   - Grilla → detalle → elegir variante/cantidad → "Agregar al carrito" con feedback breve (botón en "Agregado ✓", contador del carrito arriba que se actualiza) → carrito → "Ir a pagar" → modal. No pedir datos personales ni tarjeta en ningún paso.
   - La etiqueta de variante en el detalle y en el carrito usa `etiqueta_variante` del producto (Talle o Tamaño); hoy el carrito dice siempre "Talle". Los productos sin variantes no muestran selector.
   - Precios en ARS con separador de miles (es-AR). Subtotal correcto con cantidades y variantes distintas del mismo producto como líneas separadas.
   - Carrito persistido en localStorage con try/catch; si hay en localStorage ids que ya no existen (productos viejos), ignorarlos sin romper.
   - Foco y teclado: el modal atrapa el foco, se cierra con Escape y devuelve el foco al botón; botones con aria-label; contraste legible.
   - Mobile 390×844: sin scroll horizontal, grilla de 2 columnas, botones táctiles ≥44 px. Desktop 1440×900: panel lateral con grilla de 2–3 columnas, sin desbordes.

5. Verificación:
   - `grep -rniE "mentir|parodia|no existe|ficticio|no se puede comprar|no hay stock" src index.html public README.md` debe devolver SOLO el modal del carrito (Merch.tsx) y su CSS (.mentirita). Corregí lo demás.
   - `npm run build`, TypeScript estricto y lint sin errores.
   - Con un navegador headless, capturas en 390×844 y 1440×900 de: catálogo, filtro "Juguetes", detalle del Muñequito, detalle del Mantel (variante Tamaño), carrito con 2–3 líneas, y el modal. Revisá que las 8 imágenes cargan (ninguna cae en el estado de imagen faltante), que el carrito sobrevive a recargar y que el modal es lo único que menciona lo de mentira.
   - Hacé un commit con mensaje claro. Mostrame las capturas y resumime qué cambió.
