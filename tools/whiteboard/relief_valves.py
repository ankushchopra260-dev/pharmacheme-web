"""Whiteboard lesson: relief valves. Run: python3 tools/whiteboard/relief_valves.py [--no-audio]
Drawing items and voice setup: see wblib.py."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from wblib import axes, main, relief

SLUG = 'relief-valves'
TITLE = 'Relief valves'
CALC = '/calculators/relief-valve-sizing/'
CALC_LABEL = 'Open the relief valve sizing tool'
ENDS = ['Vessels feel safer already.', 'Not bad. Bubbles is watching.', 'Bubbles wins this round.']
INTRO = "Hi, I'm Bubbles. Today: relief valves, the last thing standing between a vessel and the sky. Six questions. Ready?"
OUTRO_WEB = "That's the lesson. Now try the relief valve sizing tool."
SPOKEN = (('MAWP', 'M A W P'), ('PSV', 'P S V'), ('barg', 'bar gauge'), ('°C', ' degrees'))

STEPS = [
    {
        "q": "What sets the highest set pressure allowed for a vessel's single relief valve?",
        "opts": [
            ["The normal operating pressure", False, "Set it at operating pressure and it'll pop every afternoon."],
            ["The vessel's MAWP", True, "Yes! The vessel's maximum allowable working pressure."],
            ["Twice the operating pressure", False, "Twice? The vessel might not be built for that."],
            ["The pump's shut-off pressure", False, "The pump is one cause of overpressure, not the limit."],
        ],
        "title": "Pressure ladder",
        "beats": [
            ["Start with the vessel's maximum allowable working pressure, the MAWP. A single relief valve is set no higher than this.",
             [["p", "M60,370 L60,70", "k", 2.5], ["p", "M52,200 L68,200", "r", 3], ["t", 78, 206, "MAWP = set pressure (max)", 17, "r"]]],
            ["Operating pressure sits well below it, usually under 90 percent of set, or the valve simmers and leaks.",
             [["p", "M52,290 L68,290", "b", 3], ["t", 78, 296, "operating < ~90 % of set", 17, "b"]]],
            ["When it relieves, pressure can rise a little above MAWP. That's accumulation: 10 percent for a single valve.",
             [["p", "M52,160 L68,160", "o", 3], ["t", 78, 166, "+10 %: relieving, single valve", 16, "o"]]],
            ["For a fire case, the code allows 21 percent above MAWP, because a fire is a rare, short emergency.",
             [["p", "M52,110 L68,110", "r", 3], ["t", 78, 116, "+21 %: fire case", 16, "r"]]],
        ],
        "summary": "A single relief valve is set at or below the vessel's maximum allowable working pressure (MAWP). Normal operating pressure is kept below about 90 % of set pressure so the valve does not simmer and leak. While relieving, pressure may rise above MAWP by the allowed accumulation: 10 % for a single valve in a non-fire case and 21 % for the fire case.",
    },
    {
        "q": "A liquid-full pipe, blocked in at both ends, sits in the sun. Why fit a small relief valve?",
        "opts": [
            ["The liquid boils", False, "It doesn't need to boil. It only needs to warm up a little."],
            ["The liquid expands", True, "Correct! Trapped liquid, a few degrees warmer, huge pressure."],
            ["Air gets in", False, "Air can't get into a blocked, liquid-full pipe."],
            ["The pipe shrinks in the heat", False, "Pipes grow in the heat, not shrink. And the liquid grows faster."],
        ],
        "title": "Thermal relief",
        "beats": [
            ["Close both valves on a liquid-full line. Now the liquid has nowhere to go.",
             [["p", "M40,120 L320,120 M40,160 L320,160", "k", 3], ["v", 40, 140], ["v", 320, 140], ["p", "M54,140 L306,140", "b", 6],
              ["c", 300, 196, 16, "o", 2.5], ["t", 290, 230, "sun", 16, "o"]]],
            ["Liquid expands as it warms, more than the steel does. With no space to expand into, pressure climbs fast.",
             [["t", 40, 208, "liquid expands more than steel", 17, "k"], ["t", 40, 234, "→ several bar per °C!", 18, "r"]]],
            ["A few degrees of sun can blow a gasket or crack a flange. A small thermal relief valve lets a few drops out.",
             [*relief(180, 88, 0.8), ["t", 220, 80, "few drops out", 15, "b"], ["t", 40, 300, "small thermal relief valve", 17, "b"]]],
            ["Route it somewhere safe: back to a tank or a closed drain, not onto a walkway.",
             [["t", 40, 386, "route to a safe place", 17, "g"]]],
        ],
        "summary": "Liquid trapped between closed valves expands when it warms, more than the steel pipe does, so the pressure can climb by several bar for each degree. A small thermal relief valve releases a few drops to stop gaskets and flanges failing. Route its outlet to a tank or closed drain.",
    },
    {
        "q": "A relief valve discharges into a header with varying back pressure. Which type suits it?",
        "opts": [
            ["A conventional spring valve", False, "A conventional valve's opening point moves when back pressure changes."],
            ["A balanced bellows valve", True, "Yes! The bellows takes the back pressure off the disc."],
            ["A gate valve", False, "A gate valve is for isolation. It doesn't relieve anything."],
            ["A check valve", False, "A check valve only stops reverse flow. It won't save the vessel."],
        ],
        "title": "Back pressure",
        "beats": [
            ["In a conventional valve, back pressure pushes on top of the disc and adds to the spring.",
             [*relief(100, 160, 1.6), ["a", 200, 160, 172, 160, "r"], ["t", 210, 166, "back pressure", 16, "r"], ["t", 40, 250, "conventional: set point moves", 17, "k"]]],
            ["So when the header pressure changes, the valve opens at the wrong pressure, and its capacity falls too.",
             [["t", 40, 278, "and capacity falls", 17, "k"]]],
            ["A bellows shields the disc from the outlet side. Back pressure no longer changes the opening point. Keep its bonnet vent open and routed safely: gas there means the bellows has failed.",
             [["t", 40, 318, "bellows: set point stays put", 17, "g"]]],
            ["Rule of thumb: a conventional valve copes with built-up back pressure up to about 10 percent of set.",
             [["t", 40, 358, "conventional: built-up back pressure", 15, "b"], ["t", 40, 378, "≤ ~10 % of set", 15, "b"]]],
        ],
        "summary": "In a conventional spring-loaded valve, back pressure acts on the disc and changes the opening pressure, and it reduces capacity. Where back pressure varies, as in a shared header, a balanced bellows valve shields the disc so the set point stays put; keep the bellows bonnet vent open and routed to a safe place, since gas there means the bellows has failed. A conventional valve is usually limited to built-up back pressure of about 10 % of set pressure.",
    },
    {
        "q": "A rupture disc sits under a relief valve. Why is there a pressure gauge between them?",
        "opts": [
            ["To read the vessel pressure", False, "The vessel has its own gauge. This one has a different job."],
            ["To spot a pinhole leak in the disc", True, "Yes! A pinhole lets pressure build up behind the disc."],
            ["To set the valve", False, "Valves are set on a test bench, not with this gauge."],
            ["It's just decoration", False, "Nothing on a relief line is decoration."],
        ],
        "title": "Disc + valve",
        "beats": [
            ["The disc keeps corrosive or sticky process away from the valve, and stops it leaking.",
             [["p", "M120,330 L120,250", "k", 3], ["p", "M104,250 Q120,236 136,250", "r", 3], ["t", 146, 252, "rupture disc", 15, "r"],
              ["p", "M120,250 L120,200", "k", 3], ["c", 92, 222, 10, "b", 2], ["p", "M102,222 L120,222", "b", 2], ["t", 30, 206, "gauge", 15, "b"],
              *relief(120, 170, 1.0)]],
            ["A disc bursts on the pressure difference across it. A pinhole lets pressure build up in the space between the disc and the valve.",
             [["t", 30, 360, "pinhole → pressure behind disc", 16, "o"]]],
            ["Now the disc needs the vessel pressure plus that trapped pressure to burst. It opens late.",
             [["t", 30, 384, "→ bursts late!", 18, "r"]]],
            ["So the gauge, or a tell-tale, shows the space is at zero. Check it every round.",
             [["t", 190, 120, "gauge reads 0?", 17, "g"], ["k", 300, 102, "g"], ["t", 190, 144, "check every round", 15, "g"]]],
        ],
        "summary": "A rupture disc under a relief valve keeps corrosive or sticky process away from the valve and stops leakage. A disc bursts on the pressure difference across it, so a pinhole that lets pressure build in the space between disc and valve makes it burst late. A pressure gauge or tell-tale in that space shows it is at zero; check it on every round.",
    },
    {
        "q": "Can you fit an isolation valve under a relief valve on a process vessel?",
        "opts": [
            ["Never", False, "On a steam boiler, never. On a process vessel the codes allow it, with conditions."],
            ["Yes, if locked open", True, "Correct. Locked open, with a procedure for closing it."],
            ["Yes, any valve is fine", False, "Any valve? One wrong turn and the vessel has no protection."],
            ["Only on water lines", False, "The fluid doesn't decide it. The control does."],
        ],
        "title": "Isolation valves",
        "beats": [
            ["Valves under relief valves let you remove one for testing without a shutdown.",
             [*relief(120, 150, 1.2), ["p", "M120,198 L120,300", "k", 3], ["v", 120, 250], ["t", 150, 256, "isolation valve", 16, "k"]]],
            ["But a closed one leaves the vessel with no protection at all.",
             [["x", 120, 250, 16, "r"], ["t", 150, 282, "closed = no protection!", 16, "r"]]],
            ["So they must be locked or car-sealed open, full bore, and on a register.",
             [["t", 30, 330, "locked / car-sealed open,", 17, "g"], ["t", 30, 354, "full bore, on a register", 17, "g"]]],
            ["Close one only under a permit, with a spare relief valve in service, or a person posted full time who can stop the pressure source. And never on a steam boiler.",
             [["t", 30, 388, "close only under permit", 17, "b"]]],
        ],
        "summary": "Isolation valves under relief valves are allowed so a valve can be removed for testing without a shutdown, but a closed one leaves the vessel unprotected. They must be full bore, locked or car-sealed open and listed on a register, and closed only under a permit with a spare relief valve in service, or a person posted full time who can stop the pressure source. Steam boiler safety valves must never have an isolation valve under them.",
    },
    {
        "q": "A relief valve chatters: it slams open and shut again and again. What is the likely cause?",
        "opts": [
            ["The set pressure is too high", False, "A high set point makes it open late, not chatter."],
            ["High inlet pressure loss", True, "Yes! The valve starves and slams shut. An oversized valve does it too."],
            ["The spring is too strong", False, "A stronger spring just raises the set point."],
            ["The vessel is too big", False, "A big vessel helps keep the pressure steady, if anything."],
        ],
        "title": "Chatter",
        "beats": [
            ["The valve opens, and flow rushes through the inlet pipe.",
             [*relief(120, 160, 1.2), ["p", "M120,208 L120,300", "k", 3], ["t", 30, 330, "long or narrow inlet", 16, "k"]]],
            ["If the inlet loses too much pressure, the pressure at the disc drops below reseat. It slams shut, the pressure builds again, and it reopens.",
             [*axes(190, 90, 340, 220, "time", "P"), ["p", "M194,150 L212,120 L222,170 L236,120 L246,170 L260,120 L270,170 L284,120 L294,170", "r", 2.5],
              ["t", 196, 244, "open-shut-open", 15, "r"]]],
            ["An oversized valve does the same: there's not enough flow to hold it open.",
             [["t", 30, 360, "oversized valve → same", 16, "o"]]],
            ["Keep the inlet loss under 3 percent of set pressure, and size for the real flow. Check yours with the relief valve sizing tool on pharmacheme dot in.",
             [["t", 30, 384, "inlet loss < 3 % of set", 17, "g"]]],
        ],
        "summary": "Chatter is rapid opening and closing. If the inlet pipe loses too much pressure when the valve flows, the pressure at the disc falls below the reseat point, the valve slams shut, pressure rebuilds and it reopens. An oversized valve chatters for a similar reason. Keep inlet pressure loss below 3 % of set pressure and size the valve for the real relieving flow.",
    },
]

if __name__ == '__main__':
    main(globals())
