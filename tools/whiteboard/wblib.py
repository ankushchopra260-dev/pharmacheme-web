"""Shared code for the whiteboard lessons (tools/whiteboard/<lesson>.py).

A lesson module defines SLUG, TITLE, INTRO, OUTRO_WEB, CALC, CALC_LABEL, ENDS and STEPS, then calls
wblib.main(globals()). Output: assets/data/wb-<slug>.json and assets/audio/wb/<slug>/*.mp3.
Voice: Kokoro (open model, run locally). Model files (not committed): set WB_TTS_DIR to a folder
holding kokoro.onnx and voices.bin. Pass --no-audio to rebuild the JSON only.

Drawing items (board is 360 x 400):
  ["t", x, y, text, size, colour]        handwritten text
  ["p", d, colour, width]                pen stroke (SVG path)
  ["c", cx, cy, r, colour, width]        circle
  ["a", x1, y1, x2, y2, colour]          arrow
  ["dim", x, y1, y2, colour]             two-headed dimension arrow
  ["pump", cx, cy, r]                    pump casing with eye and nozzle
  ["tank", x, y, w, h, levelY]           open tank with liquid
  ["v", cx, cy]                          valve (bow tie)
  ["x", cx, cy, size, colour]            cross
  ["k", x, y, colour]                    tick
Colours: k black, r red, b blue, g green, o orange.
The helpers below (hx, column, reactor, ejector, coil, axes) return lists of these items.
"""
import hashlib, json, os, subprocess, sys, textwrap

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
VOICE = 'af_heart'


def ask(n, text):
    """Question card: number and the question in handwriting, wrapped."""
    items = [["t", 20, 46, f"Q{n}", 30, "r"]]
    for i, line in enumerate(textwrap.wrap(text, 26)):
        items.append(["t", 20, 92 + i * 30, line, 22, "k"])
    return items


# ---------- shapes ----------
def hx(x, y, w, h, tubes=3):
    """Shell-and-tube exchanger, side view: shell, tube sheets and a few tubes."""
    it = [["p", f"M{x},{y} L{x + w},{y} Q{x + w + 16},{y + h / 2} {x + w},{y + h} L{x},{y + h} Q{x - 16},{y + h / 2} {x},{y} Z", "k", 3],
          ["p", f"M{x + 10},{y} L{x + 10},{y + h} M{x + w - 10},{y} L{x + w - 10},{y + h}", "k", 2]]
    for i in range(tubes):
        ty = y + h * (i + 1) / (tubes + 1)
        it.append(["p", f"M{x + 10},{ty} L{x + w - 10},{ty}", "b", 1.5])
    return it


def column(x, y, w, h, trays=4):
    """Distillation column with rounded heads and trays."""
    it = [["p", f"M{x},{y + 12} Q{x + w / 2},{y - 8} {x + w},{y + 12} L{x + w},{y + h - 12} Q{x + w / 2},{y + h + 8} {x},{y + h - 12} Z", "k", 3]]
    for i in range(trays):
        ty = y + 24 + (h - 48) * i / max(1, trays - 1)
        it.append(["p", f"M{x + 2},{ty} L{x + w - 10},{ty}" if i % 2 else f"M{x + 10},{ty} L{x + w - 2},{ty}", "k", 1.5])
    return it


def reactor(cx, y, w, h, level=None, jacket=True):
    """Jacketed reactor with agitator; level = liquid surface y."""
    x = cx - w / 2
    it = [["p", f"M{x},{y + 14} Q{cx},{y - 10} {x + w},{y + 14} L{x + w},{y + h - 16} Q{cx},{y + h + 14} {x},{y + h - 16} Z", "k", 3]]
    if jacket:
        it.append(["p", f"M{x - 8},{y + h * 0.35} L{x - 8},{y + h - 14} Q{cx},{y + h + 26} {x + w + 8},{y + h - 14} L{x + w + 8},{y + h * 0.35}", "b", 2])
    it.append(["p", f"M{cx},{y - 18} L{cx},{y + h - 22} M{cx - 16},{y + h - 26} L{cx + 16},{y + h - 22}", "k", 2.5])
    if level:
        it.append(["p", f"M{x + 4},{level} q{w / 4},-5 {w / 2},0 t{w / 2 - 8},0", "b", 2.5])
    return it


def ejector(x, y, L=150):
    """Steam ejector, horizontal: nozzle, suction, throat, diffuser."""
    return [["p", f"M{x},{y - 6} L{x + 30},{y - 3} M{x},{y + 6} L{x + 30},{y + 3}", "r", 2.5],
            ["p", f"M{x + 24},{y - 16} L{x + L * 0.45},{y - 6} L{x + L * 0.6},{y - 6} L{x + L},{y - 18}"
                  f" M{x + 24},{y + 16} L{x + L * 0.45},{y + 6} L{x + L * 0.6},{y + 6} L{x + L},{y + 18}", "k", 3],
            ["p", f"M{x + 40},{y + 16} L{x + 40},{y + 50} M{x + 58},{y + 12} L{x + 58},{y + 50}", "k", 3]]


