# Isla Saboga · sitio de comercialización

Sitio estático publicado con GitHub Pages en https://pcl2023.github.io/isla-saboga/

## Páginas
- `index.html` español (versión maestra, editada a mano)
- `en.html` inglés (versión maestra, editada a mano)
- `it.html`, `fr.html`, `de.html`, `zh.html`, `ar.html` italiano, francés, alemán, chino simplificado y árabe. Se generan a partir de `en.html` con un juego de cadenas por idioma; cualquier cambio de contenido se hace primero en `index.html` y `en.html` y después se vuelve a generar el resto.
- `gracias.html` y `thanks.html` confirmación del formulario sin JavaScript.

## Archivos compartidos (`assets/`)
- `asistente.js` chat con IA (Worker de Cloudflare). Textos de la interfaz en los siete idiomas dentro del archivo.
- `idioma.js` selector de idioma de la cabecera (con banderas) y aviso que ofrece la versión en el idioma del navegador.
- `diferido.js` todo lo que se carga bajo demanda: fotos de galería, usos y banda Visitar (se descargan 600 px antes de llegar a ellas), fotografía aérea del mapa de la sección 03 (`mosaico.webp`, o `mosaico-1200.webp` en celular) y, en la sección 06, los botones Ruta / Satélite / 3D. La vista satelital es un mapa de Google Maps que solo se carga cuando el visitante la pide; 3D abre Google Earth en otra pestaña. Textos en los siete idiomas dentro del archivo.
- `redes.js` enlaces a Instagram, X y Facebook. Están ocultos hasta escribir la URL de cada cuenta en este archivo; con eso aparecen en todas las páginas.
- Tipografía: `schibsted-grotesk.woff2` (pesos 400 a 600) y `schibsted-grotesk-italic.woff2` (400), alojadas en el propio sitio y recortadas a los caracteres latinos que usa la web. Licencia en `OFL-schibsted-grotesk.txt`. De Google Fonts solo quedan Noto Color Emoji (banderas en Windows) y, en `zh.html` y `ar.html`, Noto Sans SC y Noto Sans Arabic; se cargan sin bloquear la página.
- Videos: `v-hero-m.mp4` y `v-visita-m.mp4` (celular, 960x540), `v-hero-d.mp4` y `v-visita-d.mp4` (escritorio, 1280x720), `v-film.mp4` (película completa, solo al hacer clic). La página elige el tamaño según el ancho de pantalla y arranca los videos después de cargar (0,6 s en escritorio, 2,5 s en celular); con ahorro de datos o red lenta no los descarga.
- Fotos: cada imagen de galería y de usos existe en tres anchos (`-640`, `-1200` y el original) y la página pide el que corresponde a la pantalla.

## Cómo cambiar algo
1. Texto o diseño: editar `index.html` y `en.html`; regenerar los otros cinco idiomas.
2. Redes sociales: escribir las URL en `assets/redes.js`.
3. Foto nueva: generar las variantes de 640 y 1200 px y copiar el patrón de las existentes, con `data-src` y `data-srcset` (no `src` ni `srcset`) y `loading="lazy"`; así la descarga `diferido.js` cuando hace falta.
4. Video nuevo: exportar en 960x540 (celular) y 1280x720 (escritorio), H.264, sin audio, con `movflags faststart`.
5. Color de la costa en el mapa de la sección 03: variable `--pick` (dorado de los botones), reglas `#mapa .costa` y `.lg-costa`.
6. Punto de vista del mapa satelital o de Google Earth: constantes `EMBED` y `EARTH` en `assets/diferido.js`.

## Velocidad
Medición de referencia antes y después: PageSpeed Insights (https://pagespeed.web.dev) en modo celular y escritorio. GitHub Pages guarda los archivos en la memoria del navegador solo 10 minutos; con dominio propio detrás de Cloudflare ese plazo se puede alargar.
