// Quality used to be a manual 1-5 star pick, but that's redundant with hours
// slept + wake-ups (which she's already entering) and just adds friction.
// Recommended range is ~7-8.5h; each wake-up during the night knocks it down.
export function estimateSleepQuality(hours: number, wakeUps: number): number {
  const idealMid = 7.75;
  const hoursScore = 5 - Math.abs(hours - idealMid) / 1.2;
  const score = hoursScore - wakeUps * 0.6;
  return Math.min(5, Math.max(1, Math.round(score)));
}

// Asking for a fixed "hours slept" number doesn't hold up when bedtime and
// wake-up time genuinely shift (weekdays vs. weekends) — better to ask for
// both times and derive it. Handles the overnight wrap (e.g. 23:00 -> 07:00).
export function computeSleepHours(bedtime: string, wakeTime: string): number {
  const [bedH, bedM] = bedtime.split(":").map(Number);
  const [wakeH, wakeM] = wakeTime.split(":").map(Number);
  const bedMinutes = bedH * 60 + bedM;
  const wakeMinutes = wakeH * 60 + wakeM;
  const diffMinutes = ((wakeMinutes - bedMinutes + 1440) % 1440) || 1440;
  return Math.round((diffMinutes / 60) * 4) / 4;
}
