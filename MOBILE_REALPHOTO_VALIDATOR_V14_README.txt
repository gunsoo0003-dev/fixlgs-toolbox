V14 FULL FLOW

Run all 001-024:
node .\scripts\run-mobile-real-photo-001-024.mjs

Run one tool:
node .\scripts\run-mobile-real-photo-001-024.mjs --only 1

PASS path:
web upload -> Android media chooser -> Gallery -> Recents -> 4th photo -> return to Chrome -> immediate small scroll -> attachment ready -> tool action -> result ready -> actual download click -> new/changed file in /sdcard/Download with size > 0 -> PASS

TOOL018 is metadata-special and does not require a download for the general pass flow.
