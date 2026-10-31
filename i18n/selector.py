"""Selector de idioma común (menú desplegable de siete idiomas) y bloque hreflang.
Se aplica a index.html (ES) y a template.html (base EN de las demás)."""
import re, sys, os

LANGS = [('es', './', 'ES', 'Español'), ('en', 'en.html', 'EN', 'English'), ('it', 'it.html', 'IT', 'Italiano'),
         ('fr', 'fr.html', 'FR', 'Français'), ('de', 'de.html', 'DE', 'Deutsch'), ('zh', 'zh.html', '中文', '中文'),
         ('ar', 'ar.html', 'عربي', 'العربية')]
BASE = 'https://pcl2023.github.io/isla-saboga/'

CHEV = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' fill='none' stroke='%23E6EEEA' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")"

NEW_CSS = (
 '.lang{display:flex;flex:none;align-items:center;gap:.2rem;padding-left:.55rem;border:1px solid rgba(230,238,234,.32);border-radius:var(--radius);font-family:var(--f-mono);font-size:var(--t-xs);color:inherit}\n'
 '.lang .ic{width:14px;height:14px;opacity:.85;flex:none}\n'
 '.lang select{appearance:none;-webkit-appearance:none;background:transparent ' + CHEV + ' no-repeat right .5rem center/9px auto;border:0;color:inherit;font:inherit;line-height:1.2;padding:.42rem 1.35rem .42rem .35rem;cursor:pointer;max-width:9.5rem;text-overflow:ellipsis}\n'
 '.lang select option{color:#10201F;background:#fff}\n'
 '.lang select:focus-visible{outline:2px solid var(--sand);outline-offset:2px}\n')

def switcher(label_placeholder, current):
    opts = ''.join(f'<option value="{href}" data-short="{short}"{" selected" if code == current else ""}>{name}</option>'
                   for code, href, short, name in LANGS)
    return (f'<div class="lang"><svg class="ic" aria-hidden="true"><use href="#i-globe"/></svg>'
            f'<select id="langSel" aria-label="{label_placeholder}">{opts}</select></div>')

def hreflang(current):
    links = ''.join(f'<link rel="alternate" hreflang="{code}" href="{BASE}{"" if href == "./" else href}">' for code, href, _, _ in LANGS)
    links += f'<link rel="alternate" hreflang="x-default" href="{BASE}en.html">'
    return links

def apply(h, label_placeholder, current):
    # 1. markup del selector
    old = re.search(r'<div class="lang" role="group" aria-label="[^"]*">\s*<button.*?</button>\s*<button.*?</button>\s*</div>', h, re.S)
    if not old: sys.exit('selector antiguo no encontrado')
    h = h[:old.start()] + switcher(label_placeholder, current) + h[old.end():]
    # 2. CSS
    old_css = re.search(r'\.lang\{display:flex;flex:none;border:1px solid rgba\(230,238,234,\.32\);[^}]*\}\n\.lang button\{[^}]*\}\n\.lang button\[aria-pressed="true"\]\{[^}]*\}\n\.lang button\[disabled\]\{[^}]*\}\n\.lang button\{[^}]*\}\n', h)
    if not old_css: sys.exit('css del selector no encontrado')
    h = h[:old_css.start()] + NEW_CSS + h[old_css.end():]
    n = h.count('.top .lang button{padding:.42rem .5rem}.top .lang button span{display:none}')
    if n != 1: sys.exit(f'css móvil del selector: {n}')
    h = h.replace('.top .lang button{padding:.42rem .5rem}.top .lang button span{display:none}', '.top .lang select{max-width:5.2rem;padding-right:1.2rem}')
    # 3. hreflang: reemplaza el bloque de alternates existente
    old_hl = re.search(r'(<link rel="alternate" hreflang="[^"]*" href="[^"]*">)+', h)
    if not old_hl: sys.exit('hreflang no encontrado')
    h = h[:old_hl.start()] + hreflang(current) + h[old_hl.end():]
    return h

if __name__ == '__main__':
    path, label, current = sys.argv[1], sys.argv[2], sys.argv[3]
    h = open(path, encoding='utf8').read()
    h = apply(h, label, current)
    open(path, 'w', encoding='utf8').write(h)
    print(path, 'selector aplicado para', current)
