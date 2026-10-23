# DESIGN.md · Isla Saboga

Sistema visual de pcl2023.github.io/isla-saboga, extraído del código publicado (index.html, en.html, assets/asistente.js) el 22/10/2026. Cualquier página, landing, ficha de lote, correo HTML o pieza nueva de Isla Saboga debe seguir este archivo. Si algo aquí contradice el CSS en vivo, manda el CSS y este archivo se corrige.

## 1. Concepto visual

Carta náutica y plano catastral. La página se lee como un documento técnico serio sobre un lugar bello: portada a sangre con video o foto aérea, bandas editoriales con aire, una banda profunda para el mapa de lotes y otra para el contacto.

Tono: sobrio, preciso, sin promesa inmobiliaria. Los datos (hectáreas, coordenadas, tiempos de traslado, número de lotes) cargan el peso; los adjetivos casi no aparecen.

Público: comprador internacional de alto patrimonio que revisa título, energía, comunidad y entorno antes que la vista.

## 2. Color

Todos los colores se usan como variables CSS. Nunca escribir hex sueltos en componentes nuevos, salvo los textos fijos sobre foto (#EEF3F0) y el texto sobre botón dorado (#10201F).

| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `--paper` | #EDF1EE | #0B1A1C | Fondo general ("sal marina") |
| `--paper-2` | #E1E8E4 | #10252A | Bandas alternas, formularios, fondos de imagen |
| `--ink` | #0F2729 | #E2EBE8 | Texto principal ("tinta de carta náutica") |
| `--ink-2` | #465D5B | #9DB3AF | Texto secundario, pies de foto, labels |
| `--line` | rgba(15,39,41,.14) | rgba(226,235,232,.14) | Filetes de 1px |
| `--lagoon` | #0D6964 | #6FD3C5 | Acento de texto: eyebrows, números, enlaces activos |
| `--sand` | #9A6A30 | #D9AE72 | Filete vertical de los párrafos lead, último paso del proceso |
| `--sand-ink` | #7A5222 | #E3BE86 | Texto sobre fondos arena |
| `--deep` | #0A1E20 | #061213 | Banda del mapa, pie de página, fondo de portada |
| `--deep-2` | #113A3B | #0F2E30 | Banda de contacto |
| `--on-deep` / `--on-deep-2` | #E6EEEA / #A3B9B4 | #E2EBE8 / #9AB1AD | Texto sobre bandas profundas |
| `--lot` | #5CC9BB | igual | Lotes del mapa, eyebrows sobre fondo profundo |
| `--pick` | #E2B26E | igual | Único color de llamada a la acción (botón sólido, pin, foco) |
| `--land` / `--land-2` / `--sea` | #E7E6DC / #D6D3C0 / #C6DCE0 | #27393B / #34484A / #0C2730 | Mapas regionales en SVG |

Reglas:
- Un solo acento cálido: `--pick`. Se reserva para la acción principal y para lo seleccionado. Si una pantalla tiene más de un elemento dorado, sobra uno.
- `--lagoon` es acento de texto, no de fondo. La excepción es la etiqueta "real" sobre fotos (#0D6964).
- Modo oscuro completo vía `prefers-color-scheme` y `data-theme`. Todo componente nuevo debe verse bien en ambos.

## 3. Tipografía

- Una sola familia: **Schibsted Grotesk** (Google Fonts, pesos 400, 500, 600 e itálica 400). Respaldo: "Helvetica Neue", Arial, sans-serif.
- Los roles `--f-display`, `--f-body` y `--f-mono` apuntan a la misma familia. El efecto "técnico" se consigue con mayúsculas, tracking y cifras tabulares, no con una monoespaciada.
- Banderas: Noto Color Emoji.

| Rol | Tamaño | Peso | Tracking | Notas |
|---|---|---|---|---|
| H1 portada | `--step-4` clamp(2rem → 3.6rem) | 500 | -.035em | line-height .98 |
| H2 sección | `--step-3` clamp(1.15rem → 1.45rem) | 500 | -.02em | `text-wrap: balance` |
| H3 | `--step-1` .95rem | 600 | -.01em | line-height 1.3 |
| Cuerpo | `--step-0` .92rem | 400 | normal | line-height 1.45, máximo 62ch |
| Eyebrow / label | .58 a .7rem | 500 | .1 a .12em | MAYÚSCULAS, color `--lagoon` |
| Cifras | 1.1 a 1.35rem | 500 | -.02em | `font-variant-numeric: tabular-nums` |

Reglas:
- Titulares cortos y declarativos, con mayúscula solo en la primera palabra y nombres propios.
- Las secciones se numeran con eyebrow "01", "02"... junto a un ícono de trazo.
- Nada de negritas dentro de párrafos salvo cifras o datos clave.

## 4. Componentes

**Botones** (radio 0, siempre rectos)
- `.btn-solid`: fondo `--pick`, texto #10201F, hover #EEC287. Acción principal: "Agendar visita", "Enviar solicitud".
- `.btn-line`: borde claro translúcido sobre foto o banda profunda.
- `.btn-ink`: fondo `--ink`, hover `--lagoon`.
- `.btn-quiet`: solo borde `--line`.
- Texto 600, .8rem, padding .7rem 1.1rem. Verbos en infinitivo.

**Cabecera**: fija, transparente sobre la portada, pasa a `rgba(6,18,19,.82)` con blur 12px al hacer scroll. Marca en mayúsculas con tracking .22em. Selector de idioma ES/EN con bandas.

**Párrafo lead**: filete izquierdo de 2px `--sand` (o `--lot` sobre fondo profundo), padding-left 1rem.

**Cifras**: rejilla de 5 columnas separadas por filetes verticales de 1px, ícono pequeño en `--lagoon`, número grande y descripción en `--ink-2`.

**Pilares / tarjetas**: sin caja ni sombra. Filete superior de 1px `--ink`, clave en mayúsculas `--lagoon`, H3 y texto corto.

**Galería**: rejilla de 12 columnas con piezas de distinto tamaño, pie de foto en mayúsculas pequeñas, zoom lento 1.03 al pasar el cursor, visor `dialog` a pantalla completa.

**Mapa de lotes**: SVG sobre `--deep`, costa #7FE3D5, lotes con trazo claro, hover y selección en dorado, panel lateral fijo con `dl` de datos y barras finas de 6px.

**Proceso**: línea de tiempo horizontal de 7 pasos con puntos de 9px; el primero en `--lagoon`, el último cuadrado en `--sand`.

**Formulario**: campos sin caja, solo filete inferior; labels en mayúsculas pequeñas; foco en `--lagoon`; selector de país con bandera.

**FAQ**: `details` con filetes, "+" en `--lagoon` que rota 45°.

**Asistente (asistente.js)**: usa la misma paleta; no introducir colores nuevos en el chat.

## 5. Composición y espaciado

- Contenedor `.wrap` de 1200px máximo, márgenes laterales clamp(16px → 52px) y respeto de safe-area.
- Ritmo vertical: `--sp-section` clamp(1.6rem → 3rem) entre secciones, `--sp-block` clamp(.9rem → 1.5rem) entre bloques, `--sp-gap` clamp(1.2rem → 3rem) entre columnas.
- Patrón base: `.split` a dos columnas (titular a la izquierda, lead con filete a la derecha).
- Alternancia de fondos: `--paper`, `--paper-2`, `--deep`, foto a sangre. Nunca dos bandas profundas seguidas.
- Separadores: filetes de 1px (`.hairline`), no espacios vacíos ni sombras.

## 6. Profundidad y movimiento

- Sin sombras en tarjetas ni botones. Las únicas sombras están en popovers flotantes (selector de país, borrador).
- Radio 0 en todo, salvo elementos circulares (puntos del proceso, sello de envío, botón de cerrar del video).
- Movimiento lento y discreto: Ken Burns de 24s en la portada, imágenes que aparecen con opacidad en .9s, subida de 28px ligada al scroll. Todo se apaga con `prefers-reduced-motion`.

## 7. Qué hacer y qué evitar

Hacer:
- Datos verificables antes que adjetivos (hectáreas, minutos de traslado, número de lotes, coordenadas).
- Fotografía propia de la isla; renders marcados como tales con la etiqueta correspondiente.
- Tratamiento de "usted" en español; inglés neutro y formal.
- Mantener ES (index.html) y EN (en.html) sincronizados en estructura y estilo.

Evitar:
- Esquinas redondeadas, degradados de color, sombras de tarjeta, glassmorphism fuera de la cabecera.
- Segundo color de acento, azules de software, morados.
- Íconos rellenos o de colores; solo trazo de 1.6px en `currentColor`.
- Lenguaje de folleto ("paraíso", "oportunidad única", "exclusivo"), signos de exclamación, emojis en texto.
- Guion largo o medio como separador; usar punto, coma o el punto medio "·".
- Fuentes nuevas o la fuente del sistema.

## 8. Comportamiento responsive

- Puntos de corte en uso: 340, 420, 480, 520, 560, 600, 640, 720, 760, 860, 900, 980, 1000 y 1100px.
- Bajo 980px: el menú pasa a hamburguesa a pantalla completa, se oculta el botón de la cabecera y aparece la barra inferior fija `.mbar` con las llamadas a la acción.
- Bajo 860px: `.split`, mapa y FAQ pasan a una columna.
- Bajo 720px: galería a 2 columnas con imágenes a ancho completo alternas.
- Objetivos táctiles de al menos 40px de alto. Sin scroll horizontal.

## 9. Instrucciones para el agente

Antes de generar cualquier pieza de Isla Saboga:
1. Leer este archivo completo y reutilizar las variables de `:root` de index.html; no inventar tokens.
2. Partir de los componentes existentes (`.btn-*`, `.split`, `.lead`, `.figures`, `.pillars`, `.eyebrow.num`) antes de crear uno nuevo.
3. Probar en claro y oscuro, a 375px y a 1280px.
4. Cualquier cambio en index.html se replica en en.html.
5. No publicar precios, condiciones legales ni datos de lotes que no estén ya en la web o confirmados por MJ Davis.

Ejemplo de instrucción: "Crea una ficha de lote para Isla Saboga siguiendo DESIGN.md: banda `--paper`, eyebrow numerado, cifras del lote en rejilla con filetes y botón sólido 'Agendar visita'."
