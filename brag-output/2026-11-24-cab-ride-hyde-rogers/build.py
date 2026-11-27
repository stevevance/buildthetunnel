#!/opt/homebrew/bin/python3
"""
Build the cab-ride film from start to finish.

    ./build.py                 # everything: audio, timing, check, render, open
    ./build.py --no-audio      # reuse the audio already in assets/audio
    ./build.py --no-render     # stop after the check (fast)
    ./build.py --frames 22,42,145   # also save still frames at those seconds
    ./build.py --no-open       # don't open the result in QuickTime
    ./build.py --gpu           # encode the video on the Mac's hardware H.264 encoder
    ./build.py --size 720p     # frame size: 720p, 1080p or 4k (it stays as set until changed again)
    ./build.py --direct        # render straight from three.js on this Mac's GPU (tools/direct-render.mjs), not through
                               # HyperFrames' screenshot capture: about 4.6 frames/s at 4K on an M1, against about 0.05

Run it as ./build.py (not "python3 build.py"): the first line picks Homebrew's Python, which is
built for Apple silicon, where "python3" on this Mac is Anaconda's Intel build running under Rosetta.

Steps, in order:
  1. Speak the announcements below with the macOS voice (`say`), make the three
     chimes with ffmpeg, and synthesise the sound of the train (make_rumble,
     which follows the train's speed). Skipped with --no-audio.
  2. Time every clip to the ride and set the film's length
     (tools/place-audio.mjs; the ride's own timing lives in assets/cab-ride.js).
  3. Run the HyperFrames check and stop if it reports an error.
  4. Render to cab-ride-full-route-vN.mp4, N being one more than the newest (with --direct, by tools/direct-render.mjs).
  5. Open it in QuickTime Player.

What to change where:
  * what the announcer says, or the voice ............ ANNOUNCEMENTS / VOICE below
  * the messages played between stations ............. the two "notice" lines of ANNOUNCEMENTS
    (tools/place-audio.mjs decides where each goes: see NOTICES there)
  * how the chimes sound ............................. CHIMES below
  * speed-up, dwell, the train's performance, banking . constants in assets/cab-ride.js
    (SPEEDUP, DWELL, DWELL_REAL, TRAIN, BANK_GAIN, BANK_MAX)
  * everything you see (train, stations, buildings) .. assets/cab-ride.js

Needs: macOS (`say`), ffmpeg, node, and npx (for the hyperframes CLI); for --direct, Google Chrome and
`npm install` (puppeteer-core).
"""
import argparse
import glob
import json
import os
import re
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
AUDIO = os.path.join(HERE, "assets", "audio")
HYPERFRAMES = ["npx", "--yes", "hyperframes@0.9.52"]   # same pinned version as package.json

# The macOS system voice. List the installed ones with:  say -v '?'
VOICE = "Zoe (Enhanced)"

