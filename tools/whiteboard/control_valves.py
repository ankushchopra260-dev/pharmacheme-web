"""Whiteboard lesson: control valves. Run: python3 tools/whiteboard/control_valves.py [--no-audio]
Drawing items and voice setup: see wblib.py."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from wblib import axes, box, main

SLUG = 'control-valves'
TITLE = 'Control valves'
CALC = '/calculators/control-valve-sizing/'
CALC_LABEL = 'Open the control valve sizing calculator'
ENDS = ['Your loops will thank you.', 'Not bad. Bubbles is watching.', 'Bubbles wins this round.']
INTRO = "Hi, I'm Bubbles. Today: control valves, the hands of every control loop. Six questions. Ready?"
OUTRO_WEB = "That's the lesson. Now size a valve in the control valve sizing calculator."
SPOKEN = (('psi', 'P S I'), ('Kv', 'K v'), ('Cv', 'C v'), ('m³/h', 'cubic metres an hour'), ('ΔP', 'pressure drop'), ('SG', 'S G'), ('√', 'root'))


def cvalve(cx, cy):
    """Control valve: bow-tie body with a diaphragm actuator."""
    return [["v", cx, cy], ["p", f"M{cx},{cy} L{cx},{cy - 26}", "k", 2.5], ["p", f"M{cx - 16},{cy - 26} Q{cx},{cy - 46} {cx + 16},{cy - 26} Z", "k", 2.5]]


STEPS = [
    {
        "q": "A control valve has a Kv of 10. What does that mean?",
        "opts": [
            ["10 m³/h of water at 1 bar drop", True, "Yes! Water flow in cubic metres an hour at 1 bar across it."],
            ["10 bar pressure drop at full flow", False, "Kv is a flow number, not a pressure drop."],
            ["10 % open at normal flow", False, "Opening is separate. Kv is the valve's capacity."],
            ["10 litres a minute of any liquid", False, "Wrong units, and it's defined for water."],
        ],
        "title": "Kv",
        "beats": [
            ["Kv is the flow of water, in cubic metres an hour, through the valve with 1 bar across it.",
             [*cvalve(180, 120), ["p", "M40,120 L168,120 M192,120 L320,120", "k", 3], ["t", 40, 168, "Kv = m³/h of water at 1 bar ΔP", 18, "b"]]],
            ["For other liquids and drops, flow equals Kv times the square root of pressure drop over specific gravity.",
             [["t", 20, 220, "Q = Kv × √(ΔP ÷ SG)", 22, "b"]]],
            ["Cv is the American version, in gallons per minute at 1 psi. Cv is about 1.16 times Kv.",
             [["t", 20, 266, "Cv ≈ 1.16 × Kv", 20, "k"]]],
            ["Catalogues quote the Kv at full open. You pick a valve whose normal flow needs only part of it.",
             [["t", 20, 310, "catalogue Kv = fully open", 18, "o"]]],
        ],
        "summary": "Kv is the flow of water in m³/h through a valve with a 1 bar pressure drop across it. For other conditions, flow Q = Kv × √(ΔP ÷ SG), with Q in m³/h and ΔP in bar. Cv, the US equivalent in gallons per minute at 1 psi, is about 1.16 × Kv. Catalogue Kv values are for the fully open valve.",
    },
    {
        "q": "Same valve opening, but the pressure drop across it rises 4 times. What happens to flow?",
        "opts": [
            ["It rises 4 times", False, "Flow goes with the square root of pressure drop."],
            ["It doubles", True, "Doubles. Square root of 4. Correct!"],
            ["It stays the same", False, "More push, more flow. It changes."],
            ["It halves", False, "More pressure drop pushes more flow, not less."],
        ],
        "title": "Square root",
        "beats": [
            ["At a fixed opening, flow goes with the square root of the pressure drop, until the flow chokes.",
             [["t", 20, 86, "Q ∝ √ΔP", 26, "b"]]],
            ["Four times the pressure drop gives the square root of 4: twice the flow.",
             [["t", 20, 132, "4 × ΔP → √4 = 2 × flow", 21, "r"]]],
            ["That's why the same valve opening gives different flows when the upstream pressure changes.",
             [*axes(40, 170, 320, 330, "ΔP", "flow"), ["p", "M44,326 Q120,230 310,190", "g", 3]]],
            ["And to double the flow at the same opening, you'd need four times the pressure drop. Usually not available.",
             [["t", 20, 372, "2 × flow needs 4 × ΔP", 18, "o"]]],
        ],
        "summary": "At a fixed opening, flow through a valve goes with the square root of the pressure drop, so four times the pressure drop doubles the flow. Doubling the flow at the same opening would need four times the pressure drop, which is rarely available.",
    },
    {
        "q": "A new control valve runs at only 10 % open at normal flow. What's the problem?",
        "opts": [
            ["Nothing, it has spare room", False, "Spare, yes. Controllable, no. It's working on the seat."],
            ["It's oversized", True, "Yes! Tiny movements make big flow changes, and the seat wears."],
            ["It's undersized", False, "Undersized valves run nearly wide open, not nearly shut."],
            ["The actuator is too strong", False, "The actuator is fine. The valve is too big."],
        ],
        "title": "Oversized valve",
        "beats": [
            ["At 10 percent open, a small stem movement is a big share of the opening, so flow jumps. Stem friction makes it worse.",
             [*axes(40, 64, 320, 240, "opening %", "flow"), ["p", "M44,236 L100,236", "r", 4], ["t", 40, 256, "10 % zone", 14, "r"],
              ["p", "M44,236 L310,80", "b", 3]]],
            ["High velocity through the small gap also wears the seat and the plug.",
             [["t", 20, 280, "small gap → seat wear", 18, "r"]]],
            ["Aim to keep minimum to maximum flow within roughly 20 to 80 percent open. Normal flow often sits around 50 to 70.",
             [["p", "M97,236 L257,236", "g", 6], ["t", 124, 228, "min-max flow: ~20-80 % open", 14, "g"]]],
            ["Size the valve on real flows, not on the pipe size. Valves are often a size or two smaller than the line.",
             [["t", 20, 316, "size on flow, not pipe size", 18, "k"], ["t", 20, 340, "often smaller than the line", 17, "k"]]],
        ],
        "summary": "A valve running at only 10 % open is oversized. Near the seat small movements cause large flow changes, so control is jumpy, and high velocity through the small gap wears the seat and plug. Size the valve on real flows so the range from minimum to maximum flow sits within roughly 20 to 80 % open, with normal flow often around 50 to 70 %; control valves are often a size or two smaller than the line.",
    },
    {
        "q": "The valve takes a small share of the system pressure drop. Which characteristic suits?",
        "opts": [
            ["Linear", False, "Linear suits a valve that takes most of the drop. Not this one."],
            ["Quick opening", False, "Quick opening is for on-off duty, not throttling."],
            ["Equal percentage", True, "Correct! It makes up for the shrinking pressure drop."],
            ["It doesn't matter", False, "It matters a lot for how the loop behaves."],
        ],
        "title": "Characteristic",
        "beats": [
            ["A characteristic is how flow changes with opening, with a constant drop across the valve.",
             [*axes(40, 64, 320, 260, "opening", "flow"), ["p", "M44,256 L310,74", "b", 2.5], ["t", 200, 120, "linear", 14, "b"],
              ["p", "M44,256 Q240,250 310,74", "g", 3], ["t", 240, 200, "equal %", 14, "g"]]],
            ["In a real system, as flow rises, pipe friction takes more pressure, and less is left for the valve.",
             [["t", 20, 296, "more flow → less ΔP left for valve", 17, "o"]]],
            ["Equal percentage opens slowly at first and faster later, which cancels that effect. The installed response ends up near straight.",
             [["t", 20, 330, "equal % cancels it → near-linear", 17, "g"]]],
            ["If the valve takes most of the system drop, linear is the better choice.",
             [["t", 20, 366, "valve takes most of drop → linear", 17, "b"]]],
        ],
        "summary": "A valve's characteristic is how flow changes with opening at constant pressure drop. In most systems pipe friction takes more pressure as flow rises, leaving less for the valve. An equal percentage characteristic opens slowly at first and faster later, which compensates, so the installed response is closer to linear. If the valve takes most of the system pressure drop, a linear characteristic suits better.",
    },
    {
        "q": "A liquid control valve sounds like gravel flowing through it. What's going on?",
        "opts": [
            ["There's gravel in the line", False, "Probably not. It's bubbles, not stones."],
            ["Cavitation", True, "Cavitation! Same villain as in pumps."],
            ["The actuator is loose", False, "A loose actuator rattles differently. This is flow noise."],
            ["Normal flow noise", False, "Gravel noise isn't normal. Something's collapsing in there."],
        ],
        "title": "Valve cavitation",
        "beats": [
            ["Liquid speeds up through the narrowest gap, and its pressure drops sharply there.",
             [["p", "M20,120 L130,120 L170,140 L210,120 L340,120 M20,180 L130,180 L170,160 L210,180 L340,180", "k", 3],
              ["t", 140, 100, "fastest, lowest P", 15, "r"]]],
            ["If it falls below the vapour pressure, bubbles form. Then the pressure recovers downstream and they collapse.",
             [["c", 176, 150, 4, "b", 2], ["c", 188, 154, 3, "b", 2], ["x", 240, 150, 7, "r"], ["x", 262, 146, 6, "r"],
              ["t", 220, 210, "bubbles collapse", 15, "r"]]],
            ["The collapse sounds like gravel and eats the trim and the pipe just downstream.",
             [["t", 20, 252, "gravel noise, eaten trim", 18, "r"]]],
            ["Fixes: share the pressure drop across two valves or an orifice, use anti-cavitation trim, or put the valve where pressure is higher.",
             [["t", 20, 296, "split the drop, special trim,", 17, "g"], ["t", 20, 320, "or move to higher pressure", 17, "g"]]],
        ],
        "summary": "Liquid accelerates through the narrowest gap in the valve and its pressure falls sharply. If it drops below the vapour pressure, bubbles form, then collapse as pressure recovers downstream, sounding like gravel and eroding the trim and nearby pipe. Fixes include sharing the pressure drop across two valves or an orifice, anti-cavitation trim, or locating the valve where pressure is higher.",
    },
    {
        "q": "What does a valve positioner do?",
        "opts": [
            ["Measures process flow", False, "That's the transmitter's job."],
            ["Puts the stem where asked", True, "Yes! It fights friction until the stem is in the right place."],
            ["Sets the controller tuning", False, "Tuning lives in the controller, not on the valve."],
            ["Locks the valve in place", False, "The opposite. It keeps moving it to the right place."],
        ],
        "title": "Positioner",
        "beats": [
            ["Without a positioner, packing friction can stop the stem short of where the signal wants it.",
             [*box(30, 80, 110, 40, "controller", "b", 15), ["a", 140, 100, 200, 100, "b"], *cvalve(240, 150), ["t", 200, 200, "valve sticks", 15, "r"]]],
            ["The positioner compares the signal with the actual stem position and adds or vents air until they match.",
             [*box(200, 70, 110, 34, "positioner", "g", 15), ["t", 20, 252, "compares signal vs stem position", 17, "g"]]],
            ["Result: less stick-slip, faster response, and a valve that really goes to 37 percent when asked.",
             [["t", 20, 288, "less stick-slip, faster", 18, "g"]]],
            ["Smart positioners also report travel and friction, so you can spot a sticking valve early. Size your next valve in the control valve sizing calculator on pharmacheme dot in.",
             [["t", 20, 330, "smart: diagnostics, early warning", 17, "b"], ["t", 20, 380, "pharmacheme.in → control valve sizing", 16, "b"]]],
        ],
        "summary": "Packing friction can stop a valve stem short of where the control signal wants it. A positioner compares the signal with the actual stem position and adds or vents actuator air until they match, reducing stick-slip and speeding response. Smart positioners also report travel and friction, helping spot a sticking valve early.",
    },
]

if __name__ == '__main__':
    main(globals())
