"""Whiteboard lesson: NPSH and cavitation. Run: python3 tools/whiteboard/npsh_cavitation.py [--no-audio]
Drawing items and voice setup: see wblib.py."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from wblib import ask, main  # noqa: F401

SLUG = 'npsh-cavitation'
TITLE = 'NPSH and cavitation'
CALC = '/calculators/npsh-calculator/'
CALC_LABEL = 'Open the NPSH calculator'
ENDS = ['Pumps fear you now.', 'Not bad. Bubbles is watching.', 'Bubbles wins this round.']

STEPS = [
    {
        "q": "Where does cavitation start in a centrifugal pump?",
        "opts": [
            ["At the discharge nozzle", False, "The discharge?! That's the highest pressure in the whole pump. Bubbles would never survive there."],
            ["At the impeller eye", True, "Look at you! Yes, the impeller eye."],
            ["At the mechanical seal", False, "Seals leak and complain, sure. They don't make bubbles."],
            ["In the delivery tank", False, "The delivery tank? The liquid has already left the building."],
        ],
        "title": "Pressure walk",
        "beats": [
            ["Follow the pressure from the tank into the pump.",
             [["tank", 20, 70, 70, 80, 92], ["p", "M90,140 L190,140", "k", 4], ["pump", 214, 140, 24],
              ["p", "M214,116 L214,76 L300,76", "k", 4], ["t", 26, 168, "tank", 15, "b"], ["t", 250, 128, "pump", 15, "k"]]],
            ["In the suction pipe, friction eats a little of it.",
             [["p", "M30,200 L30,350 L335,350", "k", 2], ["t", 36, 196, "pressure", 14, "k"], ["t", 280, 370, "path", 14, "k"],
              ["p", "M40,282 L185,294", "b", 3], ["t", 50, 276, "pipe friction", 14, "b"]]],
            ["Then it squeezes into the impeller eye and speeds up. Faster liquid, lower pressure. This is the lowest point, at the inlet edges of the vanes.",
             [["p", "M185,294 Q205,318 218,322", "r", 3], ["c", 218, 322, 9, "r", 2], ["t", 106, 336, "EYE = lowest P", 16, "r"],
              ["a", 262, 178, 224, 146, "r"], ["t", 262, 192, "eye", 15, "r"]]],
            ["The impeller then flings it out and the pressure climbs, well above where it started. The discharge is the high pressure end.",
             [["p", "M218,322 Q245,250 330,214", "g", 3], ["t", 232, 214, "discharge", 15, "g"], ["t", 232, 232, "= high P", 15, "g"]]],
            ["Like a crowd at a metro gate: the squeeze happens right at the gate, not on the platform.",
             [["p", "M60,392 L60,366 M74,392 L74,366", "k", 3], ["c", 30, 380, 3, "k", 2], ["c", 42, 372, 3, "k", 2], ["c", 44, 386, 3, "k", 2],
              ["c", 52, 379, 3, "k", 2], ["t", 92, 386, "metro gate = impeller eye", 16, "o"]]],
        ],
        "summary": "Cavitation starts at the impeller eye, the lowest-pressure point in the pump. Pressure falls along the suction pipe, dips further where the liquid speeds up into the eye, and rises again as the impeller throws it out to the discharge.",
    },
    {
        "q": "Bubbles form when the pressure at the eye falls below...",
        "opts": [
            ["Atmospheric pressure", False, "If it were atmospheric, every pump on a vacuum receiver would fizz all day."],
            ["The vapour pressure of the liquid", True, "Exactly. The vapour pressure. You're on fire. Not literally, please."],
            ["Zero gauge pressure", False, "Zero gauge is just atmospheric pressure in a disguise."],
            ["The pump's NPSHr", False, "NPSHr is what the pump demands. Liquids don't boil at it. Nice try, though."],
        ],
        "title": "Why bubbles?",
        "beats": [
            ["Every liquid has a vapour pressure. Drop the pressure below it, and the liquid boils, even when it's cold.",
             [["t", 20, 80, "P < P vapour", 24, "r"], ["t", 20, 110, "→ liquid boils, even cold!", 17, "k"],
              ["c", 300, 82, 7, "b", 2], ["c", 318, 100, 5, "b", 2], ["c", 296, 108, 4, "b", 2]]],
            ["On Everest, water boils at about seventy degrees, because the air pressure is so low.",
             [["p", "M30,262 L105,162 L180,262", "k", 3], ["p", "M85,188 L105,162 L125,188", "k", 2], ["t", 112, 160, "70 °C", 16, "r"],
              ["p", "M10,264 L195,264", "b", 2], ["t", 20, 284, "sea level: 100 °C", 15, "b"]]],
            ["Your impeller eye is a tiny Everest. Drop the pressure there below the vapour pressure, and the liquid boils at room temperature.",
             [["pump", 282, 192, 32], ["c", 274, 186, 4, "b", 2], ["c", 290, 196, 3, "b", 2], ["c", 280, 202, 3, "b", 2],
              ["t", 214, 246, "eye = tiny Everest", 15, "r"]]],
            ["Hot liquids and volatile solvents have a high vapour pressure, so they boil there first.",
             [["t", 214, 272, "vapour pressure", 15, "k"], ["p", "M40,368 L330,368", "k", 2],
              ["p", "M60,368 L60,362 L110,362 L110,368", "b", 3], ["p", "M150,368 L150,346 L200,346 L200,368", "o", 3],
              ["p", "M240,368 L240,284 L290,284 L290,368", "r", 3],
              ["t", 46, 386, "water 30 °C", 13, "b"], ["t", 132, 386, "methanol 30 °C", 13, "o"], ["t", 230, 386, "water 95 °C", 13, "r"]]],
        ],
        "summary": "A liquid boils when the pressure on it falls below its vapour pressure, whatever its temperature. Water boils at about 70 °C on Everest; at the impeller eye the pressure can fall low enough for liquid to boil at room temperature. Hot liquids and volatile solvents, with higher vapour pressures, cavitate first.",
    },
    {
        "q": "What happens to the bubbles when they reach the high-pressure part of the impeller?",
        "opts": [
            ["They escape through a vent", False, "A vent? There's no tiny exit door inside an impeller."],
            ["They collapse violently", True, "Yes! They collapse, and the metal pays for it."],
            ["They dissolve quietly", False, "Quietly?! Ever heard a cavitating pump? It sounds like it's pumping gravel."],
            ["They leave as gas at the discharge", False, "They never reach the discharge. They pop on the vanes first."],
        ],
        "title": "Bubble → POP",
        "beats": [
            ["The bubbles are swept outward into higher pressure, and they collapse in an instant.",
             [["c", 60, 96, 22, "b", 3], ["c", 128, 96, 12, "b", 3], ["c", 172, 96, 5, "b", 3], ["t", 196, 106, "POP!", 28, "r"],
              ["a", 40, 140, 250, 140, "k"], ["t", 70, 162, "into higher pressure", 15, "k"]]],
            ["Each collapse fires a tiny jet of liquid at the metal. Thousands of them, every second.",
             [["p", "M30,310 Q160,196 335,214", "k", 5], ["a", 112, 206, 128, 252, "b"], ["a", 176, 196, 188, 236, "b"],
              ["a", 240, 192, 248, 230, "b"], ["t", 30, 198, "micro-jets", 16, "b"]]],
            ["That chips the vane. Like a tiny hammer, hitting it over and over.",
             [["c", 128, 254, 3, "r", 2], ["c", 188, 238, 3, "r", 2], ["c", 248, 232, 3, "r", 2], ["c", 158, 246, 2, "r", 2],
              ["p", "M282,312 L306,272", "o", 4], ["p", "M292,262 L318,280", "o", 9], ["t", 196, 326, "tiny hammer", 16, "r"]]],
            ["The signs: a gravel-like noise, vibration, falling head, and a pitted impeller at overhaul.",
             [["k", 30, 344, "g"], ["t", 50, 350, "gravel noise", 15, "k"], ["k", 186, 344, "g"], ["t", 206, 350, "vibration", 15, "k"],
              ["k", 30, 374, "g"], ["t", 50, 380, "head drops", 15, "k"], ["k", 186, 374, "g"], ["t", 206, 380, "pitted vanes", 15, "k"]]],
        ],
        "summary": "Vapour bubbles formed at the eye are carried into higher pressure and collapse. Each collapse fires a micro-jet of liquid at the vane, thousands of times a second, pitting the metal. Signs: a gravel-like noise, vibration, falling head and pitted vanes at overhaul.",
    },
    {
        "q": "Which change gives the pump more NPSH available?",
        "opts": [
            ["A longer suction line", False, "Every extra metre of suction pipe is a withdrawal from the account."],
            ["A hotter liquid", False, "Hot liquid? The bubbles just sent you a thank-you card."],
            ["A higher liquid level in the tank", True, "Correct! More liquid above the pump, more NPSH."],
            ["A partly clogged strainer", False, "A clogged strainer is a toll booth on the suction line."],
        ],
        "title": "NPSH = savings account",
        "beats": [
            ["Think of NPSH available as a savings account the liquid carries into the pump.",
             [["c", 70, 106, 36, "o", 3], ["c", 106, 104, 8, "o", 2], ["p", "M58,72 L80,72", "k", 3],
              ["p", "M52,140 L52,152 M88,140 L88,152", "o", 3], ["t", 128, 98, "NPSH available", 20, "o"], ["t", 128, 122, "what the liquid brings", 14, "k"]]],
            ["Deposits: the absolute pressure on the liquid surface, and the liquid height above the pump.",
             [["t", 30, 186, "+ absolute pressure on surface", 17, "g"], ["t", 30, 212, "+ liquid height above pump", 17, "g"]]],
            ["Withdrawals: the vapour pressure, and the friction in the suction line.",
             [["t", 30, 252, "− vapour pressure", 17, "r"], ["t", 30, 278, "− suction friction", 17, "r"]]],
            ["If the balance beats the pump's NPSHr plus a margin, it runs without losing head or eating its impeller.",
             [["p", "M30,292 L320,292", "k", 2], ["t", 30, 322, "balance > NPSHr + margin", 19, "b"], ["k", 296, 312, "g"]]],
            ["So: raise the level, keep the liquid cool, and keep the suction short, wide and clean.",
             [["t", 30, 360, "raise level · keep it cool ·", 15, "k"], ["t", 30, 384, "short, wide, clean suction", 15, "k"]]],
        ],
        "summary": "NPSH available works like a savings account. Deposits: the absolute pressure on the liquid surface and the liquid height above the pump. Withdrawals: the vapour pressure and suction friction. The balance must beat the pump's NPSHr (the point where head has already dropped 3 %) plus a margin, so raise the level, keep the liquid cool and keep the suction short, wide and clean.",
    },
    {
        "q": "A column bottoms pump handles liquid at its boiling point. What is its NPSH available?",
        "opts": [
            ["Zero", False, "Zero?! Then every reboiler pump in the world would be a gravel crusher."],
            ["Liquid height above the pump, minus friction", True, "Spot on. Height minus friction. That's all you get."],
            ["Same as a cold tank", False, "The liquid is literally boiling. It's nothing like a cold tank."],
            ["The column pressure, in metres", False, "Half right. Then the vapour pressure takes all of it back."],
        ],
        "title": "Boiling liquid",
        "beats": [
            ["At the boiling point, the vessel pressure and the vapour pressure are equal.",
             [["p", "M50,60 L50,240 Q80,262 110,240 L110,60 Q80,40 50,60", "k", 3], ["p", "M55,100 L105,100 M55,130 L105,130 M55,160 L105,160", "k", 1],
              ["p", "M52,206 L108,206", "b", 3], ["t", 128, 88, "P vessel = P vapour", 18, "r"]]],
            ["So the pressure deposit and the vapour pressure withdrawal cancel out.",
             [["p", "M131,92 L190,74", "r", 3], ["p", "M219,92 L252,74", "r", 3], ["t", 128, 122, "they cancel!", 18, "r"]]],
            ["Only the liquid height is left, minus the suction friction.",
             [["p", "M80,250 L80,340 L178,340", "k", 4], ["pump", 200, 340, 22], ["dim", 28, 206, 340, "o"],
              ["t", 128, 180, "NPSHa =", 18, "b"], ["t", 128, 204, "height − friction", 18, "b"]]],
            ["That's why bottoms pumps sit several metres below the column, with short, wide suction lines.",
             [["t", 128, 262, "so the pump sits", 16, "o"], ["t", 128, 284, "metres below", 16, "o"], ["t", 128, 306, "the column", 16, "o"]]],
        ],
        "summary": "For liquid at its boiling point, the vessel pressure equals the vapour pressure, so the two cancel. NPSH available is only the liquid height above the pump minus the suction friction, which is why bottoms pumps sit several metres below the column with short, wide suction lines.",
    },
    {
        "q": "A pump starts crackling and its discharge pressure swings. What do you do first?",
        "opts": [
            ["Increase the pump speed", False, "More speed means the pump needs even more NPSH. That's petrol on a fire."],
            ["Throttle the suction valve", False, "Throttling the suction?! That's squeezing the pump's straw. Never."],
            ["Check strainer, tank level and liquid temperature", True, "Yes! Check the suction side first. You'd make a great shift engineer."],
            ["Open the discharge valve fully", False, "More flow, more friction, hungrier pump. Bubbles approves."],
        ],
        "title": "Pump crackling?",
        "beats": [
            ["Start on the suction side. A dirty strainer, a low level or a hot liquid all drain the account.",
             [["t", 30, 82, "1  strainer clogged?", 18, "k"], ["t", 30, 110, "2  tank level low?", 18, "k"], ["t", 30, 138, "3  liquid hotter than usual?", 18, "k"]]],
            ["Never throttle the suction valve. Control the flow on the discharge side.",
             [["p", "M30,196 L158,196 M202,196 L330,196", "k", 4], ["pump", 180, 196, 20], ["v", 96, 196], ["v", 270, 196],
              ["x", 96, 196, 16, "r"], ["k", 262, 168, "g"], ["t", 30, 232, "never on suction", 15, "r"], ["t", 222, 232, "control here", 15, "g"]]],
            ["If the pump runs far right on its curve, close the discharge a little, back towards its best efficiency point. Less flow, less friction, and a lower NPSHr. Just don't go below its minimum flow.",
             [["p", "M40,360 L40,262 M40,360 L330,360", "k", 2], ["t", 46, 262, "head", 13, "k"], ["t", 296, 378, "flow", 13, "k"],
              ["p", "M40,276 Q200,282 318,344", "b", 3], ["c", 292, 330, 5, "r", 3], ["a", 284, 326, 206, 302, "g"], ["c", 198, 298, 5, "g", 3],
              ["t", 196, 278, "less flow", 14, "g"]]],
            ["Then check the numbers with the NPSH calculator on pharmacheme dot in.",
             [["t", 40, 386, "pharmacheme.in → NPSH calculator", 17, "b"]]],
        ],
        "summary": "Check the suction side first: a clogged strainer, a low tank level or a hotter liquid all reduce NPSH available. Never throttle the suction valve; control flow on the discharge side. If the pump runs far out on its curve, closing the discharge a little, back towards the best efficiency point, cuts flow, friction and NPSHr; do not go below the pump's minimum flow.",
    },
]

INTRO = "Hi, I'm Bubbles. Pumps are my enemy, and I'm theirs. Six questions on NPSH and cavitation. Ready?"
OUTRO_WEB = "That's the lesson. Now try your own pump in the NPSH calculator."


if __name__ == '__main__':
    main(globals())