# The stops after 59th, in order: how the announcer says each, what you can change to there, and the side the doors
# open on (as in assets/cab-ride.js, S.doors: the train keeps to the left-hand track the whole way, so the left, but
# for the islands from 47th to 18th, which are on its right).
STOPS = [
    ("55th, 56th, and 57th Streets", "Transfer to South Shore Line trains.", "left"),
    ("51st and 53rd Streets", "", "left"),
    ("47th Street, Kenwood", "", "right"),
    ("Oakwood Boulevard", "", "right"),
    ("27th Street", "", "right"),
    ("McCormick Place", "Transfer to South Shore Line trains.", "right"),
    ("18th Street", "", "right"),
    ("Roosevelt", "Transfer to Red, Green, and Orange Line trains, and buses to the Museum Campus.", "left"),
    ("Taylor and Clinton", "", "left"),
    ("Union Station", "Transfer to Blue Line, X5, and X6 trains, the G, J, K, M, and P lines, Amtrak, and the O'Hare Flyer.", "left"),
    ("Randolph and Clinton", "Transfer to Green and Pink Line trains, and the A, C, and E lines.", "left"),
    ("Chicago and Halsted", "", "left"),
    ("Division and Elston", "", "left"),
    ("Clybourn", "Transfer to Union Pacific Northwest trains.", "left"),
    ("Addison and Lincoln", "Transfer to Brown Line trains.", "left"),
    ("Ravenswood", "", "left"),
    ("Peterson and Ridge", "", "left"),
    ("Rogers Park", "", "left"),
]
# File name (in assets/audio, without .m4a) -> what is said.
# next1..next18 play on the approach to each stop, this1..this18 once the doors open (only at the stops shown in full:
# tools/place-audio.mjs decides).
ANNOUNCEMENTS = {"welcome": "This is an X1 train to Highland Park."}
for i, (name, transfer, doors) in enumerate(STOPS, 1):
    ANNOUNCEMENTS[f"next{i}"] = " ".join(x for x in [f"Next stop, {name}.", transfer, f"Doors open on the {doors}."] if x)
    ANNOUNCEMENTS[f"this{i}"] = f"This is {name}."
ANNOUNCEMENTS.update({
    "closing": "Doors closing.",
    # Played once each, between stations, wherever there is room (tools/place-audio.mjs).
    "notice1": "This is a walkthrough train. Please make use of all available space.",
    "notice2": "Eating, smoking, gambling, and drinking out of glass containers is prohibited on CrossTowner trains.",
})
# Words the voice needs spelled differently to say them right (the captions keep the real spelling).
SAY_AS = {"CrossTowner": "Cross Towner"}
# The film's audio files are AAC (.m4a): uncompressed WAV made the train sound and the music 64 MB each, over half
# of what goes to a render droplet.
AAC = ["-c:a", "aac", "-b:a", "192k"]
# Frame sizes for --size.
SIZES = {"720p": (1280, 720), "1080p": (1920, 1080), "4k": (3840, 2160)}

# Each chime is a run of bell-like notes: (start in seconds, pitch in Hz, how fast it dies away).
# A note is a sine tone plus a quiet octave above it, fading exponentially.
CHIMES = {
    # before each "Next stop": three rising notes, C-E-G
    "prechime": {"notes": [(0.00, 523.25, 3.2), (0.32, 659.25, 3.2), (0.64, 783.99, 2.6)],
                 "overtone": 0.25, "gain": 0.42, "length": 2.2, "fade": 0.5},
    # doors open: ding-dong
    "chime": {"notes": [(0.00, 880.0, 6.0), (0.38, 660.0, 3.5)],
              "overtone": 0.0, "gain": 0.5, "length": 1.28, "fade": 0.3},
    # doors closing: four quick alternating notes, B-G-B-G
    "closechime": {"notes": [(0.00, 987.77, 5.0), (0.28, 783.99, 5.0), (0.56, 987.77, 5.0), (0.84, 783.99, 3.5)],
                   "overtone": 0.2, "gain": 0.4, "length": 1.7, "fade": 0.4},
}


def run(cmd, **kw):
    """Run a command in the project folder; stop the build if it fails."""
    return subprocess.run(cmd, cwd=HERE, check=True, **kw)


def make_announcements():
    os.makedirs(AUDIO, exist_ok=True)
    for name, text in ANNOUNCEMENTS.items():
        aiff = os.path.join(AUDIO, name + ".aiff")
        out = os.path.join(AUDIO, name + ".m4a")
        for word, spoken in SAY_AS.items():
            text = text.replace(word, spoken)
        run(["say", "-v", VOICE, "-o", aiff, text])
        # even out the loudness, and convert to the 48 kHz stereo AAC the film uses
        run(["ffmpeg", "-v", "error", "-y", "-i", aiff, "-af", "loudnorm=I=-16:TP=-1.5",
             "-ar", "48000", "-ac", "2"] + AAC + [out])
        os.remove(aiff)
    print(f"  spoke {len(ANNOUNCEMENTS)} announcements with {VOICE}")


