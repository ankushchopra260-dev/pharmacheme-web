"""Whiteboard lesson: runaway reactions. Run: python3 tools/whiteboard/runaway_reactions.py [--no-audio]
Drawing items and voice setup: see wblib.py."""
import math, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from wblib import axes, main, reactor

SLUG = 'runaway-reactions'
TITLE = 'Runaway reactions'
CALC = '/calculators/heat-of-reaction-calculator/'
CALC_LABEL = 'Open the heat of reaction calculator'
ENDS = ['Reactors sleep easy with you around.', 'Not bad. Bubbles is watching.', 'Bubbles wins this round.']
INTRO = "Hi, I'm Bubbles. Today: runaway reactions, the batches that stop listening to you. Six questions. Ready?"
OUTRO_WEB = "That's the lesson. Now check your own reaction in the heat of reaction calculator."
SPOKEN = (('ΔT ad', 'delta T adiabatic'), ('TD24', 'T D 24'), ('DSC', 'D S C'), ('Cp', 'C P'), ('X acc', 'accumulation'), ('kcal/kg', 'kilocalories per kilogram'))

# Semenov diagram: heat made (exponential) and heat removed (straight line), with their two crossings.
def gen_y(x): return 290 - 13.3 * math.exp((x - 40) / 91)
def rem_y(x): return 290 - 0.917 * (x - 96)
GEN = "M40,277 " + " ".join(f"L{x},{gen_y(x):.0f}" for x in range(50, 300, 10) if gen_y(x) >= 66)
def cross(lo, hi):
    for _ in range(60):
        mid = (lo + hi) / 2
        if (gen_y(lo) - rem_y(lo)) * (gen_y(mid) - rem_y(mid)) <= 0: hi = mid
        else: lo = mid
    return round(lo), round(rem_y(lo))
X1, Y1 = cross(75, 200)
X2, Y2 = cross(200, 300)

