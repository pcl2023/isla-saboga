"""Extrae de en.html todos los textos visibles a strings.json y deja template.html con marcadores [[[clave]]].
Segmentos = tramos de texto con sus etiquetas en línea (a, b, em, span, br...). Las etiquetas se conservan tal cual
dentro del segmento; el traductor solo cambia el texto. Atributos: alt, aria-label, title, placeholder, meta content."""
import re, json, sys, os

SRC = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'en.html')
OUT = os.path.dirname(os.path.abspath(__file__)) + '/'

INLINE = {'a','abbr','b','bdi','bdo','br','cite','code','data','dfn','em','i','kbd','mark','q','s','samp','small','span','strong','sub','sup','time','u','var','wbr'}
ATTRS = ('alt','aria-label','title','placeholder')
LETTERS = re.compile(r'[A-Za-zÀ-ÖØ-öø-ÿ]')

h = open(SRC, encoding='utf8').read()
strings = {}
counter = [0]
def key(prefix):
    counter[0] += 1
    return f'{prefix}{counter[0]:04d}'

# 1. Bloques opacos: scripts y estilos
tok = re.compile(r'(<!--.*?-->|<script\b[^>]*>.*?</script>|<style\b[^>]*>.*?</style>|<[^>]+>|[^<]+)', re.S)
tokens = tok.findall(h)
assert ''.join(tokens) == h, 'tokenización no reversible'

out = []
seg = []          # tokens del segmento en curso
svg_depth = 0

def flush():
    global seg
    if not seg:
        return
    raw = ''.join(seg)
    text_only = re.sub(r'<[^>]+>', '', raw)
    if LETTERS.search(text_only):
        lead = raw[:len(raw) - len(raw.lstrip())]
        trail = raw[len(raw.rstrip()):]
        core = raw.strip()
        k = key('t')
        strings[k] = core
        out.append(lead + '[[[' + k + ']]]' + trail)
    else:
        out.append(raw)
    seg = []

def attrs_sub(tag):
    def rep(m):
        name, val = m.group(1), m.group(2)
        if not LETTERS.search(val):
            return m.group(0)
        k = key('a')
        strings[k] = val
        return f'{name}="[[[{k}]]]"'
    return re.sub(r'\b(' + '|'.join(ATTRS) + r')="([^"]*)"', rep, tag)

for t in tokens:
    if t.startswith('<!--') or t.startswith('<script') or t.startswith('<style'):
        flush(); out.append(t); continue
    if t.startswith('<'):
        m = re.match(r'</?([a-zA-Z][a-zA-Z0-9]*)', t)
        name = m.group(1).lower() if m else ''
        closing = t.startswith('</')
        if name == 'svg':
            flush()
            svg_depth += 0 if t.endswith('/>') else (-1 if closing else 1)
            out.append(t); continue
        if svg_depth > 0:
            flush(); out.append(t); continue
        if name == 'meta':
            mm = re.search(r'(name="description"|property="og:title"|property="og:description")', t)
            if mm:
                k = key('m')
                val = re.search(r'content="([^"]*)"', t).group(1)
                strings[k] = val
                t = t.replace(f'content="{val}"', f'content="[[[{k}]]]"')
            flush(); out.append(t); continue
        if name in INLINE:
            seg.append(attrs_sub(t)); continue
        flush()
        out.append(attrs_sub(t)); continue
    # texto
    if svg_depth > 0 or not t.strip():
        if seg: seg.append(t)
        else: out.append(t)
        continue
    seg.append(t)
flush()
template = ''.join(out)

# 2. Literales del script en línea
EXACT = ['Close menu','Open menu','Unmute the music','Mute the music','Panama City','Light aircraft · 27 min','Boat · 5 to 10 min',
 'Gulf of Panama','Ferry · 1 h 30','Mar Caribe','Pacific Ocean','Costa Rica','Select a country','Search by country or code',
 'Search by country name','Search country','Countries','No se encontraron coincidencias','Frequent countries','All countries',
 'Complete the required fields and authorize the data processing to continue.',
 'Check the phone number: enter it without the country code, 6 to 15 digits.',
 'Check the email address: the format is not valid.',
 'Information request · Isla Saboga · ','Information request · Isla Saboga','Name: ','Email: ','Phone / WhatsApp: ','Country of residence: ',
 'Intended use: ','Required area: ','Estimated timeline: ','Budget: ','Heard about the project via: ','Broker acting for a buyer: ',
 'Private visit to the island: ','Would like to arrange it','Not for now','Comment: ','New request · Isla Saboga · ',
 '<h3>Request received</h3>',
 'Thank you, {first}. Your profile is now with our team. We will write to you personally at <b>{email}</b>, within 24 business hours, with the fact sheets of the parcels that fit your search.',
 '<ol><li><span>01 · Review</span>We review your profile and shortlist the parcels that fit.</li><li><span>02 · By email</span>You receive survey plan, area, price and terms for each one.</li><li><span>03 · If you wish</span>We arrange a private visit to the island.</li></ol>',
 'Continue the conversation on WhatsApp','Send another request','</span> Sending',
 'We could not send your request due to a connection problem. Your details are still in the form: please try again, or write to us directly on <a href="{wa}" target="_blank" rel="noopener">WhatsApp</a> or at <a href="mailto:sales@projectconsultingfirm.com">sales@projectconsultingfirm.com</a>.',
 'Island in the Las Perlas Archipelago, Gulf of Panama, with titled parcels for sale.']
EXACT.sort(key=len, reverse=True)
scripts = list(re.finditer(r'<script\b[^>]*>.*?</script>', template, re.S))
pieces = []; last = 0
for sm in scripts:
    pieces.append(template[last:sm.start()])
    s = sm.group(0)
    if 'type="application/json"' in s[:60]:
        pieces.append(s); last = sm.end(); continue
    for e in EXACT:
        if e in s:
            k = key('j'); strings[k] = e
            s = s.replace(e, f'[[[{k}]]]')
    pieces.append(s); last = sm.end()
pieces.append(template[last:])
template = ''.join(pieces)

missing = [e for e in EXACT if not any(v == e for v in strings.values())]
print('literales no encontrados:', missing)
open(OUT + 'template.html', 'w', encoding='utf8').write(template)
json.dump(strings, open(OUT + 'strings-en.json', 'w', encoding='utf8'), ensure_ascii=False, indent=1)
print('segmentos:', len(strings), 'caracteres de texto:', sum(len(v) for v in strings.values()))
# control: reconstruir con las cadenas originales debe devolver en.html
rebuilt = re.sub(r'\[\[\[([a-z]\d{4})\]\]\]', lambda m: strings[m.group(1)], template)
print('reconstrucción idéntica:', rebuilt == h)
