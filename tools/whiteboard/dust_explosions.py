"""Whiteboard lesson: dust explosions. Run: python3 tools/whiteboard/dust_explosions.py [--no-audio]
Drawing items and voice setup: see wblib.py."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from wblib import box, main

SLUG = 'dust-explosions'
TITLE = 'Dust explosions'
CALC = '/articles/dust-explosions/'
CALC_LABEL = 'Read the dust explosions guide'
ENDS = ["Powders behave when you're around.", 'Not bad. Bubbles is watching.', 'Bubbles wins this round.']
INTRO = "Hi, I'm Bubbles. Today: dust explosions. Ordinary powders, extraordinary bangs. Six questions. Ready?"
OUTRO_WEB = "That's the lesson. Read the dust explosions guide next."
SPOKEN = (('Kst', 'K S T'), ('bar·m/s', 'bar metres per second'), ('St 1', 'S T 1'), ('St 2', 'S T 2'), ('St 3', 'S T 3'), ('MIE', 'M I E'))

STEPS = [
    {
        "q": "A fire needs fuel, oxygen and ignition. What two more does a dust explosion need?",
        "opts": [
            ["Heat and pressure", False, "Those are results, not ingredients."],
            ["Cloud and confinement", True, "Yes! Dust in the air, inside something. The pentagon."],
            ["Water and wind", False, "Water usually helps you. Wind just spreads things."],
            ["Nitrogen and static", False, "Nitrogen prevents it. Static is one ignition source."],
        ],
        "title": "The pentagon",
        "beats": [
            ["Start with the fire triangle: fuel, oxygen, ignition.",
             [["t", 30, 90, "fuel", 18, "o"], ["t", 140, 90, "oxygen", 18, "b"], ["t", 260, 90, "ignition", 18, "r"]]],
            ["Add dispersion: the dust must be in the air as a cloud, not lying in a heap.",
             [["t", 30, 150, "+ dispersion (a cloud)", 19, "k"]]],
            ["And confinement: a silo, a dryer, a duct or a room lets the pressure build. That's what turns a flash fire into an explosion.",
             [["t", 30, 190, "+ confinement (pressure builds)", 19, "k"]]],
            ["Take away any one, and there's no explosion, though an open cloud can still flash and burn people. Protection works on the cloud, ignition, oxygen through nitrogen inerting, or confinement through venting.",
             [["p", "M180,240 L250,290 L222,370 L138,370 L110,290 Z", "r", 3], ["t", 150, 316, "5 sides", 16, "r"]]],
        ],
        "summary": "A dust explosion needs the fire triangle (fuel, oxygen, ignition) plus dispersion, meaning the dust is suspended as a cloud, and confinement, which lets pressure build. Remove any one of the five and there is no explosion, though an unconfined cloud can still flash and burn people; protection targets the dust cloud, ignition sources, oxygen (by nitrogen inerting) or confinement (by venting).",
    },
    {
        "q": "A powder has a Kst of 250 bar·m/s. Which dust class is it?",
        "opts": [
            ["St 1", False, "St 1 stops at 200. Yours is past that."],
            ["St 2", True, "St 2. Correct! Strong, and needs proper protection."],
            ["St 3", False, "St 3 starts above 300."],
            ["Not explosible", False, "Any Kst above zero means it can explode."],
        ],
        "title": "Kst classes",
        "beats": [
            ["Kst measures how violently a dust explodes: how fast the pressure rises in a test vessel.",
             [["t", 20, 86, "Kst = how violent", 20, "b"]]],
            ["Up to 200 is St 1, 200 to 300 is St 2, above 300 is St 3.",
             [["p", "M30,150 L330,150", "k", 2.5], ["p", "M30,150 L150,150", "g", 8], ["p", "M150,150 L240,150", "o", 8], ["p", "M240,150 L330,150", "r", 8],
              ["t", 60, 178, "St 1", 16, "g"], ["t", 175, 178, "St 2", 16, "o"], ["t", 265, 178, "St 3", 16, "r"],
              ["t", 140, 136, "200", 14, "k"], ["t", 228, 136, "300", 14, "k"]]],
            ["250 is St 2. Many drug powders and organic intermediates are St 1 or St 2.",
             [["c", 195, 150, 7, "k", 3], ["t", 20, 226, "250 → St 2", 21, "r"]]],
            ["Vent panels and suppression are sized on Kst. Test your own powder; don't borrow a number from a similar one.",
             [["t", 20, 270, "vents sized on Kst", 18, "k"], ["t", 20, 296, "test your own powder", 18, "g"]]],
        ],
        "summary": "Kst describes how violently a dust explodes, from the rate of pressure rise in a standard test. Dusts with Kst up to 200 bar·m/s are class St 1, 200 to 300 St 2 and above 300 St 3, so 250 is St 2. Explosion vents and suppression are sized on Kst, so test the actual powder rather than borrowing a value.",
    },
    {
        "q": "Why is a thin dust layer on beams and ledges so dangerous?",
        "opts": [
            ["It looks untidy", False, "Untidy, yes. But that's not why it's dangerous."],
            ["It feeds a second blast", True, "Yes! The secondary explosion is usually the killer."],
            ["It corrodes the steel", False, "It might, slowly. The real danger is much faster."],
            ["It hides cracks", False, "It might, but there's a far bigger risk."],
        ],
        "title": "Secondary explosions",
        "beats": [
            ["A small primary explosion in a machine sends a pressure wave into the room.",
             [*box(40, 240, 90, 60, "dryer", "k", 16), ["t", 60, 230, "small bang", 15, "r"]]],
            ["The wave shakes dust off beams and ledges into a big cloud.",
             [["p", "M20,100 L340,100", "k", 4], ["p", "M20,96 L340,96", "o", 2], ["c", 100, 130, 5, "o", 1.5], ["c", 160, 150, 6, "o", 1.5], ["c", 230, 135, 5, "o", 1.5],
              ["t", 180, 90, "dust on beams", 15, "o"]]],
            ["Then the flame from the first blast ignites that cloud. The second explosion fills the whole building.",
             [["t", 160, 220, "→ much bigger", 18, "r"], ["t", 160, 244, "second explosion", 18, "r"]]],
            ["A layer about as thick as a paperclip, around a millimetre, over a large area is enough. Clean it before it builds up.",
             [["t", 20, 340, "~1 mm over a big area: clean it", 18, "g"]]],
        ],
        "summary": "A small primary explosion in equipment sends a pressure wave into the room that lifts dust from beams and ledges into a large cloud, which the flame then ignites. This secondary explosion is usually far larger and causes most of the harm. A layer around a millimetre thick over a large area is enough, so clean dust before it builds up.",
    },
    {
        "q": "A dust collector stands outdoors. What is the most common explosion protection for it?",
        "opts": [
            ["Vent panels", True, "Yes! Let the pressure out where no one stands."],
            ["Earthing the filter bags", False, "Earthing removes one ignition source. It won't stop an explosion that starts anyway."],
            ["A water sprinkler inside", False, "Sprinklers fight fires, but they're far too slow for an explosion."],
            ["A bigger fan", False, "A bigger fan moves more dust, not less risk."],
        ],
        "title": "Vent, suppress, isolate",
        "beats": [
            ["Vent panels burst at a low pressure and let the explosion out before the housing fails.",
             [*box(80, 120, 120, 160, "collector", "k", 16), ["p", "M200,150 L230,140", "r", 3], ["a", 210, 150, 290, 120, "r"], ["t", 236, 110, "vent", 16, "r"]]],
            ["The fireball has to go somewhere safe: away from people, walkways and other buildings.",
             [["t", 20, 320, "vent to a safe area", 18, "r"]]],
            ["Indoors, use suppression or a flameless vent instead. And fit isolation valves so the flame can't run back down the ducts.",
             [["t", 20, 350, "indoors: suppression / flameless", 16, "b"], ["t", 20, 374, "isolate ducts", 16, "b"]]],
            ["Keep the area in front of the vent clear, and check panels for damage regularly.",
             [["t", 220, 200, "keep clear", 15, "g"]]],
        ],
        "summary": "Explosion vent panels burst at a low pressure and release the explosion before the collector housing fails; the fireball must discharge to a safe area away from people and buildings. Indoors, suppression systems or flameless vents are used, and isolation valves stop flame travelling back through ducts. Keep the area in front of vents clear and inspect panels regularly.",
    },
    {
        "q": "The same powder is milled finer. What happens to its explosion risk?",
        "opts": [
            ["It goes down", False, "Finer dust burns faster, not slower."],
            ["It goes up", True, "Up. More surface, easier ignition, more violent."],
            ["No change", False, "Particle size changes almost everything about it."],
            ["It stops being combustible", False, "Milling never makes a powder non-combustible."],
        ],
        "title": "Finer is worse",
        "beats": [
            ["Finer particles have far more surface area for the same mass.",
             [["c", 70, 130, 30, "o", 3], ["a", 110, 130, 160, 130, "k"], ["c", 180, 116, 8, "o", 2], ["c", 200, 132, 8, "o", 2], ["c", 220, 116, 8, "o", 2],
              ["c", 190, 148, 8, "o", 2], ["c", 214, 150, 8, "o", 2], ["t", 240, 136, "more surface", 15, "o"]]],
            ["So they ignite more easily: lower minimum ignition energy.",
             [["t", 20, 210, "lower MIE: easier to ignite", 18, "r"]]],
            ["And they burn faster: higher Kst, a more violent explosion.",
             [["t", 20, 240, "higher Kst: more violent", 18, "r"]]],
            ["Test the powder as it really is after milling, including the fines collected in filters.",
             [["t", 20, 286, "test the milled powder + fines", 18, "g"]]],
        ],
        "summary": "Milling a powder finer gives far more surface area for the same mass, so it ignites more easily (lower minimum ignition energy) and burns faster (higher Kst), making explosions more likely and more violent. Test the powder as it is after milling, including fines collected in filters.",
    },
    {
        "q": "What is the right way to clean powder dust off machines and ledges?",
        "opts": [
            ["Blow it off with compressed air", False, "Air blowing makes exactly the dust cloud we're trying to avoid."],
            ["An approved industrial vacuum", True, "Yes! Suck it up, don't blow it around."],
            ["Sweep hard with a dry brush", False, "Hard sweeping throws dust into the air."],
            ["Wipe it with a dry cloth", False, "Dry wiping spreads fine dust into the air. Vacuum or wet-wipe."],
        ],
        "title": "Housekeeping",
        "beats": [
            ["Blowing with compressed air lifts the dust into a cloud. Now only a spark is missing.",
             [["a", 40, 140, 120, 140, "b"], ["t", 40, 124, "air hose", 15, "b"], ["c", 160, 130, 6, "o", 1.5], ["c", 190, 110, 7, "o", 1.5], ["c", 220, 140, 6, "o", 1.5],
              ["t", 150, 180, "dust cloud!", 17, "r"]]],
            ["Use an industrial vacuum approved for combustible dust: earthed, with no sparking parts.",
             [["t", 20, 230, "vacuum rated for combustible dust", 17, "g"]]],
            ["Gentle wet wiping works where the vacuum can't reach.",
             [["t", 20, 262, "or gentle wet wiping", 17, "g"]]],
            ["Best of all, stop the leaks at the source: seals, covers and good dust extraction. More in the dust explosions guide on pharmacheme dot in.",
             [["t", 20, 300, "stop leaks at source", 18, "k"], ["t", 20, 380, "pharmacheme.in → dust explosions", 16, "b"]]],
        ],
        "summary": "Blowing dust off with compressed air creates the dust cloud an explosion needs. Use an industrial vacuum approved for combustible dust (earthed, with no sparking parts), or gentle wet wiping where it cannot reach, and stop leaks at the source with good seals, covers and dust extraction.",
    },
]

if __name__ == '__main__':
    main(globals())