STEPS = [
    {
        "q": "Why can a few degrees of extra temperature make an exothermic reaction run away?",
        "opts": [
            ["The jacket stops working when hot", False, "The jacket doesn't give up. It just can't keep up. Different problem."],
            ["Heat made rises steeply; heat removed only in a straight line", True, "Yes! An exponential against a straight line. Past a point, the exponential wins."],
            ["Hot liquids hold less heat", False, "Heat capacity barely moves with a few degrees. Not the culprit."],
            ["The agitator slows down", False, "The agitator doesn't care about a few degrees. Nice try."],
        ],
        "title": "Made vs removed",
        "beats": [
            ["The heat the reaction makes climbs steeply with temperature. A rough rule: the rate doubles for every 10 degrees.",
             [*axes(30, 62, 330, 290, "temperature", "heat"), ["p", GEN, "r", 3], ["t", 196, 86, "heat made", 16, "r"]]],
            ["The heat the jacket removes rises only in a straight line with the temperature difference.",
             [["p", f"M96,290 L{X2 + 30},{rem_y(X2 + 30):.0f}", "b", 3], ["t", 40, 206, "heat removed", 16, "b"], ["a", 96, 212, 134, 234, "b"]]],
            ["At the lower crossing the batch is stable. Push it a little hotter, and the jacket pulls it back.",
             [["c", X1, Y1, 7, "g", 3], ["t", X1 + 12, Y1 + 24, "stable", 16, "g"]]],
            ["Past the upper crossing, the reaction makes heat faster than the jacket can ever take it away. That's a runaway.",
             [["c", X2, Y2, 7, "r", 3], ["a", X2 + 6, Y2 - 10, X2 + 22, Y2 - 56, "r"], ["t", X2 + 14, Y2 + 24, "runaway!", 18, "r"],
              ["t", 20, 330, "made grows like an exponential,", 17, "k"], ["t", 20, 356, "removed like a straight line", 17, "k"]]],
        ],
        "summary": "The heat a reaction makes rises roughly exponentially with temperature (a common rule of thumb is that the rate doubles for every 10 °C), while the heat the jacket removes rises only linearly with the temperature difference. At the lower crossing of the two curves the batch is stable; beyond the upper crossing heat generation outruns cooling and the batch runs away.",
    },
    {
        "q": "Semi-batch dosing, and the cooling fails. What decides how hot the batch can get?",
        "opts": [
            ["The jacket temperature", False, "The jacket just quit. It's not deciding anything now."],
            ["The unreacted reagent already in the reactor", True, "Exactly. Whatever has piled up unreacted. That's your fuel."],
            ["The dosing pump speed", False, "You'd stop the pump. The problem is what's already inside."],
            ["The agitator speed", False, "Agitator speed helps mixing, but it doesn't decide the final temperature."],
        ],
        "title": "Accumulation",
        "beats": [
            ["In semi-batch, you add the reagent slowly, so the heat comes out bit by bit as you dose.",
             [*reactor(110, 80, 120, 170, 140), ["a", 196, 54, 150, 96, "o"], ["t", 200, 52, "dose slowly", 16, "o"]]],
            ["But if the reaction is slower than the dosing, unreacted reagent piles up in the batch. That's accumulation.",
             [["c", 80, 170, 4, "o", 2], ["c", 104, 196, 4, "o", 2], ["c", 132, 180, 4, "o", 2], ["c", 92, 222, 4, "o", 2],
              ["c", 140, 214, 4, "o", 2], ["c", 118, 236, 4, "o", 2], ["t", 196, 190, "unreacted", 16, "o"], ["t", 196, 212, "= accumulation", 16, "o"]]],
            ["If cooling fails, all that stored reagent can still react. The batch climbs by that share of the adiabatic rise. That peak is the MTSR.",
             [["t", 20, 300, "MTSR = T process", 19, "r"], ["t", 92, 328, "+ X acc × ΔT ad", 19, "r"]]],
            ["So keep accumulation low: dose at a temperature where the reaction keeps up with you.",
             [["t", 20, 372, "low accumulation → low MTSR", 18, "g"]]],
        ],
        "summary": "In a semi-batch reaction the reagent is dosed slowly so heat is released as it is added. If the reaction is slower than the dosing, unreacted reagent accumulates. When cooling fails, that accumulated reagent can still react, so the maximum temperature of the synthesis reaction (MTSR) is the process temperature plus the accumulated fraction times the adiabatic temperature rise. Dosing at a temperature where the reaction keeps up keeps accumulation and MTSR low.",
    },
    {
        "q": "You are dosing, but the temperature isn't rising like it usually does. What do you do?",
        "opts": [
            ["Dose faster to get it going", False, "Dose faster?! You're loading the gun and pointing it at yourself."],
            ["Stop dosing and find out why", True, "Yes. Stop it, then work out why. That's a shift engineer talking."],
            ["Heat the jacket hard to kick it off", False, "Kick it off with everything already dosed? Bubbles is hiding under the table."],
            ["Keep dosing, it will catch up", False, "Oh, it will catch up. All at once. That's the problem."],
        ],
        "title": "No rise? Stop!",
        "beats": [
            ["Normally the temperature lifts as soon as dosing starts. If it stays flat, the reaction may not have started.",
             [*axes(30, 62, 330, 240, "time", "temp"), ["p", "M34,200 Q70,170 120,166 L300,166", "g", 3], ["t", 150, 158, "usual", 15, "g"],
              ["p", "M34,200 L190,200", "b", 3], ["t", 70, 222, "flat: no reaction?", 15, "b"]]],
            ["Meanwhile the reagent piles up. Then the reaction kicks off with everything you've dosed. That's how many runaways begin.",
             [["p", "M190,200 Q230,196 250,70", "r", 3.5], ["t", 258, 92, "BANG", 22, "r"]]],
            ["So stop dosing first. Then check the agitator, the temperature probe, the catalyst and the reagent.",
             [["k", 20, 270, "g"], ["t", 42, 278, "stop dosing", 18, "k"], ["t", 20, 308, "agitator? probe? catalyst? reagent?", 16, "k"]]],
            ["Restart only when you know why, and how much has piled up.",
             [["t", 20, 350, "restart only when you know", 17, "o"], ["t", 20, 374, "why, and how much piled up", 17, "o"]]],
        ],
        "summary": "If the temperature does not rise as usual when dosing starts, the reaction may not have started, and the dosed reagent is accumulating. If it then starts, it can release the heat of everything dosed at once, which is how many runaways begin. Stop dosing first, then check the agitator, temperature probe, catalyst and reagent, and restart only once the cause and the amount accumulated are known.",
    },
    {
        "q": "A reaction releases 100 kcal per kg of batch. Cp is 0.5 kcal/kg °C. What is the adiabatic rise?",
        "opts": [
            ["20 °C", False, "Twenty? That's a warm bath. Do the division again."],
            ["50 °C", False, "You multiplied when you should have divided. Close, but no."],
            ["100 °C", False, "That's what water would give. This batch is easier to heat than water."],
            ["200 °C", True, "200 degrees. Correct, and a little scary."],
        ],
        "title": "Adiabatic rise",
        "beats": [
            ["With no cooling at all, every kilocalorie stays in the batch.",
             [["t", 20, 84, "no cooling → all heat stays in", 18, "k"]]],
            ["The adiabatic rise is the heat released divided by the heat capacity. 100 over 0.5 is 200 degrees.",
             [["t", 20, 128, "ΔT ad = Q ÷ Cp", 24, "b"], ["t", 20, 164, "= 100 ÷ 0.5 = 200 °C", 22, "b"]]],
            ["Start at 60 and the batch could head for 260 degrees. Far above most solvents' boiling points.",
             [["t", 20, 212, "60 + 200 = 260 °C !", 22, "r"]]],
            ["A common scale: under 50 degrees is low severity, 50 to 200 is medium, over 200 is high. Our 200 sits right on the line, so treat it as high, and get reaction calorimetry and DSC data before scale-up.",
             [*axes(30, 236, 330, 330, "ΔT ad", ""), ["p", "M34,326 L110,326", "g", 8], ["p", "M110,326 L250,326", "o", 8], ["p", "M250,326 L326,326", "r", 8],
              ["t", 50, 314, "< 50", 15, "g"], ["t", 150, 314, "50-200", 15, "o"], ["t", 264, 314, "> 200", 15, "r"],
              ["t", 20, 376, "→ calorimetry + DSC before scale-up", 16, "k"]]],
        ],
        "summary": "With no cooling, all the heat stays in the batch. The adiabatic temperature rise is the heat released divided by the heat capacity: 100 kcal/kg ÷ 0.5 kcal/kg °C = 200 °C. Starting at 60 °C, the batch could head for 260 °C. A common severity scale calls an adiabatic rise under 50 °C low, 50 to 200 °C medium and over 200 °C high. 200 °C sits at the boundary and should be treated as high; get reaction calorimetry and DSC data before scale-up.",
    },
    {
        "q": "During dosing, the agitator trips. Which move is the most dangerous?",
        "opts": [
            ["Stopping the dosing", False, "That's the right move, not the dangerous one! Read the question again."],
            ["Restarting the agitator straight away", True, "Yes. That restart can mix everything in one go."],
            ["Calling the shift in-charge", False, "Calling for help is never the dangerous move."],
            ["Writing the time in the log", False, "Paperwork never blew up a reactor. Probably."],
        ],
        "title": "Agitator trip",
        "beats": [
            ["Without mixing, the dosed reagent sits in a layer on top, or at the bottom. Only a little reacts where the layers touch, and the jacket now removes much less heat.",
             [*reactor(110, 70, 120, 170, 120), ["p", "M54,124 L166,124 L166,146 L54,146 Z", "o", 2], ["t", 196, 128, "unmixed layer", 16, "o"],
              ["x", 110, 210, 12, "r"], ["t", 196, 214, "agitator off", 16, "r"]]],
            ["Restart the agitator and that whole layer mixes in at once. All its heat comes out together.",
             [["t", 196, 250, "restart →", 17, "r"], ["t", 196, 274, "all heat at once", 17, "r"]]],
            ["So stop dosing at once, and don't restart until someone has worked out how much is sitting there.",
             [["k", 20, 300, "g"], ["t", 42, 308, "stop dosing", 18, "k"], ["x", 30, 334, 8, "r"], ["t", 42, 340, "no quick restart", 18, "k"]]],
            ["Many plants interlock the dosing valve to the agitator, so dosing stops on its own.",
             [["t", 20, 380, "interlock: agitator off → dosing off", 16, "b"]]],
        ],
        "summary": "When the agitator trips, the dosed reagent stops mixing and collects as a layer that reacts only slowly at the interface, while jacket heat removal drops. Restarting the agitator mixes the whole layer in at once and releases its heat together, so restarting straight away is the dangerous move. Stop dosing immediately and do not restart until the amount accumulated has been assessed; many plants interlock the dosing valve with the agitator so dosing stops automatically.",
    },
    {
        "q": "Cooling fails at 60 °C. MTSR 110 °C, solvent boils at 80 °C, TD24 is 150 °C. What happens?",
        "opts": [
            ["Nothing, it stays below decomposition", False, "Nothing? There's a whole boiling point in the way, my friend."],
            ["It boils at 80 °C", True, "Yes! Boiling is the brake, if the condenser can take it."],
            ["It decomposes", False, "Decomposition needs 150 degrees here. The batch can't get there."],
            ["It cools itself down", False, "Not on its own. Only boiling can brake it here, and only if the condenser keeps up."],
        ],
        "title": "Line them up",
        "beats": [
            ["Put the temperatures on one ladder.",
             [["p", "M60,370 L60,70", "k", 2.5], ["p", "M52,340 L68,340", "k", 3], ["t", 78, 346, "60 °C process", 17, "k"],
              ["p", "M52,290 L68,290", "b", 3], ["t", 78, 296, "80 °C boils", 17, "b"], ["p", "M52,210 L68,210", "o", 3],
              ["t", 78, 216, "110 °C MTSR", 17, "o"], ["p", "M52,110 L68,110", "r", 3], ["t", 78, 116, "150 °C TD24 (decomposition)", 17, "r"]]],
            ["Heading for 110, the batch hits the boiling point first, at 80.",
             [["a", 36, 336, 36, 296, "b"], ["t", 200, 296, "← it stops here", 16, "b"]]],
            ["Boiling soaks up the heat, but only if the condenser and vent can handle all that vapour. If not, the pressure builds.",
             [["t", 190, 250, "condenser + vent", 16, "g"], ["t", 190, 270, "big enough?", 16, "g"]]],
            ["Decomposition at 150 stays out of reach. Here 150 is the TD24, not a DSC onset; an onset needs a much wider margin. Then check your own numbers in the heat of reaction calculator on pharmacheme dot in.",
             [["k", 304, 104, "g"], ["t", 20, 392, "pharmacheme.in → heat of reaction", 16, "b"]]],
        ],
        "summary": "Line the temperatures up: process 60 °C, boiling point 80 °C, MTSR 110 °C, TD24 of decomposition 150 °C. On cooling failure the batch reaches the boiling point before the MTSR, so boiling acts as a barrier, but only if the condenser and vent can handle the vapour; otherwise pressure builds. Decomposition at 150 °C (TD24) stays out of reach; a DSC onset temperature would need a much wider margin.",
    },
]

if __name__ == '__main__':
    main(globals())
