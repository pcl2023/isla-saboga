# Isla Saboga · sitio de comercialización

Sitio estático publicado con GitHub Pages en https://pcl2023.github.io/isla-saboga/

## Páginas
- `index.html` español (versión maestra, editada a mano)
- `en.html` inglés (versión maestra, editada a mano)
- `it.html`, `fr.html`, `de.html`, `zh.html`, `ar.html` italiano, francés, alemán, chino simplificado y árabe. Se generan a partir de `en.html` con un juego de cadenas por idioma; cualquier cambio de contenido se hace primero en `index.html` y `en.html` y después se vuelve a generar el resto.
- `gracias.html` y `thanks.html` confirmación del formulario sin JavaScript.

## Archivos compartidos (`assets/`)
- `asistente.js` chat con IA (Worker de Cloudflare). Textos de la interfaz en los siete idiomas dentro del archivo.
- `idioma.js` selector de idioma de la cabecera y aviso que ofrece la versión en el idioma del navegador.
- `redes.js` enlaces a Instagram, X y Facebook. Están ocultos hasta escribir la URL de cada cuenta en este archivo; con eso aparecen en todas las páginas.
- Videos: `v-hero-m.mp4` y `v-visita-m.mp4` (celular, 960x540), `v-hero-d.mp4` y `v-visita-d.mp4` (escritorio, 1280x720), `v-film.mp4` (película completa, solo al hacer clic). La página elige el tamaño según el ancho de pantalla y arranca los videos después de cargar; con ahorro de datos o red lenta no los descarga.
- Fotos: cada imagen de galería y de usos existe en tres anchos (`-640`, `-1200` y el original) y la página pide el que corresponde a la pantalla.

## Cómo cambiar algo
1. Texto o diseño: editar `index.html` y `en.html`; regenerar los otros cinco idiomas.
2. Redes sociales: escribir las URL en `assets/redes.js`.
3. Foto nueva: generar las variantes de 640 y 1200 px y usar el mismo patrón `srcset` de las existentes.
4. Video nuevo: exportar en 960x540 (celular) y 1280x720 (escritorio), H.264, sin audio, con `movflags faststart`.