def make_chimes():
    for name, c in CHIMES.items():
        terms = []
        for start, hz, decay in c["notes"]:
            t = f"(t-{start})"
            tone = f"sin(2*PI*{hz}*{t})"
            if c["overtone"]:
                tone = f"({tone}+{c['overtone']}*sin(2*PI*{hz * 2}*{t}))"
            terms.append(f"gt(t,{start - 1e-6})*{tone}*exp(-{decay}*{t})")
        expr = f"{c['gain']}*({'+'.join(terms)})"
        fade_at = c["length"] - c["fade"]
        run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi",
             "-i", f"aevalsrc='{expr}':d={c['length']}:s=48000",
             "-af", f"afade=t=in:d=0.008,afade=t=out:st={fade_at}:d={c['fade']},aformat=channel_layouts=stereo"]
            + AAC + [os.path.join(AUDIO, name + ".m4a")])
    print(f"  made {len(CHIMES)} chimes")


def make_rumble():
    """The sound of the train: a low rumble and roar that follow its speed, a faint motor whine, and
    a ventilation hum that stays when it stops. Synthesised from noise; nothing recorded."""
    import math, random, struct, wave
    ride = json.loads(subprocess.run(["node", "tools/place-audio.mjs", "--ride"], cwd=HERE, check=True,
                                     capture_output=True, text=True).stdout)
    mph, (t_in, t_out), length = ride["mph"], ride["tunnel"], ride["duration"]
    RATE, TOP_MPH = 24000, 65.0
    rng = random.Random(7)                       # the same "noise" every build
    k_low = 1 - math.exp(-2 * math.pi * 85 / RATE)      # one-pole low-pass filters at 85, 160 and 520 Hz
    k_mid1 = 1 - math.exp(-2 * math.pi * 160 / RATE)
    k_mid2 = 1 - math.exp(-2 * math.pi * 520 / RATE)
    low = low2 = m1 = m2 = phase = 0.0
    frames = bytearray()
    n = int(length * RATE)
    for i in range(n):
        t = i / RATE
        j = min(int(t * 10), len(mph) - 2)
        speed = mph[j] + (mph[j + 1] - mph[j]) * (t * 10 - j)           # mph right now
        v = min(speed / TOP_MPH, 1.2)
        inside = 1.0 if t_in < t < t_out else 0.6                       # louder in the tunnel
        w = rng.uniform(-1, 1)
        low += k_low * (w - low); low2 += k_low * (low - low2)          # deep rumble (two poles)
        m1 += k_mid1 * (w - m1); m2 += k_mid2 * (w - m2)                # roar: what's between 160 and 520 Hz
        phase += 2 * math.pi * (60 + 7.5 * speed) / RATE                # motor whine rises with speed
        whine = (math.sin(phase) + 0.4 * math.sin(2 * phase)) * 0.012 * min(1.0, v * 2.5)
        hum = 0.006 * math.sin(2 * math.pi * 118 * t) + low2 * 0.25     # ventilation, always there
        x = (low2 * 5.5 * (0.1 + 0.9 * v) + (m2 - m1) * 0.9 * v ** 1.5) * inside + whine + hum
        x *= min(1.0, t / 1.0) * min(1.0, max(0.0, (length - t) / 2.5))  # fade in and out
        frames += struct.pack("<h", int(max(-1.0, min(1.0, x * 0.55)) * 32767))
    mono = os.path.join(AUDIO, "rumble-mono.wav")
    with wave.open(mono, "wb") as f:
        f.setnchannels(1); f.setsampwidth(2); f.setframerate(RATE); f.writeframes(bytes(frames))
    run(["ffmpeg", "-v", "error", "-y", "-i", mono, "-ar", "48000", "-ac", "2"] + AAC + [os.path.join(AUDIO, "rumble.m4a")])
    os.remove(mono)
    print(f"  made the train sound ({length} s)")


