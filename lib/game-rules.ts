export const games = [
  {
    id: 4,
    name: "Lantern Path",
    skill: "Memory",
    description: "Light up the places you remember.",
    color: "blue",
    symbol: "✦",
    instructions:
      "Remember the glowing tiles. When they fade, tap each tile that was lit. The order does not matter.",
  },
  {
    id: 5,
    name: "Suitcase Shuffle",
    skill: "Attention",
    description: "One little detail makes all the difference.",
    color: "coral",
    symbol: "▧",
    instructions:
      "One item in the suitcase is different. Find it and tap it. Look at the shape, not just the colour.",
  },
  {
    id: 6,
    name: "Number Navigator",
    skill: "Problem-solving",
    description: "Follow the pattern. Find your way forward.",
    color: "purple",
    symbol: "↗",
    instructions:
      "Find the missing number in the trail. The same amount is added or subtracted each step.",
  },
  {
    id: 7,
    name: "Signal Switch",
    skill: "Reaction & attention",
    description: "Read the signal. Make your next move.",
    color: "teal",
    symbol: "⇄",
    instructions:
      "Tap the button matching the arrow direction before the timer ends. Accuracy comes first.",
  },
];
export const levelNames = ["", "Gentle", "Steady", "Stretch"];
export type Activity = {
  id?: string;
  game: number;
  level: number;
  accuracy: number;
  speed: number;
  date: string;
};
export type Stage = {
  game: number;
  level: number;
  correct: number;
  rounds: number;
};
export function calibratedLevels(stages: Stage[]) {
  const levels: Record<string, number> = {};
  let index = 0;
  for (const game of games) {
    let best = 1;
    for (let level = 1; level <= 3; level++) {
      const s = stages[index++];
      if (
        !s ||
        s.game !== game.id ||
        s.level !== level ||
        s.rounds !== 4 ||
        !Number.isInteger(s.correct) ||
        s.correct < 0 ||
        s.correct > 4
      )
        throw Error("Incomplete assessment. Please finish every game.");
      if (s.correct < 3) break;
      best = level;
    }
    levels[game.id] = best;
  }
  if (index !== stages.length) throw Error("Invalid assessment sequence.");
  return levels;
}
export function gardenHealth(rows: Activity[]) {
  return rows
    .filter((r) => r.game >= 4 && r.game <= 7)
    .reduce(
      (health, r) =>
        Math.min(100, Math.max(10, health + (r.accuracy >= 75 ? 10 : -5))),
      60,
    );
}
export function performanceTrend(rows: Activity[]) {
  // Inputs must already be filtered to the same game and level. Calibration is separate.
  if (rows.length < 8)
    return {
      status: "building",
      baseline: null,
      change: null,
      message:
        "Complete 8 sessions at this game and level to compare your first 5 with your latest 3.",
    };
  const baseline = rows.slice(0, 5).reduce((n, r) => n + r.accuracy, 0) / 5;
  const latest = rows.slice(-3),
    recent = latest.reduce((n, r) => n + r.accuracy, 0) / 3;
  const change = recent - baseline;
  const spread = new Set(latest.map((r) => r.date.slice(0, 10))).size >= 3;
  const declining =
    spread &&
    latest.every((r) => r.accuracy <= baseline - 10) &&
    latest[2].accuracy < latest[0].accuracy &&
    latest[1].accuracy <= latest[0].accuracy &&
    latest[2].accuracy <= latest[1].accuracy;
  return {
    status: declining ? "declining" : "observed",
    baseline,
    change,
    message: declining
      ? "A sustained downward pattern in game accuracy is visible across the latest 3 sessions on separate days. Staff may wish to review the context."
      : `The latest 3 sessions average ${Math.abs(change).toFixed(1)} percentage points ${change < 0 ? "below" : "above"} the first 5 sessions. No sustained downward pattern meets the review rule.`,
  };
}
export function gameName(id: number) {
  return (
    games.find((g) => g.id === id)?.name ||
    [
      "Garden memory (original)",
      "Find the flower (original)",
      "What comes next? (original)",
      "Morning sunshine (original)",
    ][id] ||
    "Activity"
  );
}
