"use client";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Flame,
  Target,
  Trophy,
  X,
  RotateCcw,
  Flower2,
} from "lucide-react";
import AppShell from "./AppShell";
import GameArt from "./GameArt";
import Garden from "./Garden";
import GameRun, { RunResult } from "./GameRun";
import { games, levelNames, gardenHealth, Activity } from "../lib/game-rules";
export default function GameHome({
  person,
  staff,
  levels,
}: {
  person: string;
  staff: boolean;
  levels: Record<string, number>;
}) {
  const [rows, setRows] = useState<Activity[]>([]),
    [loaded, setLoaded] = useState(false),
    [error, setError] = useState(""),
    [active, setActive] = useState<number | null>(null),
    [result, setResult] = useState<RunResult | null>(null),
    [saving, setSaving] = useState(false),
    [saved, setSaved] = useState(false),
    [sessionId, setSessionId] = useState(""),
    [garden, setGarden] = useState(false);
  useEffect(() => {
    setGarden(new URLSearchParams(window.location.search).has("garden"));
    refresh();
  }, []);
  async function refresh() {
    try {
      const r = await fetch("/api/sessions");
      if (!r.ok) throw Error("Could not load your progress. Please reload.");
      setRows((await r.json()) as Activity[]);
      setLoaded(true);
    } catch (e) {
      setError(String(e));
    }
  }
  function open(id: number) {
    setActive(id);
    setResult(null);
    setSaved(false);
    setSessionId(crypto.randomUUID());
    setError("");
  }
  async function finish(r: RunResult) {
    setResult(r);
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...r,
          id: sessionId,
          game: active,
          level: levels[active!],
        }),
      });
      const data: any = await response.json();
      if (!response.ok) throw Error(data.error);
      setSaved(true);
      await refresh();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Your game could not be saved. Retry below.",
      );
    } finally {
      setSaving(false);
    }
  }
  const health = gardenHealth(rows),
    played = rows.filter((r) => r.game >= 4),
    wins = played.filter((r) => r.accuracy >= 75).length;
  const days = [
    ...new Set(played.map((r) => new Date(r.date).toLocaleDateString())),
  ];
  return (
    <AppShell staff={staff} active={garden ? "garden" : "play"} person={person}>
      <div className="dashboard-heading">
        <div>
          <span className="kicker">A FRESH DAY. A NEW DISCOVERY.</span>
          <h1>
            {garden
              ? "Your world, growing with you."
              : `Ready for a little play, ${person.split(" ")[0]}?`}
          </h1>
          <p>
            {garden
              ? "Every win brings new life. Every setback can be restored."
              : "Your games. Your starting levels. A little challenge that feels just right."}
          </p>
        </div>
        <a className="quiet-link" href="/assessment">
          Recheck my levels <RotateCcw size={16} />
        </a>
      </div>
      {error && !active && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}
      {garden ? (
        <section className="garden-feature">
          <Garden health={health} large />
          <div>
            <span className="kicker">YOUR LIVING GARDEN</span>
            <h2>
              {health >= 80
                ? "Looking beautifully alive."
                : health >= 40
                  ? "A little care goes a long way."
                  : "Your garden is ready to recover."}
            </h2>
            <div className="vitality-value">
              {loaded ? health : "—"}
              <span>/ 100 vitality</span>
            </div>
            <div className="vitality-track">
              <i style={{ width: health + "%" }} />
            </div>
            <p>
              Win a game to add 10 vitality. A loss reduces vitality by 5 and
              wilts some flowers. Every plant can bloom again. Taking a break
              never changes your garden.
            </p>
            <button className="primary" onClick={() => open(4)}>
              Play to replenish <Flower2 size={20} />
            </button>
          </div>
        </section>
      ) : (
        <section className="training-hero">
          <div className="hero-writing">
            <span className="hero-badge">
              <span /> YOUR PERSONAL TRAINING PLAN
            </span>
            <h2>
              Small challenges.
              <br />
              <span>Bright possibilities.</span>
            </h2>
            <p>
              A little focus, a spark of discovery, and a garden
              <br className="desktop-break" /> that grows with every win. Your
              next moment starts here.
            </p>
            <button
              className="primary coral-button"
              disabled={!loaded}
              onClick={() => open(4)}
            >
              Start today’s play <ArrowRight size={20} />
            </button>
            <div className="hero-bottom">
              <Target size={16} /> Set to your assessed levels <span>•</span> 8
              rounds per game
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-orbit" />
            <span className="floating-shape shape-one">✦</span>
            <span className="floating-shape shape-two">↗</span>
            <div className="hero-card card-back">
              <span>3 → 6 → ?</span>
              <small>A NEW WAY TO THINK</small>
            </div>
            <div className="hero-card card-front">
              <div>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <i key={n} className={[1, 4, 6].includes(n) ? "on" : ""}>
                    {[1, 4, 6].includes(n) ? "✦" : ""}
                  </i>
                ))}
              </div>
              <span>Make a little discovery.</span>
            </div>
            <span className="floating-shape shape-three">✧</span>
          </div>
        </section>
      )}
      <div className="dashboard-columns">
        <div>
          <div className="section-head">
            <div>
              <span className="kicker">A LITTLE VARIETY FOR YOUR MIND</span>
              <h2>Your daily playground</h2>
            </div>
            <span className="count-chip">4 games · made for you</span>
          </div>
          <div className="new-game-grid">
            {games.map((g) => (
              <button
                className="new-game-card"
                key={g.id}
                disabled={!loaded}
                onClick={() => open(g.id)}
              >
                <GameArt game={g.id} />
                <div className="game-card-copy">
                  <div>
                    <span className={"skill-tag " + g.color}>{g.skill}</span>
                    <span className="level-chip">Level {levels[g.id]}</span>
                  </div>
                  <h3>{g.name}</h3>
                  <p>{g.description}</p>
                  <div className="game-card-footer">
                    <span>{levelNames[levels[g.id]]} · 8 rounds</span>
                    <span className="play-circle">
                      <ArrowUpRight size={21} />
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
        <div className="dashboard-rail">
          <section className="garden-widget">
            <div className="section-head">
              <h3>Your little world</h3>
              <Flower2 size={20} />
            </div>
            <Garden health={health} />
            <div className="garden-status">
              <strong>
                {loaded ? health : "—"}
                <small> / 100 vitality</small>
              </strong>
              <span>
                {health >= 80
                  ? "In bloom"
                  : health >= 40
                    ? "Growing"
                    : "Needs a little care"}
              </span>
            </div>
            <div className="vitality-track">
              <i style={{ width: health + "%" }} />
            </div>
            <p>Every win brings a little more life.</p>
            <button className="quiet-link" onClick={() => setGarden(true)}>
              Visit my garden <ArrowRight size={17} />
            </button>
          </section>
          <section className="milestone-widget">
            <span className="kicker">YOUR LITTLE VICTORIES</span>
            <div>
              <span className="stat-icon">
                <Trophy size={20} />
              </span>
              <strong>{wins}</strong>
              <span>games won</span>
            </div>
            <div>
              <span className="stat-icon">
                <Flame size={20} />
              </span>
              <strong>{days.length}</strong>
              <span>days of discovery</span>
            </div>
            <a href="/report">
              See my progress <ArrowRight size={18} />
            </a>
          </section>
          <section className="gentle-note">
            <span>✧</span>
            <p>
              Progress isn’t a straight line.
              <br />
              <strong>Every return is a fresh start.</strong>
            </p>
          </section>
        </div>
      </div>
      {active !== null && (
        <div className="game-overlay">
          <section
            className="play-dialog"
            role="dialog"
            aria-modal="true"
            aria-label="Game activity"
            onKeyDown={(e) => {
              if (e.key === "Escape" && !saving) {
                setActive(null);
              }
              if (e.key === "Tab") {
                const items =
                  e.currentTarget.querySelectorAll<HTMLButtonElement>(
                    "button:not([disabled]),a[href]",
                  );
                const first = items[0],
                  last = items[items.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                  e.preventDefault();
                  last?.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                  e.preventDefault();
                  first?.focus();
                }
              }
            }}
          >
            <button
              autoFocus
              className="close-game"
              aria-label="Close game; incomplete games do not affect the garden"
              disabled={saving}
              onClick={() => setActive(null)}
            >
              <X size={24} />
            </button>
            {result ? (
              <div className="game-result">
                <span
                  className={
                    "result-medal " + (result.correct >= 6 ? "win" : "loss")
                  }
                >
                  {result.correct >= 6 ? (
                    <Trophy size={40} />
                  ) : (
                    <Flower2 size={40} />
                  )}
                </span>
                <span className="kicker">
                  {result.correct >= 6
                    ? "A LITTLE VICTORY"
                    : "A CHANCE TO TRY AGAIN"}
                </span>
                <h2>
                  {result.correct >= 6
                    ? "Your garden says thank you."
                    : "A little wilt. A fresh opportunity."}
                </h2>
                <p>
                  {result.correct} of 8 correct ·{" "}
                  {Math.round((result.correct / 8) * 100)}% accuracy
                </p>
                <div className="garden-delta">
                  {saved
                    ? result.correct >= 6
                      ? "+10 garden vitality"
                      : "−5 garden vitality"
                    : "Garden updates after saving"}
                  <small>Vitality stays between 10 and 100.</small>
                </div>
                <Garden health={health} />
                {error && (
                  <p className="error-message" role="alert">
                    {error}
                  </p>
                )}
                {saved ? (
                  <button className="primary" onClick={() => setActive(null)}>
                    Back to my dashboard <ArrowRight size={18} />
                  </button>
                ) : (
                  <button
                    className="primary"
                    disabled={saving}
                    onClick={() => finish(result)}
                  >
                    {saving ? "Saving your result…" : "Retry saving result"}
                  </button>
                )}
              </div>
            ) : (
              <GameRun
                game={active}
                level={levels[active]}
                onComplete={finish}
              />
            )}
          </section>
        </div>
      )}
    </AppShell>
  );
}
