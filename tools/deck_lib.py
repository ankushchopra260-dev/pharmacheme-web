"""Builds a 1920x1080 click-through training deck in the same style and runtime as the static-electricity deck.
Usage: from deck_lib import *; build(slug, meta, slides) where slides is a list of dicts made by the helpers below."""
import html, os, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_ref = open(f'{ROOT}/training/modules/static-and-solvent-fire-safety/deck/index.html', encoding='utf-8').read()
_HEAD = _ref[:_ref.index('<div id="stage">') + len('<div id="stage">')]
_TAIL = _ref[_ref.index('</div>\n<div id="np">'):]
E = html.escape
OSW = "font-family:'Oswald', Arial, sans-serif;"
DARK = dict(bg='#12202C', fg='#EEF1F3', mut='#B8C7D3', card='#1B2E3E', line='#2A3E50')
LIGHT = dict(bg='#EEF1F3', fg='#12202C', mut='#3C4A57', card='#FBFCFC', line='#C9D2DA')
ACC = ['#F2A900', '#2C6FB7', '#12202C', '#A23B1E']

def _sec(sid, theme, inner, notes, extra=''):
    t = DARK if theme == 'dark' else LIGHT
    return (f'<section id="{sid}" data-transition="fade" style="background:{t["bg"]};color:{t["fg"]};font-family:\'Public Sans\', Arial, sans-serif;padding:128px;display:flex;flex-direction:column">\n'
            f'{inner}\n<aside class="notes">{E(notes)}</aside>\n</section>\n'), t

def _h2(text, t, w=None):
    return f'<h2 style="{OSW}font-size:76px;font-weight:600;line-height:1.1;color:{t["fg"]}{";width:%dpx" % w if w else ""}">{E(text)}</h2>'

def cover(sid, kicker, title, sub, notes):
    t = DARK
    inner = (f'<div style="position:absolute;left:0;top:0;width:24px;height:1080px;background:#F2A900"></div>'
             f'<p style="font-size:32px;color:#F2A900;font-weight:600">{E(kicker)}</p>'
             f'<div style="margin-top:auto;margin-bottom:auto;display:flex;flex-direction:column;gap:32px"><h1 style="{OSW}font-size:150px;font-weight:600;line-height:1.0;color:#EEF1F3">{title}</h1>'
             f'<p style="font-size:44px;color:#B8C7D3;line-height:1.3;max-width:1300px">{E(sub)}</p></div>'
             f'<p style="font-size:28px;color:#B8C7D3">Ankush Chopra &middot; PharmaChemE</p>')
    return _sec(sid, 'dark', inner, notes)[0]

def stats(sid, title, items, punch, notes, theme='dark'):
    t = DARK if theme == 'dark' else LIGHT
    n = len(items); w = (1664 - 80 * (n - 1)) // n
    cells = ''
    for k, (num, lab) in enumerate(items):
        col = ACC[0] if k == n - 1 else t['mut']
        cells += (f'<div data-build-in="rise {k+1}" style="position:absolute;left:{128 + k*(w+80)}px;top:330px;width:{w}px;border-top:8px solid {col};padding:36px 0 0 0">'
                  f'<p style="{OSW}font-size:130px;font-weight:600;line-height:1.0;color:{col if k==n-1 else t["fg"]}">{E(num)}</p>'
                  f'<p style="font-size:34px;color:{t["mut"]};line-height:1.35;margin-top:14px">{E(lab)}</p></div>')
    cells += f'<p data-build-in="fade {n+1}" style="position:absolute;left:128px;top:840px;width:1664px;font-size:42px;font-weight:600;color:{t["fg"]};line-height:1.3">{E(punch)}</p>'
    return _sec(sid, theme, _h2(title, t) + cells, notes)[0]

