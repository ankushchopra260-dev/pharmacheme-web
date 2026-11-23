"""Whiteboard lesson: steam and steam traps. Run: python3 tools/whiteboard/steam_traps.py [--no-audio]
Drawing items and voice setup: see wblib.py."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from wblib import axes, main

SLUG = 'steam-and-steam-traps'
TITLE = 'Steam and steam traps'
CALC = '/calculators/steam-heating-calculator/'
CALC_LABEL = 'Open the steam heating calculator'
ENDS = ['The boiler house salutes you.', 'Not bad. Bubbles is watching.', 'Bubbles wins this round.']
INTRO = "Hi, I'm Bubbles. Today: steam, the plant's favourite way to move heat, and the traps that keep it honest. Six questions. Ready?"
OUTRO_WEB = "That's the lesson. Now try the steam heating calculator."
SPOKEN = (('barg', 'bar gauge'), ('kcal/kg', 'kilocalories per kilogram'), ('°C', ' degrees'))


def trap(cx, cy):
    """Steam trap symbol on a line: circle with a T."""
    return [["c", cx, cy, 12, "k", 2.5], ["p", f"M{cx - 6},{cy - 4} L{cx + 6},{cy - 4} M{cx},{cy - 4} L{cx},{cy + 7}", "k", 2]]


STEPS = [
    {
        "q": "Why do process heaters use saturated steam rather than superheated steam?",
        "opts": [
            ["Superheated is always better", False, "Hotter, yes. Better for heating, no. It gives its heat up slowly."],
            ["It heats by condensing", True, "Yes! Latent heat, at one steady temperature."],
            ["It is cheaper to make", False, "It's a little cheaper, but that's not the main reason."],
            ["Superheated can't flow in pipes", False, "It flows just fine. Turbines love it."],
        ],
        "title": "Why saturated?",
        "beats": [
            ["Saturated steam condenses on the tube wall and gives up its latent heat at one fixed temperature.",
             [["t", 20, 86, "saturated: condenses at one", 18, "b"], ["t", 20, 110, "fixed temperature", 18, "b"]]],
            ["Condensing gives a very high film coefficient. Much higher than a gas cooling down.",
             [["t", 20, 152, "condensing film: very high h", 18, "g"]]],
            ["Superheated steam has to cool down like a gas first. Poor heat transfer, and uneven temperatures.",
             [["t", 20, 196, "superheated: cools like a gas", 18, "r"], ["t", 20, 220, "first → poor transfer", 18, "r"]]],
            ["So plants desuperheat steam before it reaches heaters and jackets.",
             [["t", 20, 268, "desuperheat before heating", 18, "k"]]],
        ],
        "summary": "Saturated steam heats by condensing on the surface, giving up its latent heat at a single fixed temperature with a very high film coefficient. Superheated steam must first cool like a gas, with poor heat transfer and uneven temperatures, so steam is usually desuperheated before process heaters and jackets.",
    },
    {
        "q": "Why reduce steam from 10 barg to 3.5 barg for heating, if the process allows?",
        "opts": [
            ["It is cheaper to make", False, "The boiler makes it at one pressure anyway. Look at the heat per kilo."],
            ["More latent heat per kg", True, "Correct! More useful heat per kilo, and gentler on the product."],
            ["High pressure doesn't condense", False, "It condenses fine, just at a higher temperature."],
            ["Lower pressure flows faster", False, "Flow isn't the point here."],
        ],
        "title": "Lower pressure",
        "beats": [
            ["At 10 bar gauge, steam condenses at about 184 degrees and gives about 477 kilocalories per kilogram.",
             [["t", 20, 86, "10 barg: ~184 °C, ~477 kcal/kg", 18, "r"]]],
            ["At 3.5 bar gauge, it condenses at about 148 degrees and gives about 506.",
             [["t", 20, 118, "3.5 barg: ~148 °C, ~506 kcal/kg", 18, "b"]]],
            ["So each kilogram gives more heat, the product sees a gentler wall, and less flashes off from the condensate.",
             [["t", 20, 164, "more latent heat per kg", 18, "g"], ["t", 20, 190, "gentler wall, less flash", 18, "g"]]],
            ["The catch: lower pressure means a smaller temperature difference, so you may need more area.",
             [["t", 20, 238, "catch: smaller ΔT → more area", 18, "o"]]],
        ],
        "summary": "Steam at 10 barg condenses at about 184 °C and releases about 477 kcal/kg; at 3.5 barg it condenses at about 148 °C and releases about 506 kcal/kg. Lower-pressure steam gives more latent heat per kilogram, a gentler wall temperature and less flash steam, but the smaller temperature difference may need more heat transfer area.",
    },
    {
        "q": "What does a steam trap do?",
        "opts": [
            ["Holds condensate, lets steam out", False, "Exactly backwards. That would flood your heater."],
            ["Lets condensate out, holds steam", True, "Yes! Water out, steam stays to do its job."],
            ["Raises the steam pressure", False, "A trap doesn't add pressure. It just sorts water from steam."],
            ["Measures steam flow", False, "That's a flow meter's job."],
        ],
        "title": "The trap's job",
        "beats": [
            ["Steam condenses as it gives up heat. That condensate has to leave, or it floods the equipment.",
             [["p", "M40,100 L200,100 L200,160", "r", 3], ["t", 40, 90, "steam", 15, "r"], *trap(200, 172), ["p", "M200,184 L200,220 L300,220", "b", 3],
              ["t", 230, 210, "condensate out", 15, "b"]]],
            ["A trap opens for condensate and air, and closes against steam.",
             [["t", 20, 262, "condensate + air: out", 18, "b"], ["t", 20, 288, "steam: stays in", 18, "r"]]],
            ["Float traps, with a built-in air vent, suit heat exchangers with changing loads. Thermodynamic traps suit steam main drains.",
             [["t", 20, 330, "float: exchangers, varying load", 16, "k"], ["t", 20, 354, "thermodynamic: mains drains", 16, "k"]]],
            ["Air must go too. It blankets the surface and lowers the steam temperature.",
             [["t", 20, 384, "air blankets → vent it", 17, "o"]]],
        ],
        "summary": "A steam trap lets condensate and air out while holding steam in, so equipment does not flood and steam stays to give up its heat. Float traps suit heat exchangers with varying loads; thermodynamic traps suit steam main drains. Air must also be removed, because it blankets heat transfer surfaces and lowers the effective steam temperature.",
    },
    {
        "q": "An open trap discharge shows a big white cloud. Has the trap failed?",
        "opts": [
            ["Yes, always", False, "Not always. Some of that cloud is meant to be there."],
            ["Not necessarily", True, "Right! Hot condensate flashes when the pressure drops."],
            ["Yes, if the cloud is big", False, "Cloud size mostly tracks load and pressure. Look at the jet."],
            ["Only if it's noisy", False, "Noise alone won't tell you. Look at the jet."],
        ],
        "title": "Flash or live?",
        "beats": [
            ["Condensate at steam temperature drops to atmospheric pressure. Part of it boils off as flash steam.",
             [*trap(80, 100), ["p", "M80,112 L80,150", "b", 3], ["c", 70, 180, 14, "k", 1.5], ["c", 92, 196, 18, "k", 1.5], ["c", 70, 214, 14, "k", 1.5],
              ["t", 120, 190, "flash: lazy white cloud", 16, "b"]]],
            ["Flash steam is a lazy, white cloud that drifts up from the condensate.",
             [["t", 120, 214, "→ normal", 16, "g"]]],
            ["Live steam blowing through a failed trap is a fast, almost clear jet right at the outlet, then turns white further out.",
             [["t", 20, 266, "live steam: clear, fast jet", 18, "r"], ["t", 20, 290, "at the outlet → failed open", 18, "r"]]],
            ["Stand clear of the outlet: near it, live steam is invisible and burns. Confirm with an ultrasonic check. A trap failed open wastes steam every hour of the year.",
             [["t", 20, 336, "stand clear: live steam is invisible", 16, "r"], ["t", 20, 384, "confirm: ultrasonic", 16, "k"], ["t", 20, 360, "failed open → steam wasted", 16, "o"]]],
        ],
        "summary": "When hot condensate drops to atmospheric pressure, part of it flashes to steam, forming a lazy white cloud, which is normal. Live steam blowing through a failed-open trap shows as a fast, nearly clear jet at the outlet that turns white further away. Stand clear of the outlet, since live steam near it is invisible and burns, and confirm with an ultrasonic check; a trap failed open wastes steam continuously.",
    },
    {
        "q": "Condensate at 7 barg is let down to atmosphere. Roughly what share flashes to steam?",
        "opts": [
            ["About 1 %", False, "Much more than that. The condensate is very hot."],
            ["About 13 %", True, "About 13 percent. Spot on."],
            ["About 50 %", False, "Half? That's a lot more than the heat available."],
            ["None", False, "None? Then where does that white cloud come from?"],
        ],
        "title": "Flash steam",
        "beats": [
            ["Condensate at 7 bar gauge is at about 170 degrees, holding about 172 kilocalories per kilogram.",
             [["t", 20, 86, "7 barg condensate: ~170 °C,", 18, "k"], ["t", 20, 110, "~172 kcal/kg", 18, "k"]]],
            ["At atmospheric pressure, water can only hold 100 kilocalories per kilogram. The extra 72 boils some of it off.",
             [["t", 20, 152, "atmosphere: 100 kcal/kg", 18, "b"], ["t", 20, 176, "extra 72 → boils some off", 18, "b"]]],
            ["Each kilogram boiled takes about 539 kilocalories. 72 over 539 is about 13 percent.",
             [["t", 20, 220, "72 ÷ 539 ≈ 13 %", 22, "r"]]],
            ["That flash steam is real energy. Recover it in a flash vessel for low-pressure heating.",
             [["t", 20, 270, "recover in a flash vessel", 18, "g"]]],
        ],
        "summary": "Condensate at 7 barg is at about 170 °C and holds about 172 kcal/kg. At atmospheric pressure water can hold only about 100 kcal/kg, so the extra 72 kcal/kg evaporates part of it; at about 539 kcal/kg latent heat, that is 72 ÷ 539 ≈ 13 %. Flash steam can be recovered in a flash vessel for low-pressure heating.",
    },
    {
        "q": "Steam mains bang loudly when steam is let in at start-up. What is the main cause?",
        "opts": [
            ["The steam is too dry", False, "Dry steam is what you want. Something wet is the problem."],
            ["The boiler pressure is too high", False, "High pressure alone doesn't bang. Water does."],
            ["Water left in low points", True, "Yes! Water slugs hit the bends. That's water hammer."],
            ["The pipe is too big", False, "A big pipe isn't the reason for the bang."],
        ],
        "title": "Drain the mains",
        "beats": [
            ["A cold main fills with condensate as steam warms it. That water collects at low points.",
             [["p", "M20,120 L120,120 L140,160 L220,160 L240,120 L340,120", "k", 3], ["p", "M150,156 L210,156", "b", 5], ["t", 100, 182, "water", 15, "b"]]],
            ["Steam rushing in picks the water up into a slug and hurls it at the next bend. Bang.",
             [["a", 40, 110, 110, 110, "r"], ["t", 40, 100, "fast steam", 15, "r"], ["t", 196, 214, "slug → bend → BANG", 16, "r"]]],
            ["Fit drip legs with traps at every low point and every 30 to 50 metres on long runs.",
             [["p", "M180,160 L180,236", "k", 3], *trap(180, 248), ["t", 20, 298, "drip leg + trap at low points,", 17, "g"], ["t", 20, 322, "every 30-50 m", 17, "g"]]],
            ["And warm mains up slowly, with drains open. Check your loads in the steam heating calculator on pharmacheme dot in.",
             [["t", 20, 356, "warm up slowly, drains open", 17, "b"], ["t", 20, 386, "pharmacheme.in → steam heating", 16, "b"]]],
        ],
        "summary": "When steam enters a cold main, condensate forms and collects at low points. Fast steam picks it up into slugs that strike bends with great force: water hammer. Fit drip legs with traps at every low point and every 30 to 50 m on long runs, and warm mains up slowly with the drains open.",
    },
]

if __name__ == '__main__':
    main(globals())
