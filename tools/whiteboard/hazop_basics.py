"""Whiteboard lesson: HAZOP basics. Run: python3 tools/whiteboard/hazop_basics.py [--no-audio]
Drawing items and voice setup: see wblib.py."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from wblib import box, main, relief

SLUG = 'hazop-basics'
TITLE = 'HAZOP basics'
CALC = '/articles/hazop-made-practical/'
CALC_LABEL = 'Read HAZOP made practical'
ENDS = ['You can chair the next HAZOP.', 'Not bad. Bubbles is watching.', 'Bubbles wins this round.']
INTRO = "Hi, I'm Bubbles. Today: HAZOP, the meeting where we ask what could go wrong, before it does. Six questions. Ready?"
OUTRO_WEB = "That's the lesson. Read HAZOP made practical next."
SPOKEN = (('P&IDs', 'P and I Ds'), ('P&ID', 'P and I D'), ('MOC', 'M O C'))

STEPS = [
    {
        "q": "In a HAZOP, what is a deviation made of?",
        "opts": [
            ["A guide word plus a parameter", True, "Yes! Like 'no' plus 'flow': no flow."],
            ["A cause plus a consequence", False, "Those come next. First you need the deviation itself."],
            ["An alarm plus a trip", False, "Alarms and trips are safeguards. Later in the row."],
            ["A risk score", False, "Scores come later, if at all. Start with what can deviate."],
        ],
        "title": "Deviations",
        "beats": [
            ["Take a parameter: flow, pressure, temperature, level, composition.",
             [["t", 20, 86, "parameters: flow, pressure,", 18, "b"], ["t", 20, 110, "temperature, level, composition", 18, "b"]]],
            ["Add a guide word: no, more, less, reverse, other than.",
             [["t", 20, 152, "guide words: no, more, less,", 18, "o"], ["t", 20, 176, "reverse, other than", 18, "o"]]],
            ["Together they make a deviation. No plus flow is no flow. More plus pressure is high pressure.",
             [["t", 20, 222, "no + flow = no flow", 19, "r"], ["t", 20, 248, "more + pressure = high pressure", 19, "r"]]],
            ["The team walks every line and vessel, one section at a time, through each deviation that makes sense.",
             [["t", 20, 296, "every section, every sensible", 17, "g"], ["t", 20, 320, "deviation", 17, "g"]]],
        ],
        "summary": "A HAZOP deviation is a guide word combined with a process parameter: 'no' + flow gives no flow, 'more' + pressure gives high pressure. Parameters include flow, pressure, temperature, level and composition; guide words include no, more, less, reverse and other than. The team works through each section of the process and every sensible deviation.",
    },
    {
        "q": "The deviation is 'high pressure in the reactor'. What does the team write down next?",
        "opts": [
            ["The safeguards", False, "Safeguards come after you know what you're guarding against."],
            ["The actions", False, "Actions are last. You haven't found the problem yet."],
            ["The causes", True, "Causes first. What could make the pressure go high?"],
            ["The cost", False, "Cost isn't a HAZOP column. Not yet, anyway."],
        ],
        "title": "The HAZOP row",
        "beats": [
            ["Each row follows the same order.",
             [*box(20, 70, 150, 32, "1 deviation", "k", 15), *box(20, 110, 150, 32, "2 causes", "b", 15), *box(20, 150, 150, 32, "3 consequences", "r", 15),
              *box(20, 190, 150, 32, "4 safeguards", "g", 15), *box(20, 230, 150, 32, "5 actions", "o", 15)]],
            ["Causes: what could push the pressure up? Cooling failure, a blocked vent, or dosing too fast.",
             [["t", 186, 128, "cooling loss,", 15, "b"], ["t", 186, 146, "blocked vent, fast dosing", 15, "b"]]],
            ["Consequences: what happens if nothing stops it? Then the safeguards already in the design.",
             [["t", 186, 170, "vessel rupture?", 15, "r"], ["t", 186, 210, "relief valve, trip", 15, "g"]]],
            ["If the safeguards aren't enough, the team writes an action, with a name and a date.",
             [["t", 186, 250, "owner + date", 15, "o"]]],
        ],
        "summary": "A HAZOP row runs deviation, causes, consequences, safeguards, actions. For high reactor pressure the team first lists causes, such as cooling failure, a blocked vent or fast dosing, then the consequences if nothing intervenes, then the existing safeguards. If they are not enough, an action is recorded with an owner and a date.",
    },
    {
        "q": "Which is usually the strongest safeguard against reactor overpressure?",
        "opts": [
            ["A high-pressure alarm", False, "An alarm needs a person to see it and act in time."],
            ["An operating procedure", False, "Procedures help, but people skip steps on a bad night."],
            ["A sized relief device", True, "Yes! It works without anyone touching it."],
            ["A warning sign on the reactor", False, "A sign won't hold back the pressure."],
        ],
        "title": "Safeguard strength",
        "beats": [
            ["An alarm only works if someone sees it, understands it and acts in time.",
             [["t", 20, 86, "alarm → needs a person, in time", 17, "o"]]],
            ["A procedure depends on people following it every time, even on night shift.",
             [["t", 20, 120, "procedure → people, every time", 17, "o"]]],
            ["A relief valve or bursting disc, sized for that exact case, works on its own, discharging to a safe place.",
             [*relief(80, 210, 1.2), ["t", 140, 210, "relief sized for", 17, "g"], ["t", 140, 234, "this case: works alone", 17, "g"]]],
            ["Count a safeguard only if it's independent of the cause, and actually sized and tested for that case.",
             [["t", 20, 300, "independent of the cause,", 18, "k"], ["t", 20, 324, "sized and tested for it", 18, "k"]]],
        ],
        "summary": "Alarms depend on someone noticing and acting in time, and procedures depend on people following them every time. A relief valve or bursting disc sized for the specific overpressure case works without human action, so it is usually the strongest safeguard. Count a safeguard only if it is independent of the cause and is sized and tested for that case.",
    },
    {
        "q": "When should a new plant's HAZOP be done?",
        "opts": [
            ["After start-up", False, "After start-up, changes cost ten times more. And it's late."],
            ["When the P&IDs are firm", True, "Right! Firm enough to review, early enough to change."],
            ["Before any drawings exist", False, "Without drawings, there's nothing to walk through."],
            ["Only after an accident", False, "That's an investigation, not a HAZOP."],
        ],
        "title": "Timing",
        "beats": [
            ["Too early, and there's nothing firm to review. Too late, and every change means cutting steel.",
             [["p", "M30,140 L330,140", "k", 2.5], ["t", 30, 130, "concept", 14, "k"], ["t", 280, 130, "running", 14, "k"],
              ["p", "M170,120 L170,160", "g", 4], ["t", 130, 184, "P&IDs firm", 16, "g"]]],
            ["The sweet spot is when the P and I Ds are firm but before construction. Changes are still cheap on paper.",
             [["t", 20, 230, "firm drawings, before construction", 17, "g"]]],
            ["A smaller review, often a what-if, is useful earlier at the concept stage.",
             [["t", 20, 268, "concept stage: what-if review", 17, "b"]]],
            ["And the HAZOP must be revisited when the plant changes, and every few years.",
             [["t", 20, 306, "revisit on change, every few years", 17, "o"]]],
        ],
        "summary": "A plant HAZOP is done when the P&IDs are firm but before construction, when changes are still cheap on paper. A lighter review such as a what-if study is useful at the concept stage, and the HAZOP should be revisited whenever the plant changes and periodically every few years.",
    },
    {
        "q": "Who should be in a HAZOP team?",
        "opts": [
            ["Only the design engineer", False, "One person can't see all the ways a plant goes wrong."],
            ["Only the safety officer", False, "Safety alone doesn't know the process or the instruments."],
            ["A mixed team, independent chair", True, "Yes! Many eyes, and a chair with no stake in the design."],
            ["Senior managers, to approve fast", False, "Rank speeds up sign-off, not hazard-finding."],
        ],
        "title": "The team",
        "beats": [
            ["Process, operations, instrumentation, maintenance, safety, and a chemist for batch processes.",
             [["t", 20, 86, "process, operations,", 18, "k"], ["t", 20, 110, "instrumentation, maintenance,", 18, "k"], ["t", 20, 134, "safety, chemist", 18, "k"]]],
            ["Operators matter a lot. They know how the plant is really run.",
             [["t", 20, 178, "operators: how it's really run", 18, "g"]]],
            ["The chair should be independent and trained, keeping the team on the method and the clock.",
             [["t", 20, 220, "independent, trained chair", 18, "b"]]],
            ["Plus a scribe to record every row, so nothing gets lost.",
             [["t", 20, 260, "scribe records every row", 18, "o"]]],
        ],
        "summary": "A HAZOP team is cross-functional: process, operations, instrumentation, maintenance and safety, plus a chemist for batch processes. Operators are especially valuable because they know how the plant is really run. An independent, trained chair keeps the team on the method, and a scribe records every row.",
    },
    {
        "q": "You want to swap the reaction solvent for a cheaper one. Does that need a hazard review?",
        "opts": [
            ["No, it's only a solvent", False, "Only a solvent? Flash point, toxicity, reactivity... all new."],
            ["Yes, through management of change", True, "Yes! Anything that isn't like-for-like goes through MOC and a hazard review."],
            ["Only if the price changes a lot", False, "Price doesn't decide safety reviews."],
            ["Only after the first batch", False, "After the first batch is too late to find out."],
        ],
        "title": "Change = review",
        "beats": [
            ["A new solvent brings a new flash point, boiling point, toxicity and static behaviour.",
             [["t", 20, 86, "new flash point, boiling point,", 17, "r"], ["t", 20, 110, "toxicity, static behaviour", 17, "r"]]],
            ["It can change heat removal, the relief case, and even the reaction itself.",
             [["t", 20, 152, "heat removal, relief case,", 17, "o"], ["t", 20, 176, "the reaction itself", 17, "o"]]],
            ["So it goes through management of change: a hazard review, often a focused HAZOP, before the first batch.",
             [["t", 20, 220, "management of change (MOC)", 19, "b"], ["t", 20, 248, "→ review before first batch", 18, "b"]]],
            ["Then update the procedures and train the people. More in HAZOP made practical on pharmacheme dot in.",
             [["t", 20, 292, "update procedures, train people", 17, "g"], ["t", 20, 380, "pharmacheme.in → HAZOP", 16, "b"]]],
        ],
        "summary": "Changing a solvent changes flash point, boiling point, toxicity and static behaviour, and can affect heat removal, the relief case and the reaction itself. It must go through management of change, with a hazard review (often a focused HAZOP) before the first batch, followed by updated procedures and training.",
    },
]

if __name__ == '__main__':
    main(globals())