def cards(sid, title, items, notes, theme='light', sub=None):
    """items: list of (head, text), 2 to 4 cards in a 2x2 grid (or 3 across)."""
    t = DARK if theme == 'dark' else LIGHT
    n = len(items); cols = 3 if n == 3 else 2
    w = (1664 - 48 * (cols - 1)) // cols; rows = (n + cols - 1) // cols
    top0 = 290 if not sub else 340
    h = (740 - top0 - 48 * (rows - 1)) // rows if rows > 1 else 420
    h = min(h, 330) if rows > 1 else 420
    out = _h2(title, t)
    if sub: out += f'<p style="position:absolute;left:128px;top:236px;width:1664px;font-size:32px;color:{t["mut"]};line-height:1.4">{E(sub)}</p>'
    for k, (hd, tx) in enumerate(items):
        r, c = divmod(k, cols)
        out += (f'<div data-build-in="rise {k+1}" style="position:absolute;left:{128 + c*(w+48)}px;top:{top0 + r*(h+48)}px;width:{w}px;height:{h}px;display:flex;flex-direction:column;gap:12px;background:{t["card"]};border-left:10px solid {ACC[k%4] if theme=="light" else ACC[0]};border-radius:8px;padding:30px 34px">'
                f'<h3 style="{OSW}font-size:44px;font-weight:600;color:{t["fg"]}">{E(hd)}</h3>'
                f'<p style="font-size:30px;color:{t["mut"]};line-height:1.4">{E(tx)}</p></div>')
    return _sec(sid, theme, out, notes)[0]

def bullets(sid, title, items, notes, theme='light', callout=None):
    """items: list of strings (each its own click). callout: (big, small) shown on the right."""
    t = DARK if theme == 'dark' else LIGHT
    wl = 1000 if callout else 1664
    lis = ''.join(f'<li data-build-in="fade {k+1}" style="margin-bottom:22px">{E(x)}</li>' for k, x in enumerate(items))
    out = _h2(title, t) + f'<ul style="position:absolute;left:128px;top:290px;width:{wl}px;font-size:40px;line-height:1.35;color:{t["fg"]};padding-left:1em">{lis}</ul>'
    if callout:
        out += (f'<div data-build-in="pop {len(items)+1}" style="position:absolute;left:1220px;top:300px;width:572px;border-top:8px solid #F2A900;padding-top:30px">'
                f'<p style="{OSW}font-size:90px;font-weight:600;color:#F2A900;line-height:1.05">{E(callout[0])}</p>'
                f'<p style="font-size:30px;color:{t["mut"]};line-height:1.4;margin-top:14px">{E(callout[1])}</p></div>')
    return _sec(sid, theme, out, notes)[0]

def compare(sid, title, left, right, notes, theme='light'):
    """left/right: (head, [items])"""
    t = DARK if theme == 'dark' else LIGHT
    out = _h2(title, t)
    for k, (hd, its) in enumerate((left, right)):
        col = '#A23B1E' if k == 0 else '#2C6FB7'
        li = ''.join(f'<li style="margin-bottom:14px">{E(x)}</li>' for x in its)
        out += (f'<div data-build-in="rise {k+1}" style="position:absolute;left:{128 + k*856}px;top:290px;width:808px;min-height:560px;background:{t["card"]};border-top:10px solid {col};border-radius:8px;padding:32px 40px">'
                f'<h3 style="{OSW}font-size:50px;font-weight:600;color:{t["fg"]};margin-bottom:20px">{E(hd)}</h3>'
                f'<ul style="font-size:32px;line-height:1.4;color:{t["mut"]}">{li}</ul></div>')
    return _sec(sid, theme, out, notes)[0]

def mythfact(sid, title, pairs, notes, theme='light'):
    """pairs: list of (claim, verdict_word, explanation) up to 3."""
    t = DARK if theme == 'dark' else LIGHT
    out = _h2(title, t)
    for k, (claim, verdict, expl) in enumerate(pairs):
        y = 290 + k * 230
        col = '#A23B1E' if verdict.lower().startswith(('myth', 'false', 'no')) else '#2C6FB7'
        out += (f'<div style="position:absolute;left:128px;top:{y}px;width:1664px;height:200px;background:{t["card"]};border-radius:12px"></div>'
                f'<p style="position:absolute;left:168px;top:{y+22}px;width:1000px;font-size:36px;font-weight:600;color:{t["fg"]};line-height:1.3">{E(claim)}</p>'
                f'<p data-build-in="pop {2*k+1}" style="position:absolute;left:1220px;top:{y+14}px;width:540px;{OSW}font-size:48px;font-weight:600;color:{col}">{E(verdict)}</p>'
                f'<p data-build-in="fade {2*k+1} auto" style="position:absolute;left:1220px;top:{y+76}px;width:540px;font-size:25px;color:{t["mut"]};line-height:1.35">{E(expl)}</p>')
    return _sec(sid, theme, out, notes)[0]

