"""Construye en.html, it.html, fr.html, de.html, zh.html y ar.html desde template.html + strings-xx.json + widget-xx.json.
También regenera assets/idioma.js y assets/asistente.js con las tablas de texto de los siete idiomas."""
import re, json, sys, os

D = os.path.dirname(os.path.abspath(__file__)) + '/'
ROOT = os.path.abspath(os.path.join(D, '..')) + '/'
BASE = 'https://pcl2023.github.io/isla-saboga/'
META = {  # código: (archivo, og:locale, familia de fuente extra, dir)
    'en': ('en.html', 'en_US', None, 'ltr'),
    'it': ('it.html', 'it_IT', None, 'ltr'),
    'fr': ('fr.html', 'fr_FR', None, 'ltr'),
    'de': ('de.html', 'de_DE', None, 'ltr'),
    'zh': ('zh.html', 'zh_CN', 'Noto+Sans+SC:wght@400;500;600', 'ltr'),
    'ar': ('ar.html', 'ar_AE', 'Noto+Sans+Arabic:wght@400;500;600', 'rtl'),
}
TAG = re.compile(r'<[^>]+>')

ZH_CSS = ('\n<style>html[lang=zh]{--f-display:"Noto Sans SC","Schibsted Grotesk","PingFang SC","Microsoft YaHei",sans-serif;'
          '--f-body:"Noto Sans SC","Schibsted Grotesk","PingFang SC","Microsoft YaHei",sans-serif;--f-mono:"Noto Sans SC","Schibsted Grotesk",sans-serif}'
          'html[lang=zh] body{line-height:1.75}html[lang=zh] h1,html[lang=zh] h2,html[lang=zh] h3{letter-spacing:0;line-height:1.3}'
          'html[lang=zh] .eyebrow,html[lang=zh] .mono,html[lang=zh] footer h4,html[lang=zh] .k{letter-spacing:.06em}</style>')

AR_CSS = ('\n<style>html[dir=rtl]{--f-display:"Noto Sans Arabic","Schibsted Grotesk",Arial,sans-serif;--f-body:"Noto Sans Arabic","Schibsted Grotesk",Arial,sans-serif;--f-mono:"Noto Sans Arabic","Schibsted Grotesk",Arial,sans-serif}'
          'html[dir=rtl] body *{letter-spacing:0}'
          'html[dir=rtl] input[name="_honey"]{left:auto!important;right:-9999px!important}'
          'html[dir=rtl] h1,html[dir=rtl] h2,html[dir=rtl] h3{line-height:1.35}'
          'html[dir=rtl] body{line-height:1.7}'
          'html[dir=rtl] .nav{margin-left:0;margin-right:auto}'
          'html[dir=rtl] .nav a::after{transform-origin:right}'
          'html[dir=rtl] .lang{padding-left:0;padding-right:.55rem}'
          'html[dir=rtl] .lang select{padding:.42rem .35rem .42rem 1.35rem;background-position:left .5rem center}'
          'html[dir=rtl] .burger{margin-left:0;margin-right:auto}'
          'html[dir=rtl] .top .lang{margin-left:0;margin-right:auto}'
          'html[dir=rtl] .cue{right:auto;left:max(16px,env(safe-area-inset-left,0px))}'
          'html[dir=rtl] .coords .fl{margin-right:0;margin-left:.45em}'
          'html[dir=rtl] .flag.sm{margin-right:0;margin-left:.35em}'
          'html[dir=rtl] .split>.lead,html[dir=rtl] .split>.stack-lg>.lead:first-child,html[dir=rtl] .maphead .lead,html[dir=rtl] .visit .lead{border-left:0;border-right:2px solid var(--sand);padding-left:0;padding-right:1rem}'
          'html[dir=rtl] .figures div+div{padding-left:0;padding-right:1.2rem;border-left:0;border-right:1px solid var(--line)}'
          'html[dir=rtl] .figures div:nth-child(4){padding-right:0;border-right:0}'
          'html[dir=rtl] .chip b{margin-left:0;margin-right:.35rem}'
          'html[dir=rtl] .maptools{left:auto;right:12px}'
          'html[dir=rtl] .maplegend i{margin-right:0;margin-left:.5rem}'
          'html[dir=rtl] .uses .tag{left:auto;right:8px}'
          'html[dir=rtl] .steps li::before{left:auto;right:0}'
          'html[dir=rtl] .steps li:first-child .lab{left:auto;right:-3px}'
          'html[dir=rtl] .steps li:last-child .lab{left:auto;right:18px}'
          'html[dir=rtl] .steps li:not(:last-child)::after{right:auto;left:.5rem;transform:rotate(-135deg)}'
          'html[dir=rtl] .aside{border-left:0;border-right:2px solid var(--sand)}'
          'html[dir=rtl] .split .stack-lg .note{padding-left:0;padding-right:calc(1rem + 2px)}'
          'html[dir=rtl] select{background-position:10px 55%,15px 55%;padding-right:.2rem;padding-left:1.6rem}'
          'html[dir=rtl] .cp-pop{left:auto;right:0}'
          'html[dir=rtl] .submit .mono{margin-left:0;margin-right:auto}'
          'html[dir=rtl] .draft{right:auto;left:max(16px,env(safe-area-inset-left,0px))}'
          'html[dir=rtl] .play{border-left:0;border-right:8px solid currentColor}'
          'html[dir=rtl] .tels,html[dir=rtl] .mailrow a,html[dir=rtl] .coords,html[dir=rtl] footer .mono,html[dir=rtl] .figures strong{direction:ltr;unicode-bidi:isolate;display:inline-block}'
          '@media (max-width:640px){html[dir=rtl] .steps{border-left:0;border-right:1px solid var(--line);padding-left:0;padding-right:1.2rem}html[dir=rtl] .steps li::before{left:auto;right:calc(-1.2rem - 5px)}}'
          '</style>')

