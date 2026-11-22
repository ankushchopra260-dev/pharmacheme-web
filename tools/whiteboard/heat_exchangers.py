"""Whiteboard lesson: heat exchangers. Run: python3 tools/whiteboard/heat_exchangers.py [--no-audio]
Drawing items and voice setup: see wblib.py."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from wblib import axes, hx, main

SLUG = 'heat-exchangers'
TITLE = 'Heat exchangers'
CALC = '/calculators/lmtd-calculator/'
CALC_LABEL = 'Open the LMTD calculator'
ENDS = ['Exchangers fear you now.', 'Not bad. Bubbles is watching.', 'Bubbles wins this round.']
INTRO = "Hi, I'm Bubbles. Today it's heat exchangers: the boxes everyone ignores until the batch won't cool. Six questions. Ready?"
OUTRO_WEB = "That's the lesson. Now try your own exchanger in the LMTD calculator."
SPOKEN = (('U A', 'U times A'), ('Q =', 'Q equals'), ('m/s', 'metres per second'), ('1-2', 'one two'))

STEPS = [
    {
        "q": "Same duty and temperatures. Why does counter-current need less area than co-current?",
        "opts": [
            ["The fluids move faster", False, "Faster? Nobody touched the pumps. Same flows, same speed."],
            ["Its average temperature difference is bigger", True, "Yes! A bigger driving force all the way along."],
            ["Counter-current tubes are thinner", False, "Same tubes, same metal. The exchanger doesn't know which way you piped it."],
            ["It has less fouling", False, "Same fluids, same fouling. That's not where the area goes."],
        ],
        "title": "Which way round?",
        "beats": [
            ["Hot liquid goes from 100 to 60 degrees. Cooling water goes from 30 to 50.",
             [["t", 20, 76, "hot   100 → 60 °C", 18, "r"], ["t", 20, 102, "water  30 → 50 °C", 18, "b"]]],
            ["Co-current: both enter at the same end. The gap starts at 70 and closes to just 10 at the outlet.",
             [*axes(30, 122, 170, 232, "length", "°C"), ["p", "M34,132 Q80,170 166,182", "r", 3], ["p", "M34,220 Q80,200 166,195", "b", 3],
              ["t", 40, 268, "co-current", 15, "k"], ["t", 96, 158, "gap 70 → 10", 13, "k"]]],
            ["Counter-current: they enter at opposite ends. The gap stays between 50 and 30 the whole way.",
             [*axes(196, 122, 340, 232, "length", "°C"), ["p", "M200,132 L336,182", "r", 3], ["p", "M200,195 L336,220", "b", 3],
              ["t", 204, 268, "counter-current", 15, "k"], ["t", 250, 146, "gap 50 → 30", 13, "k"]]],
            ["Average them the log-mean way: about 31 degrees for co-current, 39 for counter-current.",
             [["t", 20, 290, "LMTD  co 31 °C", 18, "k"], ["t", 196, 290, "counter 39 °C", 18, "g"]]],
            ["Q equals U A times LMTD. Bigger LMTD, smaller area. Co-current needs about 27 percent more area here.",
             [["t", 20, 330, "Q = U A × LMTD", 22, "b"], ["t", 20, 364, "co-current: ~27 % more area", 17, "r"], ["k", 300, 334, "g"]]],
        ],
        "summary": "Counter-current flow keeps a bigger temperature difference along the whole exchanger. Cooling a liquid from 100 to 60 °C with water going from 30 to 50 °C, the log-mean temperature difference (LMTD) is about 31 °C co-current and 39 °C counter-current. Since Q = U × A × LMTD, the co-current exchanger needs about 27 % more area.",
    },
    {
        "q": "Same exchanger, same flows. Over a few months the product leaves hotter. What changed?",
        "opts": [
            ["The tubes got thinner", False, "Thinner tubes would transfer more heat, not less. Wrong direction."],
            ["Fouling on the tube walls", True, "Fouling! The silent area thief."],
            ["The cooling water got colder", False, "Colder water would cool it better. You'd want that problem."],
            ["The product got heavier", False, "Heavier? It's still the same product, my friend."],
        ],
        "title": "The fouling blanket",
        "beats": [
            ["Heat has to cross a stack of resistances, one after another.",
             [["p", "M150,60 L150,250 M200,60 L200,250", "k", 4], ["t", 150, 268, "tube wall", 13, "k"],
              ["t", 20, 110, "hot film", 16, "r"], ["t", 266, 110, "cold film", 16, "b"], ["a", 40, 150, 320, 150, "o"]]],
            ["The two liquid films, the metal wall, and the fouling layers on each side.",
             [["p", "M140,64 L140,246", "o", 7], ["p", "M210,64 L210,246", "o", 7], ["t", 70, 200, "scale", 15, "o"], ["t", 222, 200, "scale", 15, "o"]]],
            ["They add up like this. One over U is the sum of all of them.",
             [["t", 20, 290, "1/U = 1/h hot + wall + fouling", 17, "k"], ["t", 92, 314, "+ 1/h cold", 17, "k"]]],
            ["A thin scale layer can take a quarter off U. The area and flows haven't changed, but less heat gets across, so the product leaves hotter.",
             [["t", 20, 350, "thin scale → U down ~25 %", 18, "r"], ["t", 20, 380, "→ product leaves hotter", 18, "r"]]],
        ],
        "summary": "Heat crosses the hot film, any fouling, the tube wall, more fouling and the cold film in series, so 1/U is the sum of these resistances. A thin layer of scale or deposit can cut the overall coefficient U by a quarter or more. With the same area and flows, less heat moves and the product leaves hotter.",
    },
    {
        "q": "Cooling water flow through the tubes is cut to half. What happens to the water-side film coefficient?",
        "opts": [
            ["It stays the same", False, "Stays the same? The water is crawling now. Of course it changes."],
            ["It halves exactly", False, "Close, but heat transfer isn't that linear. It's a bit kinder than half."],
            ["It falls by about 40 %", True, "Exactly. About 40 % down. You know your Dittus–Boelter."],
            ["It goes up", False, "Up?! Slower water, thicker film. Down it goes."],
        ],
        "title": "Velocity matters",
        "beats": [
            ["In turbulent flow, the film coefficient goes with velocity to the power 0.8.",
             [["t", 20, 80, "h ∝ velocity^0.8", 24, "b"]]],
            ["Half the flow, half the velocity. Point five to the power 0.8 is about 0.57. So h falls by about 40 percent.",
             [["t", 20, 122, "0.5^0.8 = 0.57", 20, "k"], ["t", 20, 150, "→ h falls ~40 %", 20, "r"]]],
            ["Slow water also fouls faster. Silt settles and scale grows, so keep the tube velocity above about 1 metre per second.",
             [["p", "M20,206 L340,206 M20,250 L340,250", "k", 3], ["c", 90, 244, 4, "o", 2], ["c", 140, 245, 3, "o", 2], ["c", 200, 244, 4, "o", 2],
              ["c", 260, 245, 3, "o", 2], ["a", 40, 228, 110, 228, "b"], ["t", 20, 276, "keep tube velocity > ~1 m/s", 17, "b"]]],
            ["And the hotter the water leaves, the faster it scales. Many plants keep the cooling water outlet under about 45 degrees.",
             [["t", 20, 320, "hot water outlet → more scale", 17, "o"], ["t", 20, 348, "keep CW outlet < ~45 °C", 17, "g"]]],
        ],
        "summary": "In turbulent flow the film coefficient varies roughly with velocity to the power 0.8, so halving the water flow cuts it to about 0.57 of its value, a fall of about 40 %. Slow water also fouls faster, so tube velocity is usually kept above about 1 m/s, and many plants keep cooling water outlet temperature below about 45 °C to limit scaling.",
    },
    {
        "q": "One fluid is dirty, corrosive and at high pressure. Which side should it go?",
        "opts": [
            ["Shell side", False, "Shell side? Enjoy cleaning that bundle with a toothbrush."],
            ["Tube side", True, "Tube side, yes! You've clearly cleaned an exchanger before."],
            ["Either side, it doesn't matter", False, "It matters a lot. Ask anyone who has rodded tubes on a Sunday."],
            ["Split it between both", False, "Both sides? Now you have two problems instead of one."],
        ],
        "title": "Tubes or shell?",
        "beats": [
            ["Inside the tubes is the easy side to clean. Open the channel cover and rod or jet each straight tube through. U-tubes are harder.",
             [*hx(60, 70, 230, 90, 3), ["a", 30, 115, 80, 115, "o"], ["t", 20, 186, "tubes: rod or jet them", 16, "g"]]],
            ["Corrosive fluid in the tubes means only the tubes and channels need the costly alloy, not the big shell.",
             [["t", 20, 222, "corrosive → only tubes in alloy", 16, "g"]]],
            ["Small-diameter tubes hold high pressure with thin walls. A big shell would need thick, expensive plate.",
             [["t", 20, 256, "high pressure → small tubes, thin wall", 16, "g"]]],
            ["The shell side suits clean fluids, and steam or vapours that condense.",
             [["p", "M20,282 L340,282", "k", 1.5], ["t", 20, 312, "shell: clean fluid, steam,", 17, "b"], ["t", 20, 338, "condensing vapour", 17, "b"]]],
        ],
        "summary": "Put the dirty, corrosive or high-pressure fluid on the tube side. Tubes can be rodded or jetted clean, only the tubes and channels need to be made of an expensive alloy, and small-diameter tubes hold high pressure with thin walls. The shell side suits clean fluids, steam and condensing vapours.",
    },
    {
        "q": "A steam heater's control valve is wide open, but the outlet is cold and the shell bangs. What's wrong?",
        "opts": [
            ["Too much steam", False, "Too much steam would make it too hot. You have the opposite problem."],
            ["Condensate is not draining", True, "Yes! It's flooded with condensate."],
            ["The tubes are too clean", False, "Too clean?! If only every exchanger had that problem."],
            ["The product is too cold to heat", False, "Cold product is the whole reason you have a heater."],
        ],
        "title": "Waterlogged",
        "beats": [
            ["Steam gives its heat by condensing. The condensate must drain away through a trap.",
             [*hx(60, 70, 230, 90, 3), ["t", 70, 56, "steam in", 15, "r"], ["a", 150, 40, 150, 70, "r"],
              ["p", "M240,160 L240,190", "k", 3], ["c", 240, 200, 10, "k", 2.5], ["t", 258, 206, "trap", 15, "k"]]],
            ["If the trap fails, or the steam pressure drops below the condensate back pressure, water backs up in the shell.",
             [["p", "M52,140 Q175,134 298,140 L298,160 L52,160 Z", "b", 2], ["t", 70, 152, "condensate", 13, "b"],
              ["x", 240, 200, 9, "r"], ["t", 20, 236, "trap failed, or P steam < back P", 16, "r"]]],
            ["Flooded tubes lose their area. And steam meeting cold water collapses with a bang. That's water hammer.",
             [["t", 20, 272, "flooded area → cold outlet", 17, "r"], ["t", 20, 300, "steam + cold water → BANG", 17, "o"]]],
            ["Isolate and depressurise before you open the trap. Check the trap, the steam pressure and the condensate line. If the pressure can fall too low, fit a pump trap.",
             [["k", 20, 330, "g"], ["t", 42, 338, "trap working?", 16, "k"], ["k", 180, 330, "g"], ["t", 202, 338, "steam P?", 16, "k"],
              ["k", 20, 362, "g"], ["t", 42, 370, "condensate line clear? pump trap?", 16, "k"]]],
        ],
        "summary": "Steam heats by condensing, and the condensate must drain through a trap. If the trap fails, or the steam pressure in the shell falls below the condensate back pressure (low supply pressure, or a throttled valve at low load), condensate floods the shell. The controller then opens the valve wide, but it can't help. Flooded tubes lose area, so the outlet stays cold, and steam meeting cold condensate causes water hammer. Check the trap, steam pressure and condensate line; a pump trap helps when steam pressure can fall too low.",
    },
    {
        "q": "Vertical cooler, water in the tubes: should the water enter at the bottom or the top?",
        "opts": [
            ["At the top, so gravity helps", False, "Gravity helps it fall straight through and leave air pockets at the top. Sneaky."],
            ["At the bottom, out at the top", True, "Bottom in, top out. Correct!"],
            ["It makes no difference", False, "It makes a big difference. Air loves a dry tube."],
            ["Alternate every shift", False, "Alternate every shift? The operators will love you."],
        ],
        "title": "Bottom in, top out",
        "beats": [
            ["Water fed in at the top can run down the walls and leave the top of the tubes half full of air.",
             [["p", "M60,60 L60,250 L130,250 L130,60 Z", "k", 3], ["p", "M62,120 L128,120", "b", 2], ["t", 68, 98, "air", 16, "o"],
              ["a", 96, 40, 96, 62, "b"], ["t", 20, 282, "top in: air trapped", 15, "r"], ["x", 110, 92, 9, "r"]]],
            ["Fed from the bottom, the water fills every tube and pushes the air out at the top.",
             [["p", "M220,60 L220,250 L290,250 L290,60 Z", "k", 3], ["p", "M222,66 L288,66", "b", 2], ["a", 256, 274, 256, 252, "b"],
              ["a", 256, 60, 256, 36, "b"], ["t", 196, 282, "bottom in: tubes full", 15, "g"], ["k", 246, 160, "g"]]],
            ["Put a vent at the top, and open it after every start-up.",
             [["p", "M290,76 L314,76 L314,96", "k", 2.5], ["v", 314, 106], ["t", 196, 318, "vent at the top", 16, "b"]]],
            ["Then check the numbers in the LMTD calculator on pharmacheme dot in.",
             [["t", 30, 370, "pharmacheme.in → LMTD calculator", 17, "b"]]],
        ],
        "summary": "Feed cooling water in at the bottom and take it out at the top. Water fed from the top can run down the tube walls and leave the upper part of the tubes full of air, wasting area. Fed from the bottom, the water fills every tube and pushes air out; a vent at the highest point, opened after start-up, removes the rest.",
    },
]

if __name__ == '__main__':
    main(globals())
