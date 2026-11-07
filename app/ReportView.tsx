"use client";
import { useState, useEffect } from "react";
import {
  ArrowRight,
  Download,
  Search,
  Users,
  ChartNoAxesCombined,
  TrendingDown,
  ShieldCheck,
} from "lucide-react";
import AppShell from "./AppShell";
import { games, gameName, performanceTrend, Activity } from "../lib/game-rules";
export default function ReportView({
  staff,
  staffWorkspace = false,
  directory = false,
}: {
  staff: boolean;
  staffWorkspace?: boolean;
  directory?: boolean;
}) {
  const [people, setPeople] = useState<any[]>([]),
    [report, setReport] = useState<any>(null),
    [search, setSearch] = useState(""),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [game, setGame] = useState(4),
    [level, setLevel] = useState(1);
  useEffect(() => {
    fetch(
      directory
        ? "/api/reports?all=1"
        : "/api/reports" + window.location.search,
    )
      .then(async (r) => {
        const d: any = await r.json();
        if (!r.ok) throw Error(d.error);
        return d;
      })
      .then((d) => {
        if (directory) setPeople(d);
        else {
          setReport(d);
          const latest = d.sessions
            .filter((s: Activity) => s.game === 4)
            .at(-1);
          if (latest) setLevel(latest.level);
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [directory]);
  const rows: Activity[] = (report?.sessions || []).filter(
      (s: Activity) => s.game === game && s.level === level,
    ),
    trend = performanceTrend(rows),
    all: Activity[] = report?.sessions || [];
  const points = rows.slice(-20);
  const coords = points
    .map(
      (r, i) =>
        `${35 + i * (730 / Math.max(1, points.length - 1))},${195 - r.accuracy * 1.6}`,
    )
    .join(" ");
  function exportCsv() {
    const lines = [
      "date,game,level,accuracy_percent,average_response_ms",
      ...all.map(
        (r) =>
          `${r.date},${gameName(r.game)},${r.level},${r.accuracy},${r.speed}`,
      ),
    ];
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob([lines.join("\n")], { type: "text/csv" }),
    );
    a.download = "gentle-grove-report.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }
  return (
    <AppShell
      staff={staff}
      staffWorkspace={staffWorkspace || directory}
      active={directory ? "staff" : "report"}
      person={report?.profile?.name || "Care team"}
    >
      <div className="dashboard-heading">
        <div>
          <span className="kicker">
            {directory
              ? "THE CARE TEAM WORKSPACE"
              : "YOUR JOURNEY, IN PERSPECTIVE"}
          </span>
          <h1>
            {directory
              ? "People first. Progress in focus."
              : report?.profile
                ? `${report.profile.name}’s report`
                : "Your personal report"}
          </h1>
          <p>
            {directory
              ? "A clear view of each resident’s game performance, without ranking people."
              : "Patterns over time, always compared with your own earlier results."}
          </p>
        </div>
        {!directory && (
          <button
            className="secondary"
            disabled={!all.length}
            onClick={exportCsv}
          >
            <Download size={18} /> Export report
          </button>
        )}
      </div>
      {error ? (
        <p className="error-message" role="alert">
          {error}
        </p>
      ) : loading ? (
        <section className="empty-state" role="status">
          Loading your records…
        </section>
      ) : directory ? (
        <>
          <section className="directory-banner">
            <div>
              <span className="kicker">YOUR RESIDENT DIRECTORY</span>
              <h2>
                Every person.
                <br />
                Their own possibility.
              </h2>
              <p>Open a report to explore same-game, same-level trends.</p>
            </div>
            <div className="directory-number">
              <Users size={32} />
              <strong>{people.length}</strong>
              <span>resident profiles</span>
            </div>
          </section>
          <div className="section-head">
            <h2>Residents</h2>
            <label className="search-box">
              <Search size={19} />
              <input
                aria-label="Search residents"
                placeholder="Find a resident…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
          </div>
          <div className="resident-grid">
            {people
              .filter((p) =>
                p.name.toLowerCase().includes(search.toLowerCase()),
              )
              .map((p) => (
                <a
                  className="resident-card"
                  key={p.id}
                  href={"/report?resident=" + encodeURIComponent(p.id)}
                >
                  <span className="account-orb">{p.name.charAt(0)}</span>
                  <div>
                    <h3>{p.name}</h3>
                    <p>
                      Age {p.age} · {p.gender}
                    </p>
                  </div>
                  <ArrowRight size={22} />
                  <span>Open personal report</span>
                </a>
              ))}
          </div>
          {!people.length && (
            <div className="empty-state">
              <h3>Your residents will appear here.</h3>
              <p>
                Profiles are added when an admitted visitor completes
                registration. Site access remains private.
              </p>
            </div>
          )}
          {people.length > 0 &&
            !people.some((p) =>
              p.name.toLowerCase().includes(search.toLowerCase()),
            ) && <p>No matching residents.</p>}
        </>
      ) : (
        <>
          <section className="report-summary">
            <div>
              <span>Completed activities</span>
              <strong>{all.length}</strong>
              <small>Every return counts</small>
            </div>
            <div>
              <span>Days of participation</span>
              <strong>
                {new Set(all.map((s) => s.date.slice(0, 10))).size}
              </strong>
              <small>A journey at your own pace</small>
            </div>
            <div>
              <span>Latest activity</span>
              <strong className="date-stat">
                {all.length
                  ? new Date(all.at(-1)!.date).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })
                  : "Your first awaits"}
              </strong>
              <small>
                {all.length
                  ? gameName(all.at(-1)!.game)
                  : "Play a game to begin"}
              </small>
            </div>
          </section>
          <section className="report-chart-card">
            <div className="section-head">
              <div>
                <span className="kicker">A CONSISTENT VIEW OF PERFORMANCE</span>
                <h2>Accuracy over time</h2>
              </div>
              <div className="report-filters">
                <label>
                  Game
                  <select
                    value={game}
                    onChange={(e) => setGame(Number(e.target.value))}
                  >
                    {games.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Difficulty
                  <select
                    value={level}
                    onChange={(e) => setLevel(Number(e.target.value))}
                  >
                    {[1, 2, 3].map((l) => (
                      <option key={l} value={l}>
                        Level {l}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
            <div className="chart-legend">
              <span>
                <i /> Session accuracy
              </span>
              <span>
                <i className="baseline-key" /> First 5-session baseline
              </span>
              <b>{rows.length} comparable sessions</b>
            </div>
            {rows.length ? (
              <>
                <div className="performance-chart">
                  <div className="chart-axis">
                    <span>100%</span>
                    <span>75%</span>
                    <span>50%</span>
                    <span>25%</span>
                    <span>0%</span>
                  </div>
                  <svg
                    viewBox="0 0 800 230"
                    role="img"
                    aria-label={`Accuracy for ${gameName(game)}, level ${level}: ${points.map((p) => p.accuracy + " percent").join(", ")}. ${trend.message}`}
                  >
                    <defs>
                      <linearGradient id="chartFill" x2="0" y2="1">
                        <stop
                          stopColor={
                            trend.status === "declining" ? "#d65a43" : "#409cba"
                          }
                          stopOpacity=".2"
                        />
                        <stop offset="1" stopColor="#fff" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {[35, 75, 115, 155, 195].map((y) => (
                      <path key={y} d={`M25 ${y}H780`} stroke="#e8edf4" />
                    ))}
                    {trend.baseline !== null && (
                      <path
                        d={`M25 ${195 - trend.baseline * 1.6}H780`}
                        stroke="#a3afc3"
                        strokeDasharray="7 6"
                        strokeWidth="2"
                      />
                    )}
                    {points.length > 1 && (
                      <>
                        <polygon
                          points={`35,195 ${coords} ${35 + (points.length - 1) * (730 / Math.max(1, points.length - 1))},195`}
                          fill="url(#chartFill)"
                        />
                        <polyline
                          points={coords}
                          fill="none"
                          stroke={
                            trend.status === "declining" ? "#d65a43" : "#409cba"
                          }
                          strokeWidth="3"
                          strokeLinejoin="round"
                        />
                      </>
                    )}
                    {points.map((p, i) => (
                      <g key={i}>
                        <circle
                          cx={35 + (i * 730) / Math.max(1, points.length - 1)}
                          cy={195 - p.accuracy * 1.6}
                          r="5"
                          fill={
                            trend.status === "declining" ? "#d65a43" : "#409cba"
                          }
                        />
                        <title>
                          {new Date(p.date).toLocaleString()}: {p.accuracy}%
                        </title>
                      </g>
                    ))}
                  </svg>
                </div>
                <div className="chart-dates">
                  <span>{new Date(points[0].date).toLocaleDateString()}</span>
                  <span>Sessions in chronological order · latest 20 shown</span>
                  <span>
                    {new Date(points.at(-1)!.date).toLocaleDateString()}
                  </span>
                </div>
              </>
            ) : (
              <div className="empty-state">
                <ChartNoAxesCombined size={38} />
                <h3>Your trend starts with a little play.</h3>
                <p>No results for this game and level yet.</p>
                {!staffWorkspace && (
                  <a className="primary" href="/play">
                    Explore games <ArrowRight size={18} />
                  </a>
                )}
              </div>
            )}
            <div
              className={
                "trend-notice " +
                (trend.status === "declining" ? "declining" : "")
              }
            >
              <span>
                {trend.status === "declining" ? (
                  <TrendingDown size={25} />
                ) : (
                  <ChartNoAxesCombined size={25} />
                )}
              </span>
              <div>
                <h3>
                  {trend.status === "declining"
                    ? "Downward game-performance trend"
                    : trend.status === "building"
                      ? "Getting to know your baseline"
                      : "Your recent results in context"}
                </h3>
                <p>{trend.message}</p>
                {trend.change !== null && (
                  <strong>
                    Latest average: {Math.abs(trend.change).toFixed(1)}{" "}
                    percentage points {trend.change < 0 ? "below" : "above"}{" "}
                    baseline
                  </strong>
                )}
              </div>
            </div>
            <details className="trend-method">
              <summary>How trend flags work</summary>
              <p>
                We compare the same game at the same fixed difficulty. The first
                5 completed sessions form a personal baseline. A flag requires
                at least 8 sessions; each of the last 3 must be at least 10
                percentage points below baseline, occur on 3 distinct calendar
                days, and form a non-increasing sequence with a lower final
                result. Assessment rounds and original games are excluded. This
                is a transparent product rule, not a clinically validated
                threshold.
              </p>
            </details>
          </section>
          <section className="report-context">
            <ShieldCheck size={22} />
            <p>
              Changes in game scores are observations, not evidence of cognitive
              decline. Staff can review fatigue, vision, interruptions, and
              other context before deciding whether an assessment is
              appropriate.
            </p>
          </section>
          <section className="report-history">
            <div className="section-head">
              <h2>Activity history</h2>
              <span>{all.length} activities</span>
            </div>
            {all.length ? (
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Activity</th>
                      <th>Level</th>
                      <th>Accuracy</th>
                      <th>Response time</th>
                      <th>Garden</th>
                    </tr>
                  </thead>
                  <tbody>
                    {all
                      .slice()
                      .reverse()
                      .map((s, i) => (
                        <tr key={s.id || i}>
                          <td>{new Date(s.date).toLocaleString()}</td>
                          <td>{gameName(s.game)}</td>
                          <td>{s.level}</td>
                          <td>{s.accuracy}%</td>
                          <td>{(s.speed / 1000).toFixed(1)}s</td>
                          <td>
                            {s.game < 4
                              ? "Original game"
                              : s.accuracy >= 75
                                ? "Win · +10"
                                : "Loss · −5"}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>
                Completed activities will appear here. Previous games, if any,
                remain in history.
              </p>
            )}
          </section>
        </>
      )}
    </AppShell>
  );
}