def check(key, src, dst):
    """Las etiquetas y los marcadores deben coincidir exactamente entre origen y traducción."""
    ts, td = TAG.findall(src), TAG.findall(dst)
    if ts != td:
        return f'{key}: etiquetas distintas\n  EN {ts}\n  XX {td}'
    for ph in ('{first}', '{email}', '{wa}'):
        if (ph in src) != (ph in dst):
            return f'{key}: marcador {ph} perdido'
    if not dst.strip():
        return f'{key}: vacío'
    return None

def build(code):
    fname, locale, font, direction = META[code]
    tpl = open(D + 'template.html', encoding='utf8').read()
    S = json.load(open(D + f'strings-{code}.json', encoding='utf8'))
    E = json.load(open(D + 'strings-en.json', encoding='utf8'))
    W = json.load(open(D + f'widget-{code}.json', encoding='utf8'))
    problems = []
    if set(S) != set(E):
        problems.append(f'claves distintas: faltan {set(E)-set(S)}, sobran {set(S)-set(E)}')
    for k in E:
        if k in S:
            p = check(k, E[k], S[k])
            if p: problems.append(p)
    if problems:
        print(f'[{code}] PROBLEMAS:'); print('\n'.join(problems[:40])); return False

    h = re.sub(r'\[\[\[([a-z]\d{4})\]\]\]', lambda m: S[m.group(1)], tpl)
    h = h.replace('[[[LANGLABEL]]]', W['langLabel'])
    h = h.replace('<html lang="en">', f'<html lang="{code}"' + (' dir="rtl"' if direction == 'rtl' else '') + '>', 1)
    h = h.replace(f'<link rel="canonical" href="{BASE}en.html">', f'<link rel="canonical" href="{BASE}{fname}">', 1)
    h = h.replace(f'<meta property="og:url" content="{BASE}en.html">', f'<meta property="og:url" content="{BASE}{fname}">', 1)
    h = h.replace('<meta property="og:locale" content="en_US">', f'<meta property="og:locale" content="{locale}">', 1)
    # selector: opción seleccionada
    sel = re.search(r'<select id="langSel"[^>]*>.*?</select>', h, re.S)
    block = sel.group(0).replace(' selected>', '>')
    block = re.sub(r'(<option value="[^"]*" data-short="[^"]*")(>[^<]*</option>)', lambda m: m.group(1) + (' selected' if (f'value="{fname}"' in m.group(1)) else '') + m.group(2), block)
    assert block.count(' selected>') == 1, 'selector sin opción seleccionada'
    h = h[:sel.start()] + block + h[sel.end():]
    if font:
        h = h.replace('&family=Noto+Color+Emoji&display=swap', f'&family=Noto+Color+Emoji&family={font}&display=swap', 1)
    extra = ZH_CSS if code == 'zh' else AR_CSS if code == 'ar' else ''
    if extra:
        h = h.replace('</style></head>', '</style>' + extra + '</head>', 1) if '</style></head>' in h else h.replace('</head>', extra + '</head>', 1)
    leftovers = re.findall(r'\[\[\[[^\]]*\]\]\]', h)
    if leftovers:
        print(f'[{code}] marcadores sin resolver:', leftovers[:10]); return False
    open(ROOT + fname, 'w', encoding='utf8').write(h)
    print(f'[{code}] {fname} escrito, {len(h)} caracteres')
    return True