def coil(x1, x2, y, amp=6, n=6, col="r"):
    """Wavy line, e.g. a heating coil or a hot stream."""
    seg = (x2 - x1) / n
    d = f"M{x1},{y}" + "".join(f" q{seg / 2},{-amp if i % 2 == 0 else amp} {seg},0" for i in range(n))
    return ["p", d, col, 2.5]


def axes(x0, y0, x1, y1, xl, yl):
    """L-shaped axes with labels: origin (x0,y1), top (x0,y0), right end (x1,y1)."""
    return [["p", f"M{x0},{y0} L{x0},{y1} L{x1},{y1}", "k", 2], ["t", x0 + 6, y0 + 2, yl, 13, "k"], ["t", x1 - 7 * len(xl), y1 + 18, xl, 13, "k"]]


# ---------- build ----------
def spoken(s, extra=()):
    """Text as the voice should say it."""
    for a, b in (('NPSHr', 'N P S H required'), ('NPSHa', 'N P S H available'), ('NPSH', 'N P S H'), ('LMTD', 'L M T D'),
                 ('MTSR', 'M T S R'), ('°C', ' degrees'), ('→', 'to'), ('kcal', 'kilocalories'), ('mmHg', 'millimetres of mercury'),
                 ('mbar', 'millibar'), (' vs ', ' versus ')) + tuple(extra):
        s = s.replace(a, b)
    return s


def build(m):
    lines = {}

    def line(lid, text):
        lines[lid] = text
        return lid

    out = {"slug": m['SLUG'], "title": m['TITLE'], "mascot": "Bubbles",
           "intro": line("intro", m['INTRO']), "outroWeb": line("outro-web", m['OUTRO_WEB']),
           "calc": m['CALC'], "calcLabel": m['CALC_LABEL'], "ends": m['ENDS'], "steps": []}
    for i, s in enumerate(m['STEPS'], 1):
        st = {"n": i, "q": s["q"], "say": line(f"q{i}", f"Question {i}. {s['q']}"), "board": ask(i, s["q"]), "title": s["title"],
              "summary": s["summary"], "opts": [], "beats": []}
        assert sum(1 for o in s["opts"] if o[1]) == 1, f"step {i}: one correct option"
        for j, (t, ok, react) in enumerate(s["opts"]):
            st["opts"].append({"t": t, "ok": ok, "react": line(f"q{i}-r{j}", react)})
        for k, (say, draw) in enumerate(s["beats"]):
            st["beats"].append({"say": line(f"q{i}-b{k}", say), "draw": draw})
        out["steps"].append(st)
    out["lines"] = {k: {"text": v} for k, v in lines.items()}
    return out


def tts(data, out_audio, extra=()):
    from kokoro_onnx import Kokoro
    import soundfile as sf
    d = os.environ.get('WB_TTS_DIR', '/home/claude/work/tts')
    k = Kokoro(os.path.join(d, 'kokoro.onnx'), os.path.join(d, 'voices.bin'))
    os.makedirs(out_audio, exist_ok=True)
    cache = os.path.join(d, 'cache'); os.makedirs(cache, exist_ok=True)
    keep = set()
    for lid, L in data["lines"].items():
        text = spoken(L["text"], extra)
        wav = os.path.join(cache, VOICE + '_' + hashlib.sha1(text.encode()).hexdigest()[:16] + '.wav')
        if not os.path.exists(wav):
            samples, sr = k.create(text, voice=VOICE, speed=1.06, lang='en-us')
            sf.write(wav, samples, sr)
        mp3 = os.path.join(out_audio, lid + '.mp3'); keep.add(lid + '.mp3')
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', wav, '-af', 'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse',
                        '-ac', '1', '-ar', '24000', '-b:a', '48k', mp3], check=True)
        dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', mp3], capture_output=True, text=True).stdout)
        L["dur"] = round(dur, 3)
        print(f'{lid:12s} {dur:5.2f}s  {L["text"][:60]}')
    for f in os.listdir(out_audio):
        if f.endswith('.mp3') and f not in keep:
            os.remove(os.path.join(out_audio, f))


def main(m):
    slug = m['SLUG']
    out_json = os.path.join(ROOT, 'assets', 'data', f'wb-{slug}.json')
    out_audio = os.path.join(ROOT, 'assets', 'audio', 'wb', slug)
    data = build(m)
    if '--no-audio' not in sys.argv:
        tts(data, out_audio, m.get('SPOKEN', ()))
    else:
        old = json.load(open(out_json)) if os.path.exists(out_json) else {"lines": {}}
        for lid, L in data["lines"].items():
            L["dur"] = old["lines"].get(lid, {}).get("dur") or round(len(L["text"].split()) / 2.6, 2)
    json.dump(data, open(out_json, 'w'), ensure_ascii=False, separators=(',', ':'))
    print('wrote', out_json, len(data["lines"]), 'lines')
    return data
