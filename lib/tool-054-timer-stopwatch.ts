export const TOOL054_LIMITS = Object.freeze({
  maxCountdownSeconds: 24 * 60 * 60 + 59 * 60 + 59,
  maxRepeatRounds: 99,
  maxLaps: 1000,
  maxStopwatchMs: (99 * 60 * 60 + 59 * 60 + 59) * 1000 + 990,
});

export type Tool054Hms = Readonly<{ hours: number; minutes: number; seconds: number }>;
export type Tool054RepeatConfig = Readonly<{ workSeconds: number; restSeconds: number; rounds: number }>;
export type Tool054RepeatPhase = "work" | "rest" | "completed";
export type Tool054RepeatState = Readonly<{
  phase: Tool054RepeatPhase;
  round: number;
  phaseRemainingMs: number;
  completed: boolean;
}>;

export function tool054HmsToSeconds(value: Tool054Hms): number {
  const { hours, minutes, seconds } = value;
  if (![hours, minutes, seconds].every(Number.isInteger)) throw new RangeError("INVALID_TIME");
  if (hours < 0 || minutes < 0 || seconds < 0 || minutes > 59 || seconds > 59) throw new RangeError("INVALID_TIME");
  const total = hours * 3600 + minutes * 60 + seconds;
  if (total > TOOL054_LIMITS.maxCountdownSeconds) throw new RangeError("COUNTDOWN_LIMIT");
  return total;
}

export function tool054ValidateRepeat(config: Tool054RepeatConfig): Tool054RepeatConfig {
  if (![config.workSeconds, config.restSeconds, config.rounds].every(Number.isInteger)) throw new RangeError("INVALID_REPEAT");
  if (config.workSeconds <= 0 || config.workSeconds > TOOL054_LIMITS.maxCountdownSeconds) throw new RangeError("WORK_RANGE");
  if (config.restSeconds < 0 || config.restSeconds > TOOL054_LIMITS.maxCountdownSeconds) throw new RangeError("REST_RANGE");
  if (config.rounds < 1 || config.rounds > TOOL054_LIMITS.maxRepeatRounds) throw new RangeError("ROUNDS_RANGE");
  return config;
}

export function tool054ResolveRepeatElapsed(config: Tool054RepeatConfig, elapsedMs: number): Tool054RepeatState {
  tool054ValidateRepeat(config);
  const elapsed = Math.max(0, elapsedMs);
  const workMs = config.workSeconds * 1000;
  const restMs = config.restSeconds * 1000;
  const cycleMs = workMs + restMs;
  if (restMs === 0) {
    const totalMs = workMs * config.rounds;
    if (elapsed >= totalMs) return { phase: "completed", round: config.rounds, phaseRemainingMs: 0, completed: true };
    const round = Math.floor(elapsed / workMs) + 1;
    const within = elapsed - (round - 1) * workMs;
    return { phase: "work", round, phaseRemainingMs: Math.max(0, workMs - within), completed: false };
  }
  const totalMs = workMs * config.rounds + restMs * Math.max(0, config.rounds - 1);
  if (elapsed >= totalMs) return { phase: "completed", round: config.rounds, phaseRemainingMs: 0, completed: true };
  const completeCycles = Math.floor(elapsed / cycleMs);
  const round = Math.min(config.rounds, completeCycles + 1);
  const within = elapsed - completeCycles * cycleMs;
  if (round === config.rounds && within >= workMs) return { phase: "completed", round, phaseRemainingMs: 0, completed: true };
  if (within < workMs) return { phase: "work", round, phaseRemainingMs: workMs - within, completed: false };
  return { phase: "rest", round, phaseRemainingMs: restMs - (within - workMs), completed: false };
}

export function tool054FormatClock(ms: number, hundredths = false): string {
  const safe = Math.max(0, Math.floor(ms));
  const totalSeconds = Math.floor(safe / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const base = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  return hundredths ? `${base}.${String(Math.floor((safe % 1000) / 10)).padStart(2, "0")}` : base;
}

export function tool054LapDuration(totalMs: number, previousTotalMs: number): number {
  return Math.max(0, totalMs - previousTotalMs);
}