def js_str(s):
    return "'" + s.replace('\\', '\\\\').replace("'", "\\'") + "'"

def write_widget_tables():
    codes = ['es', 'en', 'it', 'fr', 'de', 'zh', 'ar']
    W = {c: json.load(open(D + f'widget-{c}.json', encoding='utf8')) for c in codes}
    # asistente.js: tabla por idioma
    a = open(ROOT + 'assets/asistente.js', encoding='utf8').read()
    old = re.search(r"  var EN = /\^en/i\.test\(document\.documentElement\.lang \|\| 'es'\) \|\| !HAS_ES;\n  var T = EN \? \{.*?\n  \};\n", a, re.S)
    if not old: sys.exit('tabla T del asistente no encontrada')
    rows = []
    for c in codes:
        w = W[c]
        rows.append(f"    {c}: {{ btn:{js_str(w['btn'])}, btnShort:{js_str(w['btnShort'])}, title:'Isla Saboga', sub:{js_str(w['sub'])},\n"
                    f"      hello:{js_str(w['hello'])},\n"
                    f"      chips:[{js_str(w['chip1'])},{js_str(w['chip2'])},{js_str(w['chip3'])}],\n"
                    f"      tip:{js_str(w['tip'])}, ph:{js_str(w['ph'])}, send:{js_str(w['send'])},\n"
                    f"      note:{js_str(w['note'])},\n"
                    f"      err:{js_str(w['err'])},\n"
                    f"      close:{js_str(w['close'])}, closeTip:{js_str(w['closeTip'])} }}")
    new = ("  // Idioma de la página (es, en, it, fr, de, zh, ar). En la página en español, si el navegador no tiene español, se usa el inglés.\n"
           "  var PAGE = (document.documentElement.lang || 'es').slice(0, 2).toLowerCase();\n"
           "  var TABLES = {\n" + ',\n'.join(rows) + "\n  };\n"
           "  if (PAGE === 'es' && !HAS_ES) { PAGE = 'en'; }\n"
           "  if (!TABLES[PAGE]) { PAGE = 'en'; }\n"
           "  var EN = PAGE !== 'es';\n"
           "  var T = TABLES[PAGE];\n")
    a = a[:old.start()] + new + a[old.end():]
    a = a.replace("lang: EN?'en':'es', page: location.pathname", "lang: EN?'en':'es', pageLang: PAGE, page: location.pathname", 1)
    a = a.replace('/* Asistente de Isla Saboga. Un solo archivo para index.html y en.html.', '/* Asistente de Isla Saboga. Un solo archivo para todas las páginas (es, en, it, fr, de, zh, ar).', 1)
    open(ROOT + 'assets/asistente.js', 'w', encoding='utf8').write(a)
    # idioma.js: selector + aviso de idioma
    msgs = ',\n'.join(f"    {c}: {{ msg:{js_str(W[c]['offerMsg'])}, go:{js_str(W[c]['offerGo'])}, close:{js_str(W[c]['close'])} }}" for c in codes)
    idioma = open(D + 'idioma.base.js', encoding='utf8').read().replace('/*MSGS*/', msgs)
    open(ROOT + 'assets/idioma.js', 'w', encoding='utf8').write(idioma)
    print('asistente.js e idioma.js regenerados')

if __name__ == '__main__':
    codes = sys.argv[1:] or ['en', 'it', 'fr', 'de', 'zh', 'ar']
    ok = all(build(c) for c in codes)
    if ok and 'tables' in os.environ.get('I18N', 'tables'):
        write_widget_tables()
