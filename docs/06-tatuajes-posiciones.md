# Posiciones de tatuajes (decals) — v1 provisoria

Coordenadas en el espacio del modelo `dilloms-v3-coloreado.glb` (figura mide 1.0 de alto, mira hacia +z;
la pantalla-derecha del espectador es +x, o sea el lado IZQUIERDO del muñeco / artista = +x).
Cuerpo: torso y≈0.45–0.74, cinturón y≈0.43, ancho torso ±0.165. Cara: ojos y≈0.835 (x ±0.046), sonrisa y≈0.787.

| Archivo | Zona | x | y | alto aprox | Fuente |
|---|---|---|---|---|---|
| drip.png | MEJILLA DERECHA del artista (pantalla-izquierda) | -0.075 | 0.805 | 0.035 | pedido de Choro; foto 03 |
| parca.png | pectoral derecho del artista (pantalla-izquierda) | -0.07 | 0.66 | 0.07 | fotos 09, 16, 18 |
| retrato.png | pectoral izquierdo (pantalla-derecha) | +0.07 | 0.67 | 0.04 | foto 13 |
| espinas.png | esternón, entre pectorales | 0.00 | 0.625 | 0.03 | fotos 09, 18 |
| dientes.png | bajo esternón / abdomen alto | 0.00 | 0.565 | 0.04 | fotos 09, 18 |
| asap.png | abdomen bajo, sobre el cinturón | -0.02 | 0.49 | 0.045 | fotos 13, 15, 19 |
| calavera-muletas.png | flanco bajo, pantalla-derecha | +0.10 | 0.52 | 0.07 | fotos 11, 12, 19 (dudoso, ajustar) |

Notas
- Valores provisorios: afinar con el modo tatuador / un modo debug de arrastrar decals y exportar JSON.
- Decals proyectados con drei <Decal> sobre la malla `skin`; el de la mejilla debe proyectarse en +z con la curvatura de la cara.
- drip.png: línea negra, fondo transparente (sin relleno blanco), 598×1050 px, origen: imagen de 333 px de ancho (suavizar si se ve blando de cerca).
