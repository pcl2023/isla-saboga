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
- Tipografía: `schibsted-grotesk.woff2` (pesos 400 a 600) y `schibsted-grotesk-italic.woff2` (400), alojadas en el propio sitio y recortadas a los caracteres latinos que usa la web. Licencia en `OFL-schibsted-grotesk.txt`. Google Fonts solo se usa en `zh.html` y `ar.html` (Noto Sans SC y Noto Sans Arabic, sin bloquear la página; las inserta `i18n/construir.py`). Las banderas usan la fuente del propio teléfono o computadora; solo en Windows, que no dibuja banderas, `idioma.js` carga Noto Color Emoji de Google.
- Videos: `v-hero-m.mp4` y `v-visita-m.mp4` (celular, 960x540), `v-hero-d.mp4` y `v-visita-d.mp4` (escritorio, 1280x720), `v-film.mp4` (película completa con música original, solo al hacer clic en «Ver video de la isla · 45 s»). La página elige el tamaño según el ancho de pantalla y arranca los videos después de cargar (0,6 s en escritorio, 2,5 s en celular); con ahorro de datos o red lenta no los descarga.
- Música: `musica.js` y `musica-fondo.mp3`. La música de fondo es la pista original del film en bucle sin corte (34,5 s, Re mayor). Arranca con el primer toque, clic o tecla del visitante (los navegadores no permiten sonido antes), entra con fundido a volumen bajo, se calla al abrir el film y al cambiar de pestaña, y vuelve al cerrar el film. Botón redondo turquesa (el color del asistente): en computadora va fijo en la cabecera, pegado al margen derecho (junto a «Agendar visita» si ese margen es angosto, entre 1120 y 1279 px); en celular y tableta flota abajo a la izquierda, a la altura del asistente. Al arrancar la música aparece seis segundos la leyenda «Silenciar la música» junto al botón; si el visitante la silencia, el sitio lo recuerda en ese navegador. En iPhone respeta el interruptor de silencio. Volumen: constante `VOL` en `musica.js`. El film (`v-film.mp4`) lleva su propia música original (Fa mayor, cambios de acorde sobre los fundidos del video).
- Fotos: cada imagen de galería y de usos existe en tres anchos (`-640`, `-1200` y el original) y la página pide el que corresponde a la pantalla.

## Cómo cambiar algo
1. Texto o diseño: editar `index.html` y `en.html`; regenerar los otros cinco idiomas.
2. Redes sociales: escribir las URL en `assets/redes.js`.
3. Foto nueva: generar las variantes de 640 y 1200 px y copiar el patrón de las existentes, con `data-src` y `data-srcset` (no `src` ni `srcset`) y `loading="lazy"`; así la descarga `diferido.js` cuando hace falta.
4. Video nuevo: exportar en 960x540 (celular) y 1280x720 (escritorio), H.264, sin audio, con `movflags faststart`.
5. Color de la costa en el mapa de la sección 03: variable `--pick` (dorado de los botones), reglas `#mapa .costa` y `.lg-costa`.
6. Música de fondo: reemplazar `assets/musica-fondo.mp3` por un archivo periódico (medio segundo de cola, el bucle y medio segundo de cabeza) y ajustar `LOOP_START` y `LOOP_END` en `assets/musica.js`. Usar solo música propia o con licencia escrita de uso comercial.
7. Punto de vista del mapa satelital o de Google Earth: constantes `EMBED` y `EARTH` en `assets/diferido.js`.

## Velocidad
Medición de referencia antes y después: PageSpeed Insights (https://pagespeed.web.dev) en modo celular y escritorio. GitHub Pages guarda los archivos en la memoria del navegador solo 10 minutos; con dominio propio detrás de Cloudflare ese plazo se puede alargar.
