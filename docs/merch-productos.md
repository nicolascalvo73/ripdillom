# Merch — catálogo e imágenes

Catálogo en `merch.json` (semilla de `src/content/merch.json`). Las 8 imágenes finales ya están en `public/img/merch/<id>.jpg`. La única mención a que es de mentira es el modal del último paso del carrito.
**Regla de nombres:** el nombre de cada producto es solo lo que es ("Cassette", "Curitas"…), sin nada más. La gráfica del producto puede llevar el título de una canción del disco (solo el título); nunca "La nueva violencia".

| # | Nombre en la tienda | Categoría | Precio ARS | Variantes | Palabra en la gráfica |
|---|---|---|---|---|---|
| 1 | Muñequito | Juguetes | $89.900 | — | Maniquí |
| 2 | Curitas | Varios | $3.200 | — | Gente Común |
| 3 | Mantel bordado | Casa | $33.400 | Chico, Grande | Palermo Hollywood |
| 4 | Boxers unisex | Ropa | $14.900 | S, M, L, XL | Fashion |
| 5 | Manual de geografía | Libros | $18.700 | — | Souvenir |
| 6 | Caña de pescar | Varios | $45.200 | — | Cocodrilo |
| 7 | Barco pirata | Juguetes | $76.500 | — | Superdiversión |
| 8 | Cassette | Música | $9.900 | — | Elvis Interludio |

## Cómo generar las imágenes (IA)

1. Una imagen por producto, **cuadrada 1:1, mínimo 1024×1024**, guardada como `public/img/merch/<id>.jpg` (ids: muneco, curitas, mantel, boxers, manual, cana, barco, cassette).
2. Usá el prompt de cada producto (en inglés) tal cual. Generá 3–4 opciones y elegí la que mejor se lea como foto de catálogo fotocopiada. Misma herramienta para las 8.
3. Verificá que no salgan logos ni marcas reales (sobre todo el barco), ni caras de personas. Si el texto sale mal escrito, regenerá o dejalo (queda bien en esta estética).
4. Para el muñequito, la tienda muestra además el modelo 3D giratorio; `public/img/muneco-v5-frente.png` sirve de miniatura de respaldo.

## Estilo común (pegar al final de cada prompt)

```
Product photo in a dirty photocopy and halftone aesthetic: flat studio lighting, hot pink (#FF2E9A) and acid yellow (#F7E92B) background with coarse black halftone dots and film grain, off-white paper texture, torn tape corners, hard black drop shadow, slightly misregistered print. Square 1:1 framing, product centered with plenty of margin. Any text uses rough cut-out collage letters. No logos, no brand names, no real people, no faces.
```

## Prompts por producto (cada uno ya incluye el estilo)

### Muñequito (`muneco`)

```
A plastic toy figure in a retro toy blister box: shirtless figure with a straight bowl-cut fringe, black dress trousers, small black line tattoos on the torso. The box has the cut-out title MANIQUÍ and a sticker saying EDICIÓN LIMITADA. Product photo in a dirty photocopy and halftone aesthetic: flat studio lighting, hot pink (#FF2E9A) and acid yellow (#F7E92B) background with coarse black halftone dots and film grain, off-white paper texture, torn tape corners, hard black drop shadow, slightly misregistered print. Square 1:1 framing, product centered with plenty of margin. Any text uses rough cut-out collage letters. No logos, no brand names, no real people, no faces.
```

### Curitas (`curitas`)

```
A flat cardboard box of 20 adhesive bandages with a few bandages laid out beside it. The box says CURITAS and, smaller, GENTE COMÚN. Product photo in a dirty photocopy and halftone aesthetic: flat studio lighting, hot pink (#FF2E9A) and acid yellow (#F7E92B) background with coarse black halftone dots and film grain, off-white paper texture, torn tape corners, hard black drop shadow, slightly misregistered print. Square 1:1 framing, product centered with plenty of margin. Any text uses rough cut-out collage letters. No logos, no brand names, no real people, no faces.
```

### Mantel bordado (`mantel`)

```
A rectangular tablecloth seen from above with an embroidered border, an embroidered upside-down heart and the embroidered words PALERMO HOLLYWOOD, cross-stitch texture, pink and yellow threads on off-white cloth. Product photo in a dirty photocopy and halftone aesthetic: flat studio lighting, hot pink (#FF2E9A) and acid yellow (#F7E92B) background with coarse black halftone dots and film grain, off-white paper texture, torn tape corners, hard black drop shadow, slightly misregistered print. Square 1:1 framing, product centered with plenty of margin. Any text uses rough cut-out collage letters. No logos, no brand names, no real people, no faces.
```

### Boxers unisex (`boxers`)

```
A pair of boxer briefs folded flat, front view, black fabric with a repeating pink and yellow halftone pattern and the waistband printed FASHION. No model. Product photo in a dirty photocopy and halftone aesthetic: flat studio lighting, hot pink (#FF2E9A) and acid yellow (#F7E92B) background with coarse black halftone dots and film grain, off-white paper texture, torn tape corners, hard black drop shadow, slightly misregistered print. Square 1:1 framing, product centered with plenty of margin. Any text uses rough cut-out collage letters. No logos, no brand names, no real people, no faces.
```

### Manual de geografía (`manual`)

```
A hardcover school textbook at a slight angle, pink cover with yellow halftone, a crude cut-out world map graphic and the title MANUAL DE GEOGRAFÍA. No other text. Product photo in a dirty photocopy and halftone aesthetic: flat studio lighting, hot pink (#FF2E9A) and acid yellow (#F7E92B) background with coarse black halftone dots and film grain, off-white paper texture, torn tape corners, hard black drop shadow, slightly misregistered print. Square 1:1 framing, product centered with plenty of margin. Any text uses rough cut-out collage letters. No logos, no brand names, no real people, no faces.
```

### Caña de pescar (`cana`)

```
A telescopic fishing rod with a reel lying diagonally, wrapped in pink and yellow tape bands printed COCODRILO. Product photo in a dirty photocopy and halftone aesthetic: flat studio lighting, hot pink (#FF2E9A) and acid yellow (#F7E92B) background with coarse black halftone dots and film grain, off-white paper texture, torn tape corners, hard black drop shadow, slightly misregistered print. Square 1:1 framing, product centered with plenty of margin. Any text uses rough cut-out collage letters. No logos, no brand names, no real people, no faces.
```

### Barco pirata (`barco`)

```
A generic plastic toy pirate ship in an open toy box, with a black-and-pink flag showing a crude skull and the word SUPERDIVERSIÓN on the sail. No toy-brand marks of any kind. Product photo in a dirty photocopy and halftone aesthetic: flat studio lighting, hot pink (#FF2E9A) and acid yellow (#F7E92B) background with coarse black halftone dots and film grain, off-white paper texture, torn tape corners, hard black drop shadow, slightly misregistered print. Square 1:1 framing, product centered with plenty of margin. Any text uses rough cut-out collage letters. No logos, no brand names, no real people, no faces.
```

### Cassette (`cassette`)

```
A compact audio cassette tape beside its clear plastic case, the label printed with ELVIS INTERLUDIO in pink and yellow halftone, seen flat from above. Product photo in a dirty photocopy and halftone aesthetic: flat studio lighting, hot pink (#FF2E9A) and acid yellow (#F7E92B) background with coarse black halftone dots and film grain, off-white paper texture, torn tape corners, hard black drop shadow, slightly misregistered print. Square 1:1 framing, product centered with plenty of margin. Any text uses rough cut-out collage letters. No logos, no brand names, no real people, no faces.
```

