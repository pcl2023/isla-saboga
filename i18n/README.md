# Traducciones del sitio

Las páginas `it.html`, `fr.html`, `de.html`, `zh.html` y `ar.html` se generan desde `en.html`.

- `extraer.py` lee `../en.html`, deja `template.html` con marcadores y `strings-en.json` con los 338 textos.
- `strings-xx.json` y `widget-xx.json` son los textos de cada idioma (misma clave que el inglés). `widget-*.json` son los textos del chat, del selector y del aviso de idioma.
- `selector.py` inserta el selector de siete idiomas y el bloque `hreflang` (ya aplicado a `index.html` y a `template.html`).
- `construir.py` reconstruye las páginas y regenera `../assets/asistente.js` y `../assets/idioma.js`.

## Cuando cambie el contenido en inglés
1. Editar `../en.html`.
2. `python3 extraer.py` (regenera `template.html` y `strings-en.json`; comparar con la versión anterior para ver qué claves cambiaron).
3. Traducir solo las claves nuevas o cambiadas en cada `strings-xx.json`.
4. `git checkout ../assets/asistente.js ../assets/idioma.js` y luego `python3 construir.py`.

El chino y el árabe se entregaron en calidad de borrador: conviene una revisión de hablante nativo antes de promocionarlos.
