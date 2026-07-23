import { useEffect, useState } from "react";
import { PARTS, type Deliverable, type Part } from "../lib/deliverables";
import { getTeam, useDeliverableProgress, useProgress } from "../lib/store";
import { Widget } from "./widgets";

const DEADLINE = new Date("2026-07-28T23:59:00");
const BASE = import.meta.env.BASE_URL; // e.g. "/meet-case-studies/"

function useCountdown() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);
  const ms = DEADLINE.getTime() - now;
  if (ms <= 0) return "Deadline passed";
  const d = Math.floor(ms / 86_400_000);
  const h = Math.floor((ms % 86_400_000) / 3_600_000);
  return `${d}d ${h}h to deadline`;
}

function Ring({ value, size = 22 }: { value: number; size?: number }) {
  const r = size / 2 - 2;
  const c = 2 * Math.PI * r;
  const done = value >= 1;
  return (
    <svg width={size} height={size} className="shrink-0 -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-line)" strokeWidth="2.5" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={done ? "var(--color-green)" : "var(--color-brand)"}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - value)}
        style={{ transition: "stroke-dashoffset 0.4s ease" }}
      />
    </svg>
  );
}

function DeliverableCard({ d, n }: { d: Deliverable; n: number }) {
  const progress = useDeliverableProgress(d);
  return (
    <article id={`d-${d.id}`} className="scroll-mt-24 rounded-[--radius-card] bg-paper p-5 hairline shadow-sm sm:p-6">
      <header className="mb-4 flex items-start gap-3">
        <span className="mt-0.5 font-mono text-sm text-brand">{String(n).padStart(2, "0")}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold leading-tight">{d.title}</h3>
            <span className="rounded-full bg-mist px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-wider text-slate">
              Day {d.day}
            </span>
            {d.optional && (
              <span className="rounded-full border border-line px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-wider text-slate">
                Optional
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-slate">{d.prompt}</p>
        </div>
        <Ring value={progress} />
      </header>
      <Widget d={d} />
    </article>
  );
}

function PartNav({ part, active, onSelect }: { part: Part; active: boolean; onSelect: () => void }) {
  const { byPart } = useProgress();
  const pct = Math.round(byPart[part.id] * 100);
  return (
    <button
      onClick={onSelect}
      className={`w-full rounded-xl px-4 py-3 text-left transition-all ${
        active ? "bg-ink text-paper shadow-md" : "bg-paper text-ink hairline hover:border-slate"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className={`font-mono text-[0.6rem] uppercase tracking-widest ${active ? "text-brand" : "text-slate"}`}>
          Part {part.index}
        </span>
        <span className={`font-mono text-xs ${active ? "text-paper/80" : "text-slate"}`}>{pct}%</span>
      </div>
      <div className="mt-1 font-display text-lg font-bold leading-tight">{part.title}</div>
      <div className={`text-xs ${active ? "text-paper/70" : "text-slate"}`}>{part.tagline}</div>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-black/10">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: active ? "var(--color-brand)" : "var(--color-green)" }}
        />
      </div>
    </button>
  );
}

export default function Workspace() {
  const [activeId, setActiveId] = useState(PARTS[0].id);
  const [team, setTeam] = useState("");
  const { overall, done, total } = useProgress();
  const countdown = useCountdown();

  useEffect(() => setTeam(getTeam()), []);

  const part = PARTS.find((p) => p.id === activeId)!;
  const pct = Math.round(overall * 100);

  const logout = () => {
    window.location.href = BASE;
  };

  return (
    <div className="min-h-screen">
      {/* header */}
      <header className="sticky top-0 z-30 border-b border-line bg-paper/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
          <a href={BASE} className="flex items-center gap-2.5">
            <img src={`${BASE.replace(/\/$/, "")}/meet-logo.svg`} alt="meet" className="h-6 w-auto" />
            <span className="hidden text-sm font-semibold text-slate sm:block">Case Studies</span>
          </a>
          <div className="ml-auto flex items-center gap-4">
            <span className="hidden font-mono text-xs text-brand-deep sm:block">{countdown}</span>
            <div className="flex items-center gap-2">
              <Ring value={overall} size={26} />
              <span className="font-mono text-xs text-slate">
                {done}/{total}
              </span>
            </div>
            {team && (
              <span className="hidden rounded-full bg-mist px-3 py-1 text-xs font-medium md:block">{team}</span>
            )}
            <button onClick={logout} className="text-xs text-slate hover:text-brand" title="Sign out">
              Sign out
            </button>
          </div>
        </div>
        <div className="h-0.5 w-full bg-mist">
          <div className="h-full bg-brand transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[260px_1fr]">
        {/* sprint spine */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <p className="eyebrow mb-2">The sprint</p>
          <nav className="flex flex-col gap-2">
            {PARTS.map((p) => (
              <PartNav key={p.id} part={p} active={p.id === activeId} onSelect={() => setActiveId(p.id)} />
            ))}
          </nav>
          <div className="mt-4 hidden rounded-xl bg-panel/60 p-3 hairline lg:block">
            <p className="eyebrow mb-2">Checkpoints</p>
            <ul className="flex flex-col gap-0.5">
              {part.deliverables.map((d, i) => (
                <CheckpointLink key={d.id} d={d} n={i + 1} />
              ))}
            </ul>
          </div>
        </aside>

        {/* deliverables */}
        <section key={activeId} className="rise flex flex-col gap-4">
          <div className="rounded-[--radius-card] bg-ink p-6 text-paper">
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-brand">
              Part {part.index} — {part.tagline}
            </span>
            <h2 className="mt-1 font-display text-3xl font-extrabold">{part.title}</h2>
            <p className="mt-2 max-w-xl text-sm text-paper/75">{part.blurb}</p>
          </div>
          {part.deliverables.map((d, i) => (
            <DeliverableCard key={d.id} d={d} n={i + 1} />
          ))}
        </section>
      </main>
    </div>
  );
}

function CheckpointLink({ d, n }: { d: Deliverable; n: number }) {
  const progress = useDeliverableProgress(d);
  return (
    <li>
      <a
        href={`#d-${d.id}`}
        className="flex items-center gap-2 rounded-md px-2 py-1 text-xs text-slate transition-colors hover:bg-mist hover:text-ink"
      >
        <span
          className={`h-1.5 w-1.5 shrink-0 rounded-full ${
            progress >= 1 ? "bg-green" : progress > 0 ? "bg-brand" : "bg-line"
          }`}
        />
        <span className="font-mono text-[0.6rem]">{String(n).padStart(2, "0")}</span>
        <span className="truncate">{d.title}</span>
      </a>
    </li>
  );
}
