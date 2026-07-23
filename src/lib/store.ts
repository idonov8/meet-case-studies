import { useSyncExternalStore } from "react";
import { ALL_DELIVERABLES, PARTS, type Deliverable } from "./deliverables";

// A single localStorage-backed store keyed by deliverable id.
// Values are opaque per-widget shapes; completion() interprets them.

const KEY = "sprint-room:v1";
const TEAM_KEY = "sprint-room:team";

type State = Record<string, unknown>;

let state: State = load();
const listeners = new Set<() => void>();

function load(): State {
  if (typeof localStorage === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}");
  } catch {
    return {};
  }
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* quota / private mode — nothing we can do, keep working in memory */
  }
}

function emit() {
  progressCache = computeProgress();
  listeners.forEach((l) => l());
}

export function getValue<T>(id: string): T | undefined {
  return state[id] as T | undefined;
}

export function setValue<T>(id: string, value: T) {
  state = { ...state, [id]: value };
  persist();
  emit();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

// Hook: read + write a single deliverable's value with a fallback default.
export function useDeliverable<T>(id: string, fallback: T): [T, (v: T) => void] {
  const value = useSyncExternalStore(
    subscribe,
    () => (state[id] as T) ?? fallback,
    () => fallback,
  );
  return [value, (v: T) => setValue(id, v)];
}

// --- Completion heuristics -------------------------------------------------

function nonEmpty(s: unknown): boolean {
  // Rich text fields store HTML (e.g. an empty editor is "<p></p>"), so strip tags before
  // checking — this also works unchanged for plain-string values that have no markup.
  return typeof s === "string" && s.replace(/<[^>]*>/g, "").trim().length > 0;
}

export function completion(d: Deliverable, value: unknown): number {
  if (d.readonly) return 1; // synced data, not something the team fills in
  if (value == null) return 0;
  switch (d.kind) {
    case "text":
      return nonEmpty(value) ? 1 : 0;
    case "sections": {
      const v = value as Record<string, string>;
      const keys = d.sections ?? [];
      if (!keys.length) return 0;
      const filled = keys.filter((s) => nonEmpty(v[s.key])).length;
      return filled / keys.length;
    }
    case "records": {
      const rows = value as Record<string, string>[];
      if (!Array.isArray(rows)) return 0;
      const real = rows.filter((r) => Object.values(r).some(nonEmpty));
      return real.length ? 1 : 0;
    }
    case "matrix": {
      const cells = value as Record<string, string>;
      return Object.values(cells).some(nonEmpty) ? 1 : 0;
    }
    case "tree": {
      const nodes = value as { id: string; parent: string | null }[];
      if (!Array.isArray(nodes)) return 0;
      // meaningful once there's at least one branch beyond the root
      return nodes.filter((n) => n.parent !== null).length >= 1 ? 1 : 0;
    }
    case "gantt": {
      const tasks = value as unknown[];
      return Array.isArray(tasks) && tasks.length > 0 ? 1 : 0;
    }
    case "lifecycle":
      return nonEmpty((value as { stage?: string }).stage) ? 1 : 0;
    case "checklist": {
      const done = value as Record<string, boolean>;
      const total = d.checklist?.length ?? 0;
      if (!total) return 0;
      const checked = Object.values(done).filter(Boolean).length;
      return checked / total;
    }
    case "palette": {
      const v = value as { tone?: string; assessment?: string; swatches?: string[] };
      return nonEmpty(v.assessment) || nonEmpty(v.tone) || (v.swatches?.length ?? 0) > 0 ? 1 : 0;
    }
    case "upload": {
      const v = value as { name?: string };
      return nonEmpty(v.name) ? 1 : 0;
    }
    case "tracker": {
      const rows = value as Record<string, { status?: string }>;
      const tasks = d.trackerGroups?.flatMap((g) => g.tasks) ?? [];
      if (!tasks.length) return 0;
      const done = tasks.filter((t) => rows[t.key]?.status === "done").length;
      return done / tasks.length;
    }
    default:
      return 0;
  }
}

export interface Progress {
  overall: number;
  byPart: Record<string, number>;
  done: number;
  total: number;
}

const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

function computeProgress(): Progress {
  // Optional deliverables don't count toward completion, so teams can still hit 100%.
  const byDeliverable: Record<string, number> = {};
  for (const d of ALL_DELIVERABLES) byDeliverable[d.id] = completion(d, state[d.id]);

  const byPart: Record<string, number> = {};
  for (const p of PARTS) {
    byPart[p.id] = avg(p.deliverables.filter((d) => !d.optional).map((d) => byDeliverable[d.id]));
  }
  const required = ALL_DELIVERABLES.filter((d) => !d.optional);
  const all = required.map((d) => byDeliverable[d.id]);
  const overall = avg(all);
  const done = all.filter((v) => v >= 1).length;
  return { overall, byPart, done, total: all.length };
}

// Cached so useSyncExternalStore gets a stable reference between changes.
let progressCache: Progress = computeProgress();

export function useProgress(): Progress {
  return useSyncExternalStore(
    subscribe,
    () => progressCache,
    () => progressCache,
  );
}

export function useDeliverableProgress(d: Deliverable): number {
  return useSyncExternalStore(
    subscribe,
    () => completion(d, state[d.id]),
    () => 0,
  );
}

// --- Team name (set at mock login) ----------------------------------------

export function getTeam(): string {
  if (typeof localStorage === "undefined") return "";
  return localStorage.getItem(TEAM_KEY) ?? "";
}
export function setTeam(name: string) {
  try {
    localStorage.setItem(TEAM_KEY, name);
  } catch {
    /* ignore */
  }
}

export function resetAll() {
  state = {};
  persist();
  emit();
}