def guess(sid, title, question, answer_big, answer_text, notes, theme='dark'):
    t = DARK if theme == 'dark' else LIGHT
    out = (_h2(title, t) + f'<p style="position:absolute;left:128px;top:300px;width:1664px;font-size:50px;line-height:1.3;color:{t["fg"]}">{E(question)}</p>'
           f'<div data-build-in="rise 1" style="position:absolute;left:128px;top:600px;width:1664px;border-top:8px solid #F2A900;padding-top:34px">'
           f'<p style="{OSW}font-size:150px;font-weight:600;color:#F2A900;line-height:1.0">{E(answer_big)}</p>'
           f'<p style="font-size:36px;color:{t["mut"]};line-height:1.4;margin-top:16px;max-width:1500px">{E(answer_text)}</p></div>')
    return _sec(sid, theme, out, notes)[0]

def table(sid, title, header, rows, notes, theme='light', note=None):
    t = DARK if theme == 'dark' else LIGHT
    th = ''.join(f'<th style="font-size:30px;color:{t["mut"]}">{E(h)}</th>' for h in header)
    tr = ''.join(f'<tr data-build-in="fade {k+1}">' + ''.join(f'<td style="font-size:32px;color:{t["fg"]}">{E(c)}</td>' for c in r) + '</tr>' for k, r in enumerate(rows))
    out = _h2(title, t) + f'<table style="position:absolute;left:128px;top:290px;width:1664px"><thead><tr>{th}</tr></thead><tbody>{tr}</tbody></table>'
    if note: out += f'<p data-build-in="fade {len(rows)+1}" style="position:absolute;left:128px;top:900px;width:1664px;font-size:30px;color:{t["mut"]};line-height:1.4">{E(note)}</p>'
    return _sec(sid, theme, out, notes)[0]

def live(sid, title, stations, notes, sub="I set the conditions on screen. You decide before I reveal the answer."):
    t = DARK
    out = _h2(title, t) + f'<p style="position:absolute;left:128px;top:250px;width:1664px;font-size:32px;color:#B8C7D3;line-height:1.4">{E(sub)}</p>'
    for k, (b, rest) in enumerate(stations):
        out += (f'<div data-build-in="left {k+1}{"" if k==0 else " auto"}" style="position:absolute;left:128px;top:{360+k*110}px;width:1664px;display:flex;gap:32px;align-items:center;border-bottom:2px solid #2A3E50;padding:0 0 20px 0">'
                f'<p style="{OSW}font-size:56px;font-weight:600;color:#F2A900;width:80px">{k+1}</p><p style="font-size:34px;color:#EEF1F3"><b>{E(b)}</b> {E(rest)}</p></div>')
    return _sec(sid, 'dark', out, notes)[0]

def rules(sid, title, rule_list, notes):
    t = DARK
    lis = ''.join(f'<li>{E(r)}</li>' for r in rule_list)
    out = (f'<div style="position:absolute;left:0;top:0;width:24px;height:1080px;background:#F2A900"></div>' + _h2(title, t) +
           f'<ol data-build-in="fade 1" style="position:absolute;left:128px;top:290px;width:1100px;font-size:40px;color:#EEF1F3;line-height:1.7">{lis}</ol>'
           f'<p data-build-in="pop 2" style="position:absolute;left:1260px;top:330px;width:532px;{OSW}font-size:100px;font-weight:600;color:#F2A900;line-height:1.0;text-align:right">Questions?</p>'
           f'<p style="position:absolute;left:1340px;top:700px;width:452px;font-size:28px;color:#B8C7D3;line-height:1.4;text-align:right">Ankush Chopra<br>PharmaChemE (pharmacheme.in)</p>')
    return _sec(sid, 'dark', out, notes)[0]

def build(slug, title, slides):
    head = _HEAD.replace('Static &amp; Solvent Fire Safety', E(title)).replace('static-and-solvent-fire-safety', slug)
    d = f'{ROOT}/training/modules/{slug}/deck'
    os.makedirs(d, exist_ok=True)
    open(f'{d}/index.html', 'w', encoding='utf-8').write(head + '\n' + ''.join(slides) + _TAIL)
    return len(slides)
