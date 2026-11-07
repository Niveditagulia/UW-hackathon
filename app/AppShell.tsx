"use client";
import {
  Sprout,
  LayoutGrid,
  ChartNoAxesCombined,
  Users,
  Flower2,
  LogOut,
  SlidersHorizontal,
} from "lucide-react";
import { useState } from "react";
export default function AppShell({
  children,
  staff = false,
  staffWorkspace = false,
  active = "play",
  person = "Your account",
}: {
  children: React.ReactNode;
  staff?: boolean;
  staffWorkspace?: boolean;
  active?: string;
  person?: string;
}) {
  const [large, setLarge] = useState(false);
  return (
    <div className={"studio " + (large ? "large" : "")}>
      <aside className="studio-nav">
        <a href={staffWorkspace ? "/staff" : "/play"} className="new-brand">
          <span>
            <Sprout size={25} />
          </span>
          gentle<span className="brand-light">grove</span>
          <b>DAILY BRAIN PLAY</b>
        </a>
        <small className="nav-caption">
          {staffWorkspace ? "CARE TEAM" : "YOUR SPACE"}
        </small>
        <nav>
          {!staffWorkspace && (
            <>
              <a className={active === "play" ? "active" : ""} href="/play">
                <LayoutGrid size={21} />
                My training
              </a>
              <a
                className={active === "garden" ? "active" : ""}
                href="/play?garden=1"
              >
                <Flower2 size={21} />
                My garden
              </a>
              <a className={active === "report" ? "active" : ""} href="/report">
                <ChartNoAxesCombined size={21} />
                My report
              </a>
            </>
          )}
          {staff && (
            <a className={active === "staff" ? "active" : ""} href="/staff">
              <Users size={21} />
              Staff dashboard
            </a>
          )}
        </nav>
        <div className="nav-foot">
          {staff && (
            <button
              className="staff-lock"
              onClick={async () => {
                await fetch("/api/staff-auth", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ action: "logout" }),
                });
                window.location.assign("/staff/login");
              }}
            >
              Lock staff access
            </button>
          )}
          {!staffWorkspace && (
            <>
              <div className="nav-quote">
                A little challenge.
                <br />
                <strong>A new possibility.</strong>
              </div>
              <a href="/login">
                <SlidersHorizontal size={18} /> Profile & preferences
              </a>
            </>
          )}
          <a href="/signout" target="_top">
            <LogOut size={18} /> Sign out
          </a>
        </div>
      </aside>
      <div className="studio-body">
        {!staffWorkspace && (
          <header className="studio-top">
            <span>
              <i /> YOUR DAILY DOSE OF DISCOVERY
            </span>
            <div>
              <button aria-pressed={large} onClick={() => setLarge(!large)}>
                Aa <span>Text size</span>
              </button>
              <span className="account-orb">
                {person.charAt(0).toUpperCase()}
              </span>
            </div>
          </header>
        )}
        <main className="studio-main">{children}</main>
        {!staffWorkspace && (
          <footer className="studio-footer">
            <Sprout size={16} /> Little moments. Meaningful progress.
            <span>Your own pace. Your own journey.</span>
          </footer>
        )}
      </div>
    </div>
  );
}
