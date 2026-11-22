"""Whiteboard lesson: vacuum systems and ejectors. Run: python3 tools/whiteboard/vacuum_ejectors.py [--no-audio]
Drawing items and voice setup: see wblib.py."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from wblib import axes, ejector, main

SLUG = 'vacuum-ejectors'
TITLE = 'Vacuum and ejectors'
CALC = '/articles/vacuum-systems/'
CALC_LABEL = 'Read the vacuum systems guide'
ENDS = ['Leaks hide when they see you coming.', 'Not bad. Bubbles is watching.', 'Bubbles wins this round.']
INTRO = "Hi, I'm Bubbles. Today: vacuum. The pressure you can't see, and the leaks you can't find. Six questions. Ready?"
OUTRO_WEB = "That's the lesson. Read more in the vacuum systems guide."
SPOKEN = (('−740', 'minus 740'), ('m³', 'cubic metres'), ('kg/h', 'kilograms per hour'), ('P abs', 'P absolute'))

STEPS = [
    {
        "q": "At sea level, the vacuum gauge reads −740 mmHg. What is the absolute pressure?",
        "opts": [
            ["740 mmHg absolute", False, "740 absolute is barely a vacuum. That's a breeze, not a pull."],
            ["20 mmHg absolute", True, "20 absolute. Spot on."],
            ["1500 mmHg absolute", False, "1500? You added them. That's twice an atmosphere!"],
            ["−740 mmHg absolute", False, "Negative absolute pressure? Even space can't do that."],
        ],
        "title": "Gauge vs absolute",
        "beats": [
            ["A gauge measures against the air around it. At sea level that's about 760 millimetres of mercury.",
             [["p", "M60,80 L60,330", "k", 3], ["p", "M52,80 L68,80", "k", 3], ["t", 76, 86, "760 mmHg = atmosphere", 16, "b"],
              ["p", "M52,330 L68,330", "k", 3], ["t", 76, 344, "0 = perfect vacuum", 16, "k"]]],
            ["The gauge counts down from the atmosphere. Minus 740 means 740 below it.",
             [["dim", 32, 82, 323, "o"], ["t", 76, 200, "gauge −740", 18, "o"]]],
            ["Absolute is atmosphere minus vacuum. 760 minus 740 leaves 20. That's about 27 millibar.",
             [["p", "M52,323 L68,323", "r", 3], ["t", 76, 312, "20 mmHg abs", 16, "r"], ["t", 170, 260, "760 − 740 = 20", 18, "r"], ["t", 170, 284, "≈ 27 mbar abs", 16, "r"]]],
            ["Up in the hills the air is thinner, so the same gauge reading means a different absolute pressure. Write vacuum in absolute units.",
             [["t", 20, 376, "always write vacuum as absolute", 18, "g"]]],
        ],
        "summary": "A vacuum gauge reads relative to the local atmosphere, about 760 mmHg at sea level. Absolute pressure is atmosphere minus vacuum: 760 − 740 = 20 mmHg absolute, about 27 mbar. At altitude the atmosphere is lower, so the same gauge reading is a different absolute pressure; specify vacuum in absolute units.",
    },
    {
        "q": "Isolated from the system, the pump pulls its normal vacuum on the same gauge. Where is the problem?",
        "opts": [
            ["In the pump", False, "The pump just proved itself. Leave the poor thing alone."],
            ["In the system: a leak or a vapour load", True, "Yes! The pump's fine. The system is the culprit."],
            ["In the gauge", False, "Same gauge read fine on the pump. It's not lying."],
            ["In the power supply", False, "The pump runs fine on its own. The power is fine."],
        ],
        "title": "Split the problem",
        "beats": [
            ["Close the valve between the pump and the system, and watch the gauge on the pump side of the valve.",
             [["p", "M30,80 L130,80 L130,200 L30,200 Z", "k", 3], ["t", 50, 146, "system", 18, "k"], ["p", "M130,140 L196,140 M220,140 L280,140", "k", 3],
              ["v", 208, 140], ["x", 208, 140, 10, "r"], ["c", 300, 140, 20, "k", 3], ["t", 280, 186, "pump", 16, "k"], ["c", 268, 100, 10, "b", 2], ["t", 248, 82, "gauge", 14, "b"]]],
            ["If the pump alone pulls down fine, the pump is healthy. The trouble is upstream.",
             [["k", 296, 210, "g"], ["t", 20, 246, "pump OK → look upstream", 18, "g"]]],
            ["Either air is leaking in, or something is giving off vapour: wet product, solvent in the lines, a warm condenser.",
             [["t", 20, 290, "air leak?", 18, "r"], ["t", 20, 318, "or vapour: wet product, solvent", 16, "o"], ["t", 20, 340, "in lines, warm condenser", 16, "o"]]],
            ["The next question tells you which one.",
             [["t", 20, 384, "→ next: leak or vapour?", 18, "b"]]],
        ],
        "summary": "Isolate the vacuum pump from the system and check the vacuum it reaches on its own. If the pump alone reaches its normal vacuum, it is healthy and the problem is upstream: either air leaking into the system, or a vapour load from wet product, solvent in the lines or a warm condenser.",
    },
    {
        "q": "You isolate the system and watch the pressure rise. How do you tell a leak from vapour?",
        "opts": [
            ["Both look the same", False, "They look quite different, if you plot them. Grab a pen."],
            ["A leak rises in a straight line; vapour levels off", True, "Exactly. Straight line, leak. Flattening curve, vapour."],
            ["A leak levels off; vapour keeps rising", False, "Other way round. Air from outside never runs out."],
            ["Vapour makes the pressure drop", False, "Drop? Vapour coming off adds pressure. It doesn't take it away."],
        ],
        "title": "Rate of rise",
        "beats": [
            ["Pull down, shut the vacuum valve, and log the pressure every minute.",
             [*axes(40, 64, 330, 270, "time", "pressure")]],
            ["Air leaking in keeps coming at the same rate. The pressure climbs in a straight line.",
             [["p", "M44,250 L300,90", "r", 3], ["t", 240, 82, "leak", 17, "r"]]],
            ["Vapour stops coming once the space reaches the liquid's vapour pressure. The curve flattens.",
             [["p", "M44,250 Q120,170 300,166", "b", 3], ["p", "M44,162 L320,162", "b", 1], ["t", 230, 188, "vapour", 17, "b"]]],
            ["For air near room temperature, the leak in kilograms an hour is about 0.07 times the volume in cubic metres times the rise in millibar per minute. Two cubic metres rising 10 millibar in 10 minutes is about 0.14 kilograms an hour.",
             [["t", 20, 312, "air kg/h ≈ 0.07 × V × mbar/min", 17, "k"], ["t", 20, 342, "2 m³, +10 mbar in 10 min", 16, "k"], ["t", 20, 366, "≈ 0.14 kg/h of air", 16, "k"]]],
        ],
        "summary": "Pull the system down, isolate it and log the pressure every minute. Air leaking in arrives at a steady rate, so the pressure rises in a straight line. Vapour from the contents stops once the space reaches the vapour pressure, so the curve flattens. At about 20 °C the air leak in kg/h is about 0.07 × volume (m³) × pressure rise (mbar/min); a 2 m³ system rising 10 mbar in 10 minutes takes in about 0.14 kg/h of air.",
    },
    {
        "q": "The motive steam pressure to an ejector falls below design. What happens?",
        "opts": [
            ["The vacuum improves", False, "Improves with less push? Ejectors don't work on hope."],
            ["The vacuum falls off suddenly", True, "Yes! It breaks. Not gently, either."],
            ["Nothing; ejectors are robust", False, "Robust, yes. Forgiving, no."],
            ["Steam use goes up", False, "Lower pressure, less steam through the nozzle. And worse vacuum."],
        ],
        "title": "Ejector breaks",
        "beats": [
            ["An ejector has no moving parts. Steam shoots through a nozzle and drags the gas from the suction along with it.",
             [*ejector(40, 120, 270), ["t", 20, 104, "steam", 16, "r"], ["a", 89, 196, 89, 166, "b"], ["t", 64, 214, "suction", 16, "b"],
              ["a", 310, 120, 340, 120, "k"], ["t", 260, 160, "discharge", 15, "k"]]],
            ["Then it squeezes the mix up to the discharge pressure. That takes the full design steam pressure.",
             [["t", 150, 186, "compress up", 15, "o"], ["t", 150, 206, "to discharge P", 15, "o"]]],
            ["Drop much below it, and the ejector doesn't just get a bit weaker. It breaks, and the vacuum falls off suddenly.",
             [["t", 20, 260, "steam P below design", 18, "r"], ["t", 20, 286, "→ ejector breaks, vacuum lost", 18, "r"]]],
            ["Keep the motive steam at or slightly above design, and dry. Wet steam erodes the nozzle.",
             [["k", 20, 324, "g"], ["t", 42, 332, "steam P at or above design", 17, "k"], ["k", 20, 356, "g"], ["t", 42, 364, "dry steam: wet erodes nozzle", 17, "k"]]],
        ],
        "summary": "A steam ejector has no moving parts: motive steam through a nozzle entrains gas from the suction and compresses the mixture to the discharge pressure. It needs its full design steam pressure to do that. Below design, an ejector does not weaken gradually; it breaks and the vacuum falls off suddenly. Keep motive steam at or slightly above design pressure, and dry, since wet steam erodes the nozzle.",
    },
    {
        "q": "Summer. The inter-condenser cooling water runs warmer. What happens to a two-stage ejector?",
        "opts": [
            ["Nothing changes", False, "Nothing? Your vacuum log disagrees every June."],
            ["The vacuum improves", False, "Warmer water improving vacuum? Bubbles laughed so hard he popped."],
            ["The second stage gets overloaded", True, "Correct! More vapour slips through to the second stage."],
            ["The steam pressure rises", False, "Cooling water doesn't touch the steam header."],
        ],
        "title": "Summer vacuum",
        "beats": [
            ["Between the stages, a condenser turns the steam and process vapour into liquid. The second stage only handles what's left.",
             [*ejector(20, 90, 130), ["p", "M150,90 L180,90", "k", 3], ["p", "M180,70 L240,70 L240,130 L180,130 Z", "b", 3],
              ["t", 186, 152, "condenser", 14, "b"], ["p", "M240,90 L256,90", "k", 3], *ejector(256, 90, 90),
              ["t", 40, 164, "stage 1", 14, "k"], ["t", 290, 164, "stage 2", 14, "k"]]],
            ["Warmer water condenses less. More vapour goes on to the second stage.",
             [["t", 20, 210, "warmer water → less condensed", 17, "r"], ["t", 20, 236, "→ more load on stage 2", 17, "r"]]],
            ["If that's more than the second stage was sized for, the inter-condenser pressure rises, and the first stage breaks too.",
             [["t", 20, 276, "stage 2 breaks → stage 1 follows", 17, "r"]]],
            ["So when vacuum fails in summer, check the cooling water temperature and flow, and clean the condensers.",
             [["k", 20, 320, "g"], ["t", 42, 328, "CW temperature and flow", 17, "k"], ["k", 20, 350, "g"], ["t", 42, 358, "clean condensers", 17, "k"]]],
        ],
        "summary": "In a two-stage ejector, the inter-condenser condenses steam and vapour from the first stage so the second stage only handles the remainder. Warmer cooling water condenses less, so more vapour passes to the second stage. If that exceeds its design load, the second stage breaks and the first follows. When vacuum fails in summer, check cooling water temperature and flow and clean the condensers.",
    },
    {
        "q": "Stripping solvent under vacuum. Why put a condenser before the vacuum pump?",
        "opts": [
            ["To protect the gauge", False, "The gauge will be fine. Think about the pump."],
            ["So the pump mostly sees air", True, "Yes! Let the condenser do the heavy lifting."],
            ["To make the pump run faster", False, "The pump runs at the same speed. It just has less to do."],
            ["To heat the vapour", False, "Heat it? A condenser does the exact opposite."],
        ],
        "title": "Condense first",
        "beats": [
            ["Vapour at low pressure takes up a huge volume. One kilogram of toluene vapour at 50 millibar and 40 degrees fills about 6 cubic metres.",
             [["p", "M30,70 L150,70 L150,190 L30,190 Z", "o", 3], ["t", 44, 136, "≈ 6 m³", 22, "o"], ["t", 20, 214, "1 kg toluene vapour", 15, "k"],
              ["t", 20, 232, "50 mbar, 40 °C", 15, "k"]]],
            ["Condense it, and it shrinks to just over a litre of liquid.",
             [["a", 170, 130, 230, 130, "b"], ["p", "M250,160 L250,190 L272,190 L272,160", "b", 3], ["p", "M252,176 L270,176", "b", 2],
              ["t", 236, 214, "≈ 1.2 litres", 15, "b"]]],
            ["Then the pump only handles the air and what's left. It can be much smaller, and you get the solvent back.",
             [["t", 20, 276, "pump handles mostly air →", 17, "g"], ["t", 20, 300, "smaller pump, solvent recovered", 17, "g"]]],
            ["At 50 millibar toluene condenses at only about 30 degrees, so use chilled water or brine, and fit a catch pot before the pump. More in the vacuum systems guide on pharmacheme dot in.",
             [["t", 20, 340, "chilled water or brine + catch pot", 17, "b"], ["t", 20, 380, "pharmacheme.in → vacuum systems", 16, "b"]]],
        ],
        "summary": "Vapour at low pressure has a huge volume: 1 kg of toluene vapour at 50 mbar and 40 °C occupies about 6 m³, but condenses to about 1.2 litres of liquid. A condenser before the vacuum pump leaves the pump mostly air to handle, so it can be much smaller and the solvent is recovered. At 50 mbar toluene condenses at only about 30 °C, so use chilled water or brine in the condenser, and fit a catch pot before the pump.",
    },
]

if __name__ == '__main__':
    main(globals())