def set_size(size):
    """Set the film's frame size in index.html: the page, the composition, the canvas and the scene all take it from there."""
    w, h = SIZES[size]
    path = os.path.join(HERE, "index.html")
    html = open(path).read()
    head, sep, rest = html.partition("<!-- audio:start")        # the audio clips' times are left alone
    widths, heights = "|".join(str(v[0]) for v in SIZES.values()), "|".join(str(v[1]) for v in SIZES.values())
    tail_at = rest.index("<!-- audio:end -->")
    resize = lambda text: re.sub(rf"(?<![\d.])({heights})(?![\d.])", str(h), re.sub(rf"(?<![\d.])({widths})(?![\d.])", str(w), text))
    open(path, "w").write(resize(head) + sep + rest[:tail_at] + resize(rest[tail_at:]))
    print(f"  frame size {w} x {h}")


def check():
    out = subprocess.run(HYPERFRAMES + ["check", "--json"], cwd=HERE, capture_output=True, text=True).stdout
    report = json.loads(out[out.index("{"):])
    findings = [(f["severity"], f["code"], f.get("message", ""))
                for part in report.values() if isinstance(part, dict)
                for f in part.get("findings", [])]
    for severity, code, message in findings:
        if severity != "info":
            print(f"  {severity}: {code}: {message[:110]}")
    errors = [f for f in findings if f[0] == "error"]
    if errors or not report.get("ok", False):
        sys.exit("The check found errors; nothing was rendered.")


def next_output():
    versions = [int(m.group(1)) for f in glob.glob(os.path.join(HERE, "cab-ride-full-route-v*.mp4"))
                if (m := re.search(r"-v(\d+)\.mp4$", f))]
    return f"cab-ride-full-route-v{max(versions, default=1) + 1}.mp4"


def main():
    ap = argparse.ArgumentParser(description="Build the cab-ride film.")
    ap.add_argument("--no-audio", action="store_true", help="reuse the audio already in assets/audio")
    ap.add_argument("--no-render", action="store_true", help="stop after the check")
    ap.add_argument("--no-open", action="store_true", help="don't open the result in QuickTime Player")
    ap.add_argument("--frames", metavar="SECONDS", help="also save still frames, e.g. 22,42,145")
    ap.add_argument("--output", help="file name for the render (default: the next vN)")
    ap.add_argument("--gpu", action="store_true", help="encode on the hardware (VideoToolbox) encoder instead of in software")
    ap.add_argument("--size", choices=SIZES, help="frame size (default: whatever index.html is set to)")
    ap.add_argument("--direct", action="store_true", help="render straight from three.js on the GPU (tools/direct-render.mjs)")
    args = ap.parse_args()

    if args.size:
        set_size(args.size)

    if not args.no_audio:
        print("1. Audio")
        make_announcements()
        make_chimes()
        make_rumble()
    with open(os.path.join(AUDIO, "announcements.json"), "w") as f:      # for the open captions
        json.dump(ANNOUNCEMENTS, f, indent=1)
    print("2. Timing")
    run(["node", "tools/place-audio.mjs"])
    print("3. Check")
    check()
    if args.frames:
        print("   Frames")
        run(HYPERFRAMES + ["snapshot", "--at", args.frames])
    if args.no_render:
        return
    out = args.output or next_output()
    print(f"4. Render -> {out}  (a few minutes)")
    if args.direct:
        run(["node", "tools/direct-render.mjs", "--output", out])
    else:
        run(HYPERFRAMES + ["render", "--output", out] + (["--gpu"] if args.gpu else []))
    if not args.no_open:
        run(["open", "-a", "QuickTime Player", out])
    print(f"Done: {os.path.join(HERE, out)}")


if __name__ == "__main__":
    main()
