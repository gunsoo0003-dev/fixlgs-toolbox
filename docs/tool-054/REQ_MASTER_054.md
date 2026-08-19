# TOOL054 REQ MASTER

- Tool: 054 타이머·스톱워치 / Timer & Stopwatch / タイマー・ストップウォッチ
- Category: F. 날짜·시간 도구
- Route candidate: `/{locale}/timer-stopwatch`
- Source of truth: `FIXLGS_TOOLBOX_054_타이머_스톱워치_제작전달서.pdf`

## Mandatory functional requirements
1. Countdown with direct H/M/S input.
2. Stopwatch with start/pause/resume/reset.
3. Lap/Split records: lap duration plus total elapsed.
4. Repeat timer: Work / Rest / Rounds, Work→Rest automatic state transition.
5. Real elapsed/remaining time from monotonic/high-resolution clock anchor; display refresh is not the source of truth.
6. Re-evaluate current time after tab/background delay.
7. Completion visual state and audible alert when browser policy allows; audio prepared after user gesture.
8. Browser-local operation; no login/server/external API.
9. KO/EN/JA UI and content.
10. Service limits shared in `TOOL054_LIMITS`: countdown 24:59:59, rounds 99, laps 1000, stopwatch display 99:59:59.99.

## Recommended first-release requirements implemented
- Presets: 1/3/5/10/15/25/30/45/60 min.
- Fullscreen.
- Keyboard shortcuts: Space/L/R/F; ignored while an editable field has focus.
- Text result copy.
- Reset is visually separated from the primary start/pause action.

## Explicit first-release exclusions
- Multiple simultaneous timers.
- Dedicated Pomodoro/HIIT preset library.
- Server history/account/sync/share URL.
- CSV/JSON/Excel export.
- Voice coach/AI coach.
- Wake-lock dependency or background-policy bypass.

## Main implementation files
- `app/[locale]/timer-stopwatch/page.tsx`
- `components/timer-stopwatch-page.tsx`
- `components/timer-stopwatch-tool.tsx`
- `components/timer-stopwatch-tool.module.css`
- `lib/tool-054-timer-stopwatch.ts`
