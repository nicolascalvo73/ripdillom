# Prompt maestro para Claude Code (pegar tal cual)

```
Leé CLAUDE.md y docs/PROMPT-claude-code.md. Esta carpeta es el proyecto completo (rip.dillom — Mondilab). Quiero que lo construyas de punta a punta, en un solo recorrido, sin esperar mi aprobación entre fases, y que me muestres el resultado final funcionando.

Instrucciones de ejecución:
1. Empezá con un resumen de 10 líneas de lo que entendiste y la lista de dudas. Si hay dudas que bloquean, decilas; si no, asumí lo más razonable, anotalo en docs/DECISIONES.md y seguí.
2. Inicializá git (`git init`, rama main, .gitignore que excluya node_modules, dist, .env*, .wrangler y los .zip). Hacé un commit al terminar cada fase con mensaje claro.
3. Ejecutá las 6 fases de docs/PROMPT-claude-code.md en orden (escena 3D → material, tatuajes y billete → zonas tocables, globos, rutas y paneles → nebulosa, grano y carga/ENTRAR → contenido de paneles, tienda, aporte con Mercado Pago, modo tatuador y easter egg → rendimiento, accesibilidad, SEO y deploy). Seguí el diseño de diseno/project/*.dc.html y diseno/HANDOFF-dillom-lnv.md; ante contradicciones gana docs/PROMPT-claude-code.md.
4. Assets ya presentes: public/models/dilloms.glb (optimizalo con gltf-transform), public/audio/fondo.mp3, public/tatuajes/*.png, public/img/*.png y public/img/merch/*.jpg (curitas, mantel, muneco, cassette, barco, boxers, cana). Falta la imagen del producto "manual": la tienda debe mostrarlo con el estado de imagen faltante del diseño ("Sin foto" / "Se la comió el perro") hasta que exista public/img/merch/manual.jpg.
5. La tienda usa docs/merch.json (copiar a src/content/merch.json). Nombres visibles: solo lo que es cada producto (Muñequito, Curitas, Mantel bordado, Boxers unisex, Manual de geografía, Caña de pescar, Barco pirata, Cassette). Las imágenes ya traen su gráfica; no las modifiques.
6. El aporte con Mercado Pago va con una Cloudflare Pages Function (functions/api/aporte.ts) y el token SOLO como variable de entorno (MP_ACCESS_TOKEN). Dejá .env.example y probá con credenciales de prueba; no me pidas el token real en el chat ni lo escribas en archivos. Si no hay token, el formulario debe funcionar en modo simulado (devuelve una pantalla de éxito de prueba claramente marcada) para poder verlo.
7. Fechas de Shows: "a confirmar" salvo que estén verificadas. Textos pendientes: placeholders entre corchetes, definidos en src/content/*.json.
8. Verificá tu trabajo: `npm run build` sin errores, TypeScript estricto, lint, y probá el sitio con un navegador headless (capturas en 390×844 y 1440×900 del home, espalda, un panel, tienda, carrito y el modal de "mentirita"). Revisá que las zonas tocables abran lo correcto, que el ¡EPA! no navegue, que el mute funcione y que el home no tenga scroll. Corregí lo que falle.
9. No uses el logo oficial ni fotos del artista. Dejá el aviso "Tributo fan · no oficial". El "Powered by Mondi Studio" va al final del footer enlazando a https://mondistudio.com.ar, como último paso.
10. Al terminar: dejá README.md con cómo correrlo, variables de entorno, estructura y cómo desplegar a Cloudflare Pages (labs.mondistudio.com.ar/ripdillom), y resumime qué quedó hecho, qué decisiones tomaste y qué me falta aportar (imagen del manual, token de Mercado Pago, textos y fechas reales).
```
