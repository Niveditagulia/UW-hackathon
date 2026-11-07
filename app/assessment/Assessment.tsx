"use client";
import { useState } from "react";
import { Sprout, ArrowRight, Check, ShieldCheck } from "lucide-react";
import GameRun, { RunResult } from "../GameRun";
import {
  games,
  levelNames,
  calibratedLevels,
  Stage,
} from "../../lib/game-rules";
export default function Assessment({ person }: { person: string }) {
  const [started, setStarted] = useState(false),
    [index, setIndex] = useState(0),
    [level, setLevel] = useState(1),
    [stages, setStages] = useState<Stage[]>([]),
    [done, setDone] = useState(false),
    [error, setError] = useState(""),
    [saving, setSaving] = useState(false),
    [saved, setSaved] = useState(false);
  const game = games[index];
  async function save(all: Stage[]) {
    setSaving(true);
    setError("");
    try {
      const r = await fetch("/api/calibration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stages: all }),
      });
      const data: any = await r.json();
      if (!r.ok) throw Error(data.error);
      setSaved(true);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Unable to save. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }
  function complete(result: RunResult) {
    const all = [
      ...stages,
      { game: game.id, level, correct: result.correct, rounds: 4 },
    ];
    setStages(all);
    if (result.correct >= 3 && level < 3) setLevel(level + 1);
    else if (index < 3) {
      setIndex(index + 1);
      setLevel(1);
    } else {
      setDone(true);
      save(all);
    }
  }
  return (
    <div className="assessment-page">
      <header>
        <a href="/login" className="new-brand">
          <span>
            <Sprout />
          </span>
          gentlegrove
        </a>
        <span>YOUR STARTING-LEVEL CHECK</span>
      </header>
      <main>
        {!started ? (
          <section className="assessment-intro">
            <span className="kicker">LET’S FIND YOUR SWEET SPOT</span>
            <h1>
              A little discovery.
              <br />
              <em>A plan that feels like you.</em>
            </h1>
            <p>
              Hello, {person.split(" ")[0]}. Try four short challenges so we can
              find a comfortable starting level for each game.
            </p>
            <div className="assessment-cards">
              {games.map((g) => (
                <div key={g.id}>
                  <span className={"mini-game " + g.color}>{g.symbol}</span>
                  <strong>{g.skill}</strong>
                  <small>{g.name}</small>
                </div>
              ))}
            </div>
            <div className="assessment-explain">
              <Check size={20} />
              <p>
                Start at level 1. Get 3 of 4 rounds correct to try the next
                level, up to level 3. We save the highest level you pass for
                each game. If level 1 feels difficult, we keep it gentle.
              </p>
            </div>
            <p className="muted">
              About 4–8 minutes, at your pace. Leaving before completion
              restarts the check. Your garden is not affected.
            </p>
            <button className="primary" onClick={() => setStarted(true)}>
              Find my starting levels <ArrowRight size={20} />
            </button>
            <div className="calibration-note">
              <ShieldCheck size={17} /> This is a game-level check, not a
              medical or cognitive diagnosis.
            </div>
          </section>
        ) : done ? (
          <section className="assessment-results">
            <div className="result-medal">
              <Check size={44} />
            </div>
            <span className="kicker">YOUR NEXT CHAPTER STARTS HERE</span>
            <h1>Made for your pace.</h1>
            <p>
              These are your starting levels. They stay the same until you
              choose to retake the check.
            </p>
            <div className="level-results">
              {games.map((g) => (
                <div key={g.id}>
                  <span className={"mini-game " + g.color}>{g.symbol}</span>
                  <strong>{g.name}</strong>
                  <span>
                    Level {calibratedLevels(stages)[g.id]} ·{" "}
                    {levelNames[calibratedLevels(stages)[g.id]]}
                  </span>
                </div>
              ))}
            </div>
            {error && (
              <p className="error-message" role="alert">
                {error}
              </p>
            )}
            {saved ? (
              <a href="/play" className="primary">
                Explore my dashboard <ArrowRight size={20} />
              </a>
            ) : (
              <button
                className="primary"
                disabled={saving}
                onClick={() => save(stages)}
              >
                {saving ? "Saving your levels…" : "Retry saving levels"}
              </button>
            )}
          </section>
        ) : (
          <section className="assessment-active">
            <div className="assessment-steps">
              {games.map((g, i) => (
                <span
                  key={g.id}
                  className={
                    i === index ? "current" : i < index ? "complete" : ""
                  }
                >
                  {i < index ? "✓" : i + 1}
                  <b>{g.skill}</b>
                </span>
              ))}
            </div>
            <div className="calibration-label">
              Game {index + 1} of 4 · Trying level {level} · No garden points at
              stake
            </div>
            <GameRun
              key={`${index}-${level}`}
              game={game.id}
              level={level}
              rounds={4}
              onComplete={complete}
            />
            <a className="text-button" href="/login">
              Exit check · restart later
            </a>
          </section>
        )}
      </main>
    </div>
  );
}
