// Quality used to be a manual 1-5 star pick, but that's redundant with hours
// slept + wake-ups (which she's already entering) and just adds friction.
// Recommended range is ~7-8.5h; each wake-up during the night knocks it down.
export function estimateSleepQuality(hours: number, wakeUps: number): number {
  const idealMid = 7.75;
  const hoursScore = 5 - Math.abs(hours - idealMid) / 1.2;
  const score = hoursScore - wakeUps * 0.6;
  return Math.min(5, Math.max(1, Math.round(score)));
}
