"use client";
import { useState } from "react";
import { Sprout, ShieldCheck, ArrowRight, Eye, EyeOff } from "lucide-react";
export default function AccountForm({ staff = false }: { staff?: boolean }) {
  const [mode, setMode] = useState("login"),
    [username, setUsername] = useState(""),
    [password, setPassword] = useState(""),
    [confirm, setConfirm] = useState(""),
    [code, setCode] = useState(""),
    [remember, setRemember] = useState(true),
    [show, setShow] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "register" && password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: mode,
          username,
          password,
          code,
          remember,
          role: staff ? "staff" : "resident",
        }),
      });
      const d: any = await r.json();
      if (!r.ok) throw Error(d.error);
      window.location.assign(d.role === "staff" ? "/staff" : "/login");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
      setBusy(false);
    }
  }
  return (
    <div className="staff-entry">
      <a className="new-brand" href="/login">
        <span>
          <Sprout />
        </span>
        gentlegrove
      </a>
      <section className="staff-entry-card">
        <span className="staff-entry-icon">
          <ShieldCheck size={34} />
        </span>
        <span className="kicker">
          {staff ? "CARE TEAM ACCESS" : "YOUR PERSONAL GROVE"}
        </span>
        <h1>
          {mode === "register"
            ? "Create your " + (staff ? "staff " : "") + "login."
            : staff
              ? "Welcome back, care team."
              : "Welcome back to your grove."}
        </h1>
        <p>
          {staff
            ? "A dedicated sign-in for the people behind the care."
            : "Your games, garden, and progress—all in one place."}
        </p>
        <div className="staff-entry-tabs">
          <button
            aria-pressed={mode === "login"}
            onClick={() => {
              setMode("login");
              setError("");
            }}
          >
            Log in
          </button>
          <button
            aria-pressed={mode === "register"}
            onClick={() => {
              setMode("register");
              setError("");
            }}
          >
            Register
          </button>
        </div>
        <form onSubmit={submit}>
          <label>
            Username
            <input
              name="username"
              required
              autoComplete="username"
              minLength={3}
              maxLength={40}
              pattern="[a-zA-Z0-9_.\-]+"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your username"
            />
          </label>
          <label>
            Password
            <div className="password-field">
              <input
                name="password"
                required
                autoComplete={
                  mode === "register" ? "new-password" : "current-password"
                }
                type={show ? "text" : "password"}
                minLength={12}
                maxLength={128}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 12 characters"
              />
              <button
                type="button"
                aria-label={show ? "Hide password" : "Show password"}
                onClick={() => setShow(!show)}
              >
                {show ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </label>
          {mode === "register" && (
            <label>
              Confirm password
              <input
                required
                autoComplete="new-password"
                type={show ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </label>
          )}
          {staff && mode === "register" && (
            <label>
              Staff setup code
              <input
                required
                type="password"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                autoComplete="off"
              />
              <small>Ask your administrator for the code.</small>
            </label>
          )}
          <label style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              style={{ width: 22, minHeight: 22 }}
            />
            Keep me signed in on this device
          </label>
          <button className="primary" disabled={busy}>
            {busy
              ? "Please wait…"
              : mode === "register"
                ? "Create account"
                : staff
                  ? "Log in to staff dashboard"
                  : "Log in"}
            <ArrowRight size={20} />
          </button>
        </form>
        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}
        <a className="text-button" href="/login">
          Back to welcome
        </a>
      </section>
    </div>
  );
}
