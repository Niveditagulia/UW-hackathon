"use client";
import { useState, useEffect, useRef } from "react";
import { ArrowRight, Volume2, Check, RotateCcw } from "lucide-react";
import { games, levelNames } from "../lib/game-rules";
export type RunResult = { correct: number; rounds: number; speed: number };
type Question = {
  targets: number[];
  size: number;
  odd: number;
  shape: string;
  different: string;
  sequence: number[];
  answer: number;
  options: number[];
  direction: number;
};
function shuffled<T>(items: T[]) {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function makeQuestion(level: number): Question {
  const size = level === 3 ? 16 : 9,
    targets = shuffled(Array.from({ length: size }, (_, i) => i)).slice(
      0,
      level + 1,
    );
  const start = 2 + Math.floor(Math.random() * 12),
    step =
      level === 1
        ? 2
        : level === 2
          ? 3 + Math.floor(Math.random() * 3)
          : -(2 + Math.floor(Math.random() * 4));
  const first = step < 0 ? 25 + Math.floor(Math.random() * 10) : start;
  const sequence = Array.from({ length: 4 }, (_, i) => first + i * step),
    answer = first + 4 * step;
  return {
    targets,
    size,
    odd: Math.floor(Math.random() * (level === 1 ? 6 : level === 2 ? 9 : 12)),
    shape: level === 1 ? "◆" : level === 2 ? "♧" : "↗",
    different: level === 1 ? "●" : level === 2 ? "♤" : "↖",
    sequence,
    answer,
    options: shuffled([answer, answer + 1, answer - 2, answer + 3]),
    direction: Math.floor(Math.random() * (level === 1 ? 2 : 4)),
  };
}
export default function GameRun({
  game,
  level,
  rounds = 8,
  onComplete,
}: {
  game: number;
  level: number;
  rounds?: number;
  onComplete: (r: RunResult) => void;
}) {
  const g = games.find((g) => g.id === game)!;
  const [phase, setPhase] = useState("intro"),
    [round, setRound] = useState(0),
    [q, setQ] = useState<Question | null>(null),
    [selected, setSelected] = useState<number[]>([]),
    [correct, setCorrect] = useState(0),
    [last, setLast] = useState(false),
    [remaining, setRemaining] = useState(0);
  const started = useRef(0),
    durations = useRef<number[]>([]),
    locked = useRef(false),
    timer = useRef<ReturnType<typeof setTimeout> | null>(null),
    deadline = useRef(0);
  const seconds = [0, 8, 6, 4][level];
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  useEffect(() => {
    if (game !== 7 || phase !== "answer") return;
    const interval = setInterval(() => {
      const left = Math.max(0, (deadline.current - Date.now()) / 1000);
      setRemaining(left);
      if (left === 0) submit(false);
    }, 80);
    return () => clearInterval(interval);
  }, [phase, q]);
  function next() {
    if (timer.current) clearTimeout(timer.current);
    locked.current = false;
    setSelected([]);
    setQ(makeQuestion(level));
    if (game === 4) {
      setPhase("remember");
      timer.current = setTimeout(
        () => {
          started.current = Date.now();
          setPhase("answer");
        },
        4000 - level * 400,
      );
    } else if (game === 7) {
      setPhase("ready");
      timer.current = setTimeout(
        () => {
          started.current = Date.now();
          deadline.current = Date.now() + seconds * 1000;
          setRemaining(seconds);
          setPhase("answer");
        },
        900 + Math.random() * 900,
      );
    } else {
      started.current = Date.now();
      setPhase("answer");
    }
  }
  function submit(ok: boolean) {
    if (locked.current) return;
    locked.current = true;
    durations.current.push(Math.max(0, Date.now() - started.current));
    setLast(ok);
    if (ok) setCorrect((c) => c + 1);
    setPhase("feedback");
  }
  function chooseTile(index: number) {
    if (phase !== "answer" || selected.includes(index) || locked.current)
      return;
    const items = [...selected, index];
    setSelected(items);
    if (!q!.targets.includes(index)) submit(false);
    else if (items.length === q!.targets.length) submit(true);
  }
  function advance() {
    if (round + 1 === rounds) {
      setPhase("complete");
      onComplete({
        correct,
        rounds,
        speed: Math.round(
          durations.current.reduce((a, b) => a + b, 0) /
            durations.current.length,
        ),
      });
    } else {
      setRound((r) => r + 1);
      next();
    }
  }
  function speak() {
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel();
      speechSynthesis.speak(new SpeechSynthesisUtterance(g.instructions));
    }
  }
  return (
    <div className={"game-run run-" + game}>
      <div className="run-heading">
        <span className="skill-pill">{g.skill}</span>
        <span>
          Level {level} · {levelNames[level]}
        </span>
      </div>
      <h2>{g.name}</h2>
      {phase === "intro" ? (
        <div className="run-intro">
          <div className="run-symbol">{g.symbol}</div>
          <p>{g.instructions}</p>
          <div className="run-guidance">
            {game === 4
              ? `${level + 1} glowing tiles to remember. No answering timer.`
              : game === 5
                ? `${level === 1 ? 6 : level === 2 ? 9 : 12} items to explore. No timer.`
                : game === 6
                  ? "Choose from four numbers. Take your time."
                  : `${seconds} seconds to match each arrow. ${level === 1 ? "Left and right" : "Four directions"}.`}
          </div>
          <p className="muted">
            {rounds} rounds ·{" "}
            {rounds === 8
              ? "6 correct to win"
              : "3 correct to unlock the next level"}
          </p>
          <button className="primary" onClick={next}>
            Let’s begin <ArrowRight size={20} />
          </button>
          <button className="text-button" onClick={speak}>
            <Volume2 size={18} /> Read instructions
          </button>
        </div>
      ) : phase === "complete" ? (
        <p>Finishing this activity…</p>
      ) : (
        <>
          <div className="run-progress">
            <div>
              <i style={{ width: `${((round + 1) / rounds) * 100}%` }} />
            </div>
            <span>
              Round {round + 1} / {rounds}
            </span>
          </div>
          <div className="trial-stage" aria-live="polite">
            {phase === "feedback" ? (
              <div
                className={"trial-feedback " + (last ? "right" : "try-again")}
              >
                <div>
                  {last ? <Check size={46} /> : <RotateCcw size={40} />}
                </div>
                <h3>
                  {last ? "You found it!" : "A fresh start on the next one."}
                </h3>
                <p>
                  {last
                    ? "One more small discovery."
                    : game === 6
                      ? `The missing number was ${q?.answer}.`
                      : "That round was a little tricky. Take a breath and keep going."}
                </p>
                <button className="primary" onClick={advance}>
                  {round + 1 === rounds ? "See results" : "Next round"}{" "}
                  <ArrowRight size={18} />
                </button>
              </div>
            ) : game === 4 ? (
              <>
                <h3>
                  {phase === "remember"
                    ? "Remember the glowing tiles"
                    : "Where were the lights?"}
                </h3>
                <p>
                  {phase === "remember"
                    ? "Look carefully. They will fade in a moment."
                    : `Tap ${q!.targets.length} tiles · ${selected.length} found`}
                </p>
                <div
                  className="memory-board"
                  style={{
                    gridTemplateColumns: `repeat(${level === 3 ? 4 : 3},1fr)`,
                  }}
                >
                  {Array.from({ length: q!.size }, (_, i) => (
                    <button
                      key={i}
                      disabled={phase !== "answer" || selected.includes(i)}
                      aria-label={`Tile ${i + 1}${selected.includes(i) ? ", selected" : ""}`}
                      className={
                        (phase === "remember" && q!.targets.includes(i)) ||
                        selected.includes(i)
                          ? "glowing"
                          : ""
                      }
                      onClick={() => chooseTile(i)}
                    >
                      {(phase === "remember" && q!.targets.includes(i)) ||
                      selected.includes(i)
                        ? "✦"
                        : "·"}
                    </button>
                  ))}
                </div>
              </>
            ) : game === 5 ? (
              <>
                <h3>Find the one that’s different.</h3>
                <p>Check the shapes. There is no hurry.</p>
                <div
                  className="attention-board"
                  style={{
                    gridTemplateColumns: `repeat(${level === 1 ? 3 : level === 2 ? 3 : 4},1fr)`,
                  }}
                >
                  {Array.from(
                    { length: level === 1 ? 6 : level === 2 ? 9 : 12 },
                    (_, i) => (
                      <button
                        key={i}
                        aria-label={`Item ${i + 1}: ${i === q!.odd ? q!.different : q!.shape}`}
                        onClick={() => submit(i === q!.odd)}
                      >
                        {i === q!.odd ? q!.different : q!.shape}
                      </button>
                    ),
                  )}
                </div>
              </>
            ) : game === 6 ? (
              <>
                <h3>What number comes next?</h3>
                <p>Follow the same step along the trail.</p>
                <div className="number-trail">
                  {q!.sequence.map((n, i) => (
                    <span key={i}>{n}</span>
                  ))}
                  <span className="missing">?</span>
                </div>
                <div className="answer-options">
                  {q!.options.map((n) => (
                    <button key={n} onClick={() => submit(n === q!.answer)}>
                      {n}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <h3>
                  {phase === "ready"
                    ? "Get ready for the signal…"
                    : "Match the direction!"}
                </h3>
                <p>
                  {phase === "ready"
                    ? "Wait until the arrow appears."
                    : `${remaining.toFixed(1)} seconds remaining`}
                </p>
                <div className="signal-display">
                  {phase === "ready" ? "·" : ["←", "→", "↑", "↓"][q!.direction]}
                </div>
                <div className="answer-options directions">
                  {["←", "→", "↑", "↓"]
                    .slice(0, level === 1 ? 2 : 4)
                    .map((a, i) => (
                      <button
                        key={a}
                        disabled={phase !== "answer"}
                        aria-label={["Left", "Right", "Up", "Down"][i]}
                        onClick={() => submit(i === q!.direction)}
                      >
                        {a}
                      </button>
                    ))}
                </div>
              </>
            )}
          </div>
          <div className="round-score">
            {correct} correct so far <span>One round at a time.</span>
          </div>
        </>
      )}
    </div>
  );
}
