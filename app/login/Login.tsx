"use client";
import { languageCodes, languageName } from "../../lib/languages";
import { useState, useEffect } from "react";
import {
  Sprout,
  ArrowRight,
  Heart,
  ShieldCheck,
  Users,
  Flower2,
  ArrowLeft,
} from "lucide-react";
export default function Login({ signedIn }: { signedIn: boolean }) {
  const [language, setLanguage] = useState("en"),
    [languageSearch, setLanguageSearch] = useState(""),
    [role, setRole] = useState("resident"),
    [step, setStep] = useState("choose"),
    [account, setAccount] = useState<any>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [name, setName] = useState(""),
    [age, setAge] = useState(""),
    [gender, setGender] = useState("Prefer not to say"),
    [type, setType] = useState("email"),
    [contact, setContact] = useState("");
  useEffect(() => {
    try {
      setLanguage(localStorage.getItem("grove-language") || "en");
      setRole(
        localStorage.getItem("grove-role") === "staff" ? "staff" : "resident",
      );
    } catch {}
    if (signedIn)
      fetch("/api/account")
        .then(async (r) => {
          if (!r.ok) throw Error();
          return r.json() as Promise<any>;
        })
        .then((d) => {
          setAccount(d);
          if (d.profile) {
            setLanguage(d.profile.language || "en");
            setName(d.profile.name);
            setAge(String(d.profile.age));
            setGender(d.profile.gender);
            setType(d.profile.contactType);
            setContact(d.profile.contact);
          } else
            setContact(
              d.user.email.endsWith("@local.grove") ? "" : d.user.email,
            );
        })
        .catch(() =>
          setError("Unable to load your account. Refresh to try again."),
        );
  }, [signedIn]);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          age: Number(age),
          gender,
          language,
          contactType: type,
          contact,
        }),
      });
      const d: any = await r.json();
      if (!r.ok) throw Error(d.error);
      window.location.assign("/play");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save your profile.");
      setBusy(false);
    }
  }
  return (
    <div className="welcome">
      <section className="welcome-story">
        <a className="brand" href="/login">
          <span className="brand-mark">
            <Sprout size={35} />
          </span>
          <span>
            gentle grove<small>A little play. A brighter day.</small>
          </span>
        </a>
        <div className="welcome-copy">
          <span className="eyebrow">A LITTLE CARE FOR YOUR EVERYDAY</span>
          <h1>
            Good days <br />
            begin with <br />
            <em>little moments.</em>
          </h1>
          <p>
            A welcoming place to play, discover,
            <br />
            and grow at your own pace.
          </p>
          <div className="welcome-blooms" aria-hidden="true">
            <span>✿</span>
            <span>✿</span>
            <span>✿</span>
          </div>
        </div>
        <div className="welcome-bottom">
          <Heart size={18} /> Thoughtfully designed for every stage of life.
        </div>
      </section>
      <section className="welcome-form">
        <div className="welcome-top">
          <span>YOUR DAILY WELLBEING COMPANION</span>
          <span>
            <ShieldCheck size={16} /> Private by design
          </span>
        </div>
        <div className="login-card">
          {step === "choose" ? (
            <>
              <span className="pill">WELCOME TO YOUR GROVE</span>
              <h2>A brighter day starts here.</h2>
              <p>First, tell us how you’ll be joining us.</p>
              <div className="language-select">
                <label htmlFor="language">Which language do you prefer?</label>
                <input
                  aria-label="Search languages"
                  placeholder="Search languages…"
                  value={languageSearch}
                  onChange={(e) => setLanguageSearch(e.target.value)}
                />
                <select
                  id="language"
                  value={language}
                  onChange={(e) => {
                    setLanguage(e.target.value);
                    localStorage.setItem("grove-language", e.target.value);
                  }}
                >
                  {languageCodes
                    .filter(
                      (c) =>
                        c === language ||
                        languageName(c)
                          ?.toLowerCase()
                          .includes(languageSearch.toLowerCase()),
                    )
                    .map((c) => (
                      <option key={c} value={c}>
                        {languageName(c)}
                      </option>
                    ))}
                </select>
                <small>
                  Your preference is saved. The current interface is in English;
                  other translations are not yet available.
                </small>
              </div>
              <div className="role-choices">
                <button
                  className={role === "resident" ? "active" : ""}
                  aria-pressed={role === "resident"}
                  onClick={() => {
                    setRole("resident");
                    localStorage.setItem("grove-role", "resident");
                    setError("");
                  }}
                >
                  <Flower2 />
                  <span>
                    I’m a resident
                    <small>Play activities & see my progress</small>
                  </span>
                  <b>○</b>
                </button>
                <button
                  className={role === "staff" ? "active" : ""}
                  aria-pressed={role === "staff"}
                  onClick={() => {
                    setRole("staff");
                    localStorage.setItem("grove-role", "staff");
                    setError("");
                  }}
                >
                  <Users />
                  <span>
                    I’m a staff member
                    <small>Support residents & review reports</small>
                  </span>
                  <b>○</b>
                </button>
              </div>
              {!signedIn ? (
                <a
                  className="primary login-continue"
                  href={role === "staff" ? "/staff/login" : "/signin"}
                  target="_top"
                >
                  Sign in securely <ArrowRight size={20} />
                </a>
              ) : (
                <button
                  className="primary login-continue"
                  disabled={!account || busy}
                  onClick={() => {
                    if (role === "staff") {
                      if (account.user.isStaff)
                        window.location.assign("/staff/login");
                      else
                        setError(
                          "Your account is not authorized for staff access. Please contact the site owner.",
                        );
                    } else if (account.profile) {
                      setBusy(true);
                      fetch("/api/account", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ ...account.profile, language }),
                      })
                        .then((r) => {
                          if (!r.ok) throw Error();
                          window.location.assign("/play");
                        })
                        .catch(() => {
                          setError(
                            "Unable to save your language preference. Please try again.",
                          );
                          setBusy(false);
                        });
                    } else setStep("profile");
                  }}
                >
                  {account?.profile && role === "resident"
                    ? "Welcome back — let’s play"
                    : "Continue"}{" "}
                  <ArrowRight size={20} />
                </button>
              )}
              {signedIn && account?.profile && role === "resident" && (
                <button
                  className="text-button"
                  onClick={() => setStep("profile")}
                >
                  Edit my profile
                </button>
              )}
              <div className="signin-note">
                <ShieldCheck size={17} />
                <span>
                  {signedIn
                    ? `Signed in as ${account?.user.email || "your account"}`
                    : "Sign in with your saved username and password."}
                  <small>
                    Staff access is verified separately. Resident accounts only
                    see their own reports.
                  </small>
                </span>
              </div>
              {signedIn && (
                <a className="signout" href="/signout" target="_top">
                  Use a different account / sign out
                </a>
              )}
            </>
          ) : (
            <>
              <button
                className="text-button back"
                onClick={() => setStep("choose")}
              >
                <ArrowLeft size={17} /> Back
              </button>
              <span className="eyebrow">LET’S GET TO KNOW YOU</span>
              <h2>Make yourself at home.</h2>
              <p>A few details to personalize your experience.</p>
              <form onSubmit={save}>
                <label>
                  Full name
                  <input
                    autoComplete="name"
                    required
                    maxLength={100}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                  />
                </label>
                <div className="form-pair">
                  <label>
                    Age
                    <input
                      type="number"
                      min="18"
                      max="120"
                      required
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="e.g. 72"
                    />
                  </label>
                  <label>
                    Gender
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                    >
                      {[
                        "Woman",
                        "Man",
                        "Non-binary",
                        "Self-described",
                        "Prefer not to say",
                      ].map((g) => (
                        <option key={g}>{g}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <label>
                  Preferred language
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    {languageCodes.map((c) => (
                      <option key={c} value={c}>
                        {languageName(c)}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Preferred profile identifier
                  <select
                    value={type}
                    onChange={(e) => {
                      setType(e.target.value);
                      setContact("");
                    }}
                  >
                    <option value="email">Email address</option>
                    <option value="phone">Phone number</option>
                    <option value="passport">Passport number</option>
                  </select>
                </label>
                <label>
                  {type === "email"
                    ? "Email address"
                    : type === "phone"
                      ? "Phone number"
                      : "Passport number"}
                  <input
                    required
                    type={
                      type === "email"
                        ? "email"
                        : type === "phone"
                          ? "tel"
                          : "text"
                    }
                    value={contact}
                    maxLength={type === "passport" ? 25 : 150}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder={
                      type === "email"
                        ? "you@example.com"
                        : type === "phone"
                          ? "+1 416 555 0123"
                          : "Passport number"
                    }
                  />
                </label>
                <small className="field-help">
                  {type === "passport"
                    ? "Only the last four characters are retained. Your passport is not used for authentication."
                    : "This is a profile detail. Secure account sign-in protects access to your report."}
                </small>
                <button className="primary login-continue" disabled={busy}>
                  {busy ? "Saving your profile…" : "Save & start my day"}{" "}
                  <ArrowRight size={20} />
                </button>
              </form>
            </>
          )}
          {error && (
            <p className="error-message" role="alert">
              {error}
            </p>
          )}
        </div>
        <div className="login-footer">
          Your pace. Your progress. Your little moment.
        </div>
      </section>
    </div>
  );
}
