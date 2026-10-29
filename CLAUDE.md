# rip.dillom — La nueva violencia (Mondilab, tributo fan no oficial)

Leer primero, en este orden:
1. `docs/PROMPT-claude-code.md` — instrucciones del proyecto (stack, zonas, tienda, audio, aporte con Mercado Pago, fases con checkpoints).
2. `diseno/HANDOFF-dillom-lnv.md` — especificación visual exacta. Fuente visual real: `diseno/project/*.dc.html` + `dl.css` (HTML/CSS de cada frame; los `<img src="/_blob/...">` apuntan al render del muñeco, usar `public/img/`). Imágenes de frames en `diseno/frames/` solo si existen.
3. `docs/06-tatuajes-posiciones.md` — posiciones provisorias de los tatuajes.

Assets ya colocados: `public/models/dilloms.glb` (sin optimizar), `public/audio/fondo.mp3`, `public/tatuajes/*.png`, `public/img/*.png`.
Reglas: trabajar por fases y parar en cada checkpoint; no inventar datos reales; el Access Token de Mercado Pago solo como variable de entorno secreta; sin logos oficiales ni fotos del artista.
