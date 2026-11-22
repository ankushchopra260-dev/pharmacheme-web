"""Whiteboard lesson: PID control. Run: python3 tools/whiteboard/pid_control.py [--no-audio]
Drawing items and voice setup: see wblib.py."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from wblib import axes, box, main, reactor

SLUG = 'pid-control'
TITLE = 'PID control'
CALC = '/articles/pid-control-tuning/'
CALC_LABEL = 'Read the PID tuning guide'
ENDS = ['Your loops will run on auto.', 'Not bad. Bubbles is watching.', 'Bubbles wins this round.']
INTRO = "Hi, I'm Bubbles. Today: PID loops, the reason the operator isn't turning valves all day. Six questions. Ready?"
OUTRO_WEB = "That's the lesson. Read the PID tuning guide next."
SPOKEN = (('P-only', 'P only'), ('PID', 'P I D'), ('PV', 'P V'), ('SP', 'set point'), ('FO', 'fail open'), ('FC', 'fail closed'), ('TIC', 'T I C'), ('DCS', 'D C S'), ('HAZOP', 'HAZOP'))

SP = ["p", "M44,120 L320,120", "g", 1.5]

STEPS = [
    {
        "q": "A P-only level loop settles a little below set point. What removes that offset?",
        "opts": [
            ["More derivative action", False, "Derivative reacts to change. A steady offset doesn't change."],
            ["Integral action", True, "Integral! It keeps pushing until the error is zero."],
            ["A bigger control valve", False, "A bigger valve doesn't change the controller maths."],
            ["Lower gain", False, "Lower gain makes the offset bigger, not smaller."],
        ],
        "title": "Offset",
        "beats": [
            ["A proportional-only controller moves the valve in proportion to the error. No error, no extra output.",
             [["t", 20, 86, "P only: output ∝ error", 20, "k"]]],
            ["So after a load change it needs some error to hold the new valve position. It settles just off set point.",
             [*axes(40, 100, 330, 260, "time", "level"), SP, ["t", 250, 114, "set point", 13, "g"],
              ["p", "M44,120 L90,120 Q110,200 150,150 Q190,135 320,140", "b", 3], ["t", 220, 160, "offset", 15, "r"], ["dim", 230, 121, 139, "r"]]],
            ["Integral adds up the error over time and keeps moving the valve until the error is gone.",
             [["p", "M44,120 L90,120 Q110,200 160,140 Q220,112 320,120", "o", 3], ["t", 20, 296, "integral: adds up error until it's zero", 16, "o"]]],
            ["That's why most process loops are PI: proportional for speed, integral to finish the job.",
             [["t", 20, 340, "most loops = PI", 20, "g"]]],
        ],
        "summary": "A proportional-only controller changes output in proportion to error, so after a load change it needs a standing error to hold the new valve position, and the process settles off set point. Integral action adds up the error over time and keeps moving the output until the error is zero. Most process loops are PI.",
    },
    {
        "q": "You keep raising the controller gain to make a loop faster. What happens in the end?",
        "opts": [
            ["It gets faster forever", False, "Forever? Every loop has a limit, and it isn't pretty."],
            ["It starts to oscillate", True, "Yes! Too much gain and it swings around the set point."],
            ["The offset grows", False, "More gain shrinks the offset. Something else goes wrong."],
            ["The valve stops moving", False, "The valve moves more, not less. That's the problem."],
        ],
        "title": "Too much gain",
        "beats": [
            ["Low gain: slow and steady. It creeps up to set point.",
             [*axes(40, 64, 330, 300, "time", "PV"), ["p", "M44,240 L320,240", "g", 1.5], ["p", "M44,290 Q120,250 320,244", "b", 3], ["t", 230, 270, "low gain", 15, "b"]]],
            ["Good gain: quick, with a small overshoot that settles.",
             [["p", "M44,290 Q80,210 120,232 Q150,248 190,240 L320,240", "g", 3], ["t", 196, 230, "good", 15, "g"]]],
            ["Too much gain: the valve overreacts every time. The loop swings, and can keep swinging.",
             [["p", "M44,290 L70,180 L96,290 L122,180 L148,290 L174,180 L200,290 L226,180", "r", 2.5], ["t", 230, 180, "too much", 15, "r"]]],
            ["If a loop cycles, put it in manual. If the cycling stops, it's the tuning or a sticky valve. If it carries on, it's coming from upstream.",
             [["t", 20, 340, "cycling? put it in manual", 18, "k"], ["t", 20, 366, "stops → tuning or sticky valve", 16, "o"]]],
        ],
        "summary": "Raising controller gain makes a loop respond faster, but past a point it overreacts and oscillates around set point, and can become unstable. Low gain is slow; good gain gives a quick response with a small, settling overshoot. If a loop cycles, put it in manual: if the cycling stops, look at tuning or a sticking valve; if it continues, the disturbance is coming from upstream.",
    },
    {
        "q": "Why do most flow loops run without derivative action?",
        "opts": [
            ["Flow loops are too slow for it", False, "Slow? Flow loops are the fastest loops in the plant."],
            ["It amplifies signal noise", True, "Correct! Noisy signal plus derivative equals a twitchy valve."],
            ["Derivative removes offset", False, "That's integral's job, not derivative's."],
            ["The DCS won't allow it", False, "The DCS allows it. Good engineers don't."],
        ],
        "title": "Noise",
        "beats": [
            ["Flow signals are noisy. The reading jitters even when the flow is steady.",
             [*axes(40, 64, 330, 180, "time", "flow"), ["p", "M44,130 L60,122 L72,136 L86,120 L98,134 L112,124 L126,138 L140,121 L154,133 L168,124 L182,137 L196,122 L210,134 L224,126 L238,136 L252,121 L266,133 L280,125 L300,132", "b", 2]]],
            ["Derivative acts on the rate of change. Each little jitter looks like a big, fast change.",
             [["t", 20, 220, "derivative = rate of change", 18, "k"], ["t", 20, 246, "jitter → big kicks", 18, "r"]]],
            ["So the valve twitches all day. It wears out, and the loop gets worse, not better.",
             [["t", 20, 288, "twitchy valve, worn packing", 18, "r"]]],
            ["Flow and pressure loops are usually PI. Derivative helps slow loops with a clean signal, like some temperature loops.",
             [["t", 20, 330, "flow, pressure → PI", 18, "g"], ["t", 20, 356, "derivative: slow, clean loops", 16, "g"], ["t", 20, 378, "(some temperature loops)", 15, "g"]]],
        ],
        "summary": "Flow measurements are noisy, and derivative action responds to the rate of change, so each jitter produces a large output kick. The valve then twitches constantly, wearing it out and making control worse. Flow and pressure loops are usually PI; derivative is mainly useful on slow loops with clean signals, such as some temperature loops.",
    },
    {
        "q": "Cooling water valve on the jacket of an exothermic reactor. Which way should it fail on loss of air?",
        "opts": [
            ["Fail closed", False, "Fail closed? Lose air and you lose cooling, mid-reaction."],
            ["Fail open", True, "Fail open. Lose air, keep cooling. Correct!"],
            ["Fail in last position", False, "Last position might be nearly shut. Not good enough here."],
            ["It doesn't matter", False, "It matters a lot on an exothermic batch."],
        ],
        "title": "Fail-safe",
        "beats": [
            ["Ask one question: what's safe if the air supply or the signal is lost?",
             [["t", 20, 84, "lose air: what's safe?", 20, "k"]]],
            ["For an exothermic reactor, losing cooling is the danger. So the cooling water valve fails open.",
             [*reactor(110, 120, 120, 170, 160), ["p", "M30,300 L44,300", "b", 3], ["v", 30, 300], ["t", 20, 340, "CW valve: fail open (FO)", 17, "b"]]],
            ["A steam or heating valve fails closed. Losing air should stop the heat, not add more.",
             [["t", 196, 200, "steam valve:", 16, "r"], ["t", 196, 222, "fail closed (FC)", 16, "r"]]],
            ["The same goes for the dosing valve. Lose air, stop dosing. Fail closed. Confirm every fail position in the HAZOP.",
             [["t", 196, 262, "dosing valve:", 16, "o"], ["t", 196, 284, "fail closed (FC)", 16, "o"]]],
        ],
        "summary": "Choose each valve's failure position by asking what is safe if the air or signal is lost. On an exothermic reactor, losing cooling is the danger, so the jacket cooling water valve fails open. Steam or heating valves fail closed so heat stops, and dosing valves fail closed so addition stops. Confirm each fail position in the HAZOP, since overcooling can be a hazard on some batches.",
    },
    {
        "q": "In a cascade for reactor temperature, which loop is the inner (slave) loop?",
        "opts": [
            ["The reactor temperature loop", False, "That's the master. It tells the inner loop what to do."],
            ["The jacket temperature loop", True, "Yes! The jacket loop is inside, quick and close to the valve."],
            ["The agitator speed loop", False, "The agitator isn't part of this cascade."],
            ["The level loop", False, "Level doesn't come into reactor temperature control here."],
        ],
        "title": "Cascade",
        "beats": [
            ["The outer, master loop watches the batch temperature. It is slow, because the batch is big.",
             [*box(20, 80, 120, 40, "reactor TIC", "b", 16), ["t", 150, 106, "master (slow)", 15, "b"]]],
            ["Its output isn't a valve position. It's a set point for the jacket temperature.",
             [["a", 80, 122, 80, 166, "k"], ["t", 92, 150, "jacket set point", 14, "k"]]],
            ["The inner, slave loop holds the jacket at that set point. It's fast, and fixes upsets like a change in water temperature before the batch feels them.",
             [*box(20, 170, 120, 40, "jacket TIC", "o", 16), ["t", 150, 196, "slave (fast)", 15, "o"], ["a", 80, 212, 80, 256, "k"], ["v", 80, 268],
              ["t", 100, 274, "valve", 15, "k"]]],
            ["Tune the inner loop first, then the outer one. The inner loop must be several times faster.",
             [["t", 20, 330, "tune inner first,", 18, "g"], ["t", 20, 356, "inner several × faster", 18, "g"]]],
        ],
        "summary": "In a reactor temperature cascade, the outer (master) loop controls batch temperature and its output is the set point of the inner (slave) loop, which controls jacket temperature by moving the valve. The fast inner loop corrects upsets such as cooling water temperature changes before the batch feels them. Tune the inner loop first; it must be several times faster than the outer loop.",
    },
    {
        "q": "A valve sits at 100 % for a long time, then the PV overshoots badly. What is this?",
        "opts": [
            ["Valve stiction", False, "Stiction makes small jumps. This is a big, late overshoot."],
            ["Integral windup", True, "Integral windup! The integral kept adding while the valve couldn't move."],
            ["Too much derivative", False, "Derivative doesn't store anything up. Something else does."],
            ["A faulty transmitter", False, "The transmitter read it right. The controller overdid it."],
        ],
        "title": "Windup",
        "beats": [
            ["The valve is wide open but still can't reach set point. The error stays.",
             [*axes(40, 64, 330, 230, "time", "PV"), ["p", "M44,110 L320,110", "g", 1.5], ["p", "M44,210 Q120,160 180,150", "b", 3],
              ["t", 60, 100, "set point", 13, "g"]]],
            ["Integral keeps adding up that error. The controller output winds far beyond 100 percent, inside the maths.",
             [["t", 20, 262, "integral keeps winding up", 18, "o"]]],
            ["When the PV finally gets there, the integral has to unwind first. The valve stays open too long, and the PV overshoots.",
             [["p", "M180,150 Q220,80 250,82 Q290,90 320,110", "r", 3], ["t", 230, 72, "overshoot", 15, "r"]]],
            ["Anti-windup clamps the integral when the output hits its limit. Check it's switched on in your DCS. Read the PID tuning guide on pharmacheme dot in for more.",
             [["t", 20, 300, "fix: anti-windup on", 19, "g"], ["t", 20, 340, "clamp integral at output limit", 16, "g"], ["t", 20, 380, "pharmacheme.in → PID tuning", 16, "b"]]],
        ],
        "summary": "When a valve is saturated, for example fully open, and the process still cannot reach set point, integral action keeps accumulating error and the controller output winds up far beyond its limit. When the process variable finally reaches set point, the integral must unwind before the valve moves, so the process overshoots. Anti-windup clamps the integral at the output limit; check it is enabled.",
    },
]

if __name__ == '__main__':
    main(globals())
