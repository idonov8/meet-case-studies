import { useEffect, useLayoutEffect, useRef } from "react";
import type { Deliverable, RecordField } from "../lib/deliverables";
import { useDeliverable } from "../lib/store";

/* ------------------------------------------------------------------ */
/* Shared primitives                                                   */
/* ------------------------------------------------------------------ */

function AutoTextarea({
  value,
  onChange,
  placeholder,
  minRows = 2,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  minRows?: number;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);
  return (
    <textarea
      ref={ref}
      rows={minRows}
      className="field text-[0.95rem]"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

const btn =
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors";
const addBtn = `${btn} bg-ink text-paper hover:bg-ink-soft`;
const ghostBtn = `${btn} text-slate hover:text-ink hover:bg-mist`;

function IconPlus() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function IconTrash() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M2.5 3.5h9M5 3.5V2.5h4v1M3.5 3.5l.5 8h6l.5-8"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

/* ------------------------------------------------------------------ */
/* text                                                                */
/* ------------------------------------------------------------------ */

function TextWidget({ d }: { d: Deliverable }) {
  const [value, setValue] = useDeliverable<string>(d.id, "");
  return (
    <div className="rounded-lg bg-panel/60 px-4 py-3 hairline">
      <AutoTextarea value={value} onChange={setValue} placeholder={d.placeholder} minRows={2} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* sections                                                            */
/* ------------------------------------------------------------------ */

function SectionsWidget({ d }: { d: Deliverable }) {
  const [value, setValue] = useDeliverable<Record<string, string>>(d.id, {});
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {d.sections!.map((s) => (
        <label key={s.key} className="flex flex-col gap-1.5 rounded-lg bg-panel/60 px-4 py-3 hairline">
          <span className="eyebrow">{s.label}</span>
          <AutoTextarea
            value={value[s.key] ?? ""}
            onChange={(v) => setValue({ ...value, [s.key]: v })}
            placeholder={s.placeholder}
          />
        </label>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* records                                                             */
/* ------------------------------------------------------------------ */

type Row = Record<string, string> & { _id: string };

function FieldInput({ field, value, onChange }: { field: RecordField; value: string; onChange: (v: string) => void }) {
  if (field.type === "select") {
    return (
      <select
        className="w-full rounded-md bg-paper px-2.5 py-1.5 text-sm hairline"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">—</option>
        {field.options!.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    );
  }
  if (field.type === "textarea") {
    return <AutoTextarea value={value ?? ""} onChange={onChange} placeholder={field.placeholder} />;
  }
  return (
    <input
      className="field text-[0.95rem]"
      value={value ?? ""}
      placeholder={field.placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function RecordsWidget({ d }: { d: Deliverable }) {
  const [rows, setRows] = useDeliverable<Row[]>(d.id, []);
  const fields = d.fields!;
  const single = fields.length === 1;

  const add = () => setRows([...rows, { _id: uid() } as Row]);
  const remove = (id: string) => setRows(rows.filter((r) => r._id !== id));
  const update = (id: string, key: string, v: string) =>
    setRows(rows.map((r) => (r._id === id ? { ...r, [key]: v } : r)));

  const atMax = d.highlightMax != null && rows.length >= d.highlightMax;

  return (
    <div className="flex flex-col gap-2.5">
      {rows.length === 0 && (
        <p className="text-sm text-slate italic">No {d.recordNoun}s yet — add your first below.</p>
      )}
      {rows.map((r, i) => (
        <div
          key={r._id}
          className="group relative rounded-lg bg-panel/60 px-4 py-3 pr-10 hairline rise"
        >
          <span className="absolute left-0 top-3 -translate-x-1/2 rounded-full bg-ink px-1.5 py-0.5 font-mono text-[0.6rem] text-paper">
            {String(i + 1).padStart(2, "0")}
          </span>
          {single ? (
            <FieldInput field={fields[0]} value={r[fields[0].key]} onChange={(v) => update(r._id, fields[0].key, v)} />
          ) : (
            <div className="grid gap-2.5 sm:grid-cols-2">
              {fields.map((f) => (
                <label key={f.key} className={`flex flex-col gap-1 ${f.type === "textarea" ? "sm:col-span-2" : ""}`}>
                  <span className="eyebrow">{f.label}</span>
                  <FieldInput field={f} value={r[f.key]} onChange={(v) => update(r._id, f.key, v)} />
                </label>
              ))}
            </div>
          )}
          <button
            className="absolute right-2 top-2 rounded-md p-1.5 text-slate opacity-0 transition-opacity hover:bg-mist hover:text-coral group-hover:opacity-100 focus-visible:opacity-100"
            onClick={() => remove(r._id)}
            aria-label={`Remove ${d.recordNoun} ${i + 1}`}
          >
            <IconTrash />
          </button>
        </div>
      ))}
      {!atMax && (
        <button className={`${addBtn} self-start`} onClick={add}>
          <IconPlus /> Add {d.recordNoun}
        </button>
      )}
      {atMax && <p className="eyebrow">Keep it to {d.highlightMax} — force the hard choices.</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* matrix — competitive analysis                                       */
/* ------------------------------------------------------------------ */

interface MatrixData {
  cols: string[];
  rows: string[];
  cells: Record<string, string>;
}

function MatrixWidget({ d }: { d: Deliverable }) {
  const [data, setData] = useDeliverable<MatrixData>(d.id, {
    cols: d.matrixCols ?? [],
    rows: d.matrixRows ?? [],
    cells: {},
  });

  const setCell = (r: number, c: number, v: string) =>
    setData({ ...data, cells: { ...data.cells, [`${r}:${c}`]: v } });
  const setColHead = (c: number, v: string) => setData({ ...data, cols: data.cols.map((x, i) => (i === c ? v : x)) });
  const setRowHead = (r: number, v: string) => setData({ ...data, rows: data.rows.map((x, i) => (i === r ? v : x)) });
  const addRow = () => setData({ ...data, rows: [...data.rows, `Competitor ${data.rows.length}`] });
  const addCol = () => setData({ ...data, cols: [...data.cols, "Dimension"] });

  return (
    <div className="overflow-x-auto rounded-lg hairline">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-mist p-0" />
            {data.cols.map((c, ci) => (
              <th key={ci} className="min-w-36 border-l border-line bg-mist p-0">
                <input
                  className="w-full bg-transparent px-3 py-2 text-center font-mono text-xs uppercase tracking-wider text-ink"
                  value={c}
                  onChange={(e) => setColHead(ci, e.target.value)}
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((r, ri) => (
            <tr key={ri} className="border-t border-line">
              <th className="sticky left-0 z-10 min-w-36 bg-panel p-0 text-left">
                <input
                  className="w-full bg-transparent px-3 py-2 font-display text-sm font-semibold text-ink"
                  value={r}
                  onChange={(e) => setRowHead(ri, e.target.value)}
                />
              </th>
              {data.cols.map((_, ci) => (
                <td key={ci} className="border-l border-line p-0 align-top">
                  <textarea
                    rows={2}
                    className="field h-full px-3 py-2 text-[0.9rem]"
                    value={data.cells[`${ri}:${ci}`] ?? ""}
                    onChange={(e) => setCell(ri, ci, e.target.value)}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex gap-2 border-t border-line bg-panel/40 p-2">
        <button className={ghostBtn} onClick={addRow}>
          <IconPlus /> Row
        </button>
        <button className={ghostBtn} onClick={addCol}>
          <IconPlus /> Column
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* tree — the Why Tree                                                 */
/* ------------------------------------------------------------------ */

interface TreeNode {
  id: string;
  parent: string | null;
  text: string;
}

function TreeBranch({
  node,
  nodes,
  depth,
  update,
  addChild,
  remove,
}: {
  node: TreeNode;
  nodes: TreeNode[];
  depth: number;
  update: (id: string, text: string) => void;
  addChild: (parent: string) => void;
  remove: (id: string) => void;
}) {
  const children = nodes.filter((n) => n.parent === node.id);
  const isRoot = node.parent === null;
  return (
    <li className="relative">
      <div className="flex items-center gap-2 py-1">
        <div
          className={`flex items-center gap-2 rounded-lg px-3 py-1.5 hairline ${
            isRoot ? "bg-ink text-paper" : "bg-paper"
          }`}
          style={!isRoot ? { borderLeft: `3px solid var(--color-coral)` } : undefined}
        >
          {!isRoot && <span className="font-mono text-[0.6rem] text-coral">WHY</span>}
          <input
            className="min-w-40 bg-transparent text-sm outline-none placeholder:text-slate/60"
            value={node.text}
            placeholder={isRoot ? "The core problem…" : "Because…"}
            onChange={(e) => update(node.id, e.target.value)}
          />
        </div>
        <button className={`${ghostBtn} px-2 py-1`} onClick={() => addChild(node.id)} aria-label="Add why">
          <IconPlus />
        </button>
        {!isRoot && (
          <button
            className="rounded-md p-1.5 text-slate hover:bg-mist hover:text-coral"
            onClick={() => remove(node.id)}
            aria-label="Remove branch"
          >
            <IconTrash />
          </button>
        )}
      </div>
      {children.length > 0 && (
        <ul className="ml-5 border-l border-dashed border-line pl-4">
          {children.map((c) => (
            <TreeBranch
              key={c.id}
              node={c}
              nodes={nodes}
              depth={depth + 1}
              update={update}
              addChild={addChild}
              remove={remove}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

function TreeWidget({ d }: { d: Deliverable }) {
  const [nodes, setNodes] = useDeliverable<TreeNode[]>(d.id, [{ id: "root", parent: null, text: "" }]);
  const root = nodes.find((n) => n.parent === null) ?? nodes[0];

  const update = (id: string, text: string) => setNodes(nodes.map((n) => (n.id === id ? { ...n, text } : n)));
  const addChild = (parent: string) => setNodes([...nodes, { id: uid(), parent, text: "" }]);
  const remove = (id: string) => {
    const doomed = new Set<string>([id]);
    let grew = true;
    while (grew) {
      grew = false;
      for (const n of nodes) if (n.parent && doomed.has(n.parent) && !doomed.has(n.id)) (doomed.add(n.id), (grew = true));
    }
    setNodes(nodes.filter((n) => !doomed.has(n.id)));
  };

  return (
    <div className="rounded-lg bg-panel/40 p-4 hairline">
      <ul>
        <TreeBranch node={root} nodes={nodes} depth={0} update={update} addChild={addChild} remove={remove} />
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* gantt — the sprint timeline                                         */
/* ------------------------------------------------------------------ */

interface Task {
  id: string;
  name: string;
  start: number; // 0..4
  end: number;
  track: string;
}
const DAYS = ["Sun", "Mon", "Tue", "Wed"];
const TRACK_COLORS: Record<string, string> = {
  Understand: "var(--color-teal)",
  Develop: "var(--color-sky)",
  Present: "var(--color-coral)",
};

function GanttWidget({ d }: { d: Deliverable }) {
  const seed: Task[] = (d.seedTasks ?? []).map((t) => ({ ...t, id: uid() }));
  const [tasks, setTasks] = useDeliverable<Task[]>(d.id, seed);
  const gridRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: string; mode: "move" | "l" | "r"; startX: number; s0: number; e0: number } | null>(null);

  const update = (id: string, patch: Partial<Task>) => setTasks(tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const dg = drag.current;
      const grid = gridRef.current;
      if (!dg || !grid) return;
      const dayW = grid.clientWidth / 4;
      const delta = Math.round((e.clientX - dg.startX) / dayW);
      let s = dg.s0;
      let en = dg.e0;
      if (dg.mode === "move") {
        s = Math.max(0, Math.min(4 - (dg.e0 - dg.s0), dg.s0 + delta));
        en = s + (dg.e0 - dg.s0);
      } else if (dg.mode === "l") {
        s = Math.max(0, Math.min(dg.e0 - 1, dg.s0 + delta));
      } else {
        en = Math.min(4, Math.max(dg.s0 + 1, dg.e0 + delta));
      }
      update(dg.id, { start: s, end: en });
    };
    const onUp = () => (drag.current = null);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [tasks]);

  const startDrag = (e: React.PointerEvent, t: Task, mode: "move" | "l" | "r") => {
    e.preventDefault();
    drag.current = { id: t.id, mode, startX: e.clientX, s0: t.start, e0: t.end };
  };

  const addTask = () => setTasks([...tasks, { id: uid(), name: "New task", start: 0, end: 1, track: "Understand" }]);
  const remove = (id: string) => setTasks(tasks.filter((t) => t.id !== id));

  return (
    <div className="rounded-lg bg-panel/40 p-3 hairline">
      {/* day header */}
      <div className="mb-2 flex pl-44">
        <div ref={gridRef} className="grid flex-1 grid-cols-4">
          {DAYS.map((day, i) => (
            <div key={day} className="border-l border-line px-2 pb-1 text-center">
              <span className="eyebrow">Day {i + 1}</span>
              <div className="font-display text-sm font-semibold">{day}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        {tasks.map((t) => (
          <div key={t.id} className="group flex items-center">
            <div className="flex w-44 items-center gap-1 pr-2">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: TRACK_COLORS[t.track] }} />
              <input
                className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                value={t.name}
                onChange={(e) => update(t.id, { name: e.target.value })}
              />
              <button
                className="rounded p-1 text-slate opacity-0 hover:text-coral group-hover:opacity-100"
                onClick={() => remove(t.id)}
                aria-label="Remove task"
              >
                <IconTrash />
              </button>
            </div>
            <div className="relative grid flex-1 grid-cols-4 rounded bg-paper/70" style={{ height: 30 }}>
              {[1, 2, 3].map((i) => (
                <div key={i} className="absolute top-0 bottom-0 border-l border-line" style={{ left: `${i * 25}%` }} />
              ))}
              <div
                className="absolute top-1 bottom-1 flex items-stretch rounded-md text-paper shadow-sm"
                style={{
                  left: `${(t.start / 4) * 100}%`,
                  width: `${((t.end - t.start) / 4) * 100}%`,
                  background: TRACK_COLORS[t.track] ?? "var(--color-ink)",
                }}
              >
                <span
                  className="w-2 cursor-ew-resize rounded-l-md hover:bg-black/15"
                  onPointerDown={(e) => startDrag(e, t, "l")}
                />
                <span
                  className="flex-1 cursor-grab select-none truncate px-1 text-center text-[0.7rem] leading-[22px]"
                  onPointerDown={(e) => startDrag(e, t, "move")}
                >
                  {t.track}
                </span>
                <span
                  className="w-2 cursor-ew-resize rounded-r-md hover:bg-black/15"
                  onPointerDown={(e) => startDrag(e, t, "r")}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <button className={addBtn} onClick={addTask}>
          <IconPlus /> Add task
        </button>
        <div className="flex gap-3">
          {Object.entries(TRACK_COLORS).map(([k, c]) => (
            <span key={k} className="flex items-center gap-1.5 text-xs text-slate">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: c }} /> {k}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* lifecycle — product life cycle curve                                */
/* ------------------------------------------------------------------ */

const STAGES = ["Development", "Introduction", "Growth", "Maturity", "Decline"];

function LifecycleWidget({ d }: { d: Deliverable }) {
  const [value, setValue] = useDeliverable<{ stage: string; note: string }>(d.id, { stage: "", note: "" });
  // bell-ish curve points across the 5 stages
  const pts = [
    { x: 40, y: 150 },
    { x: 140, y: 120 },
    { x: 260, y: 55 },
    { x: 400, y: 40 },
    { x: 520, y: 95 },
  ];
  const path = `M0,165 C20,160 ${pts[0].x},${pts[0].y} ${pts[1].x},${pts[1].y} S${pts[2].x},${pts[2].y} ${pts[3].x},${pts[3].y} S560,150 560,150`;
  return (
    <div className="rounded-lg bg-panel/40 p-4 hairline">
      <div className="overflow-x-auto">
        <svg viewBox="0 0 560 190" className="w-full min-w-[520px]" role="group" aria-label="Product life cycle">
          <line x1="0" y1="170" x2="560" y2="170" stroke="var(--color-line)" strokeWidth="1.5" />
          <path d={path} fill="none" stroke="var(--color-ink)" strokeWidth="2.5" />
          {STAGES.map((s, i) => {
            const p = pts[i];
            const active = value.stage === s;
            return (
              <g key={s} className="cursor-pointer" onClick={() => setValue({ ...value, stage: s })}>
                <line x1={p.x} y1={p.y} x2={p.x} y2="170" stroke="var(--color-line)" strokeDasharray="3 3" />
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={active ? 9 : 6}
                  fill={active ? "var(--color-coral)" : "var(--color-paper)"}
                  stroke={active ? "var(--color-coral)" : "var(--color-ink)"}
                  strokeWidth="2.5"
                />
                <text
                  x={p.x}
                  y="185"
                  textAnchor="middle"
                  className="font-mono"
                  fontSize="10"
                  fill={active ? "var(--color-coral)" : "var(--color-slate)"}
                  fontWeight={active ? 700 : 400}
                >
                  {s}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <label className="mt-2 flex flex-col gap-1">
        <span className="eyebrow">Why here?</span>
        <AutoTextarea
          value={value.note}
          onChange={(v) => setValue({ ...value, note: v })}
          placeholder="Evidence that puts the product at this stage…"
        />
      </label>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* checklist                                                           */
/* ------------------------------------------------------------------ */

function ChecklistWidget({ d }: { d: Deliverable }) {
  const [checked, setChecked] = useDeliverable<Record<string, boolean>>(d.id, {});
  return (
    <ul className="flex flex-col gap-1.5">
      {d.checklist!.map((item) => {
        const on = !!checked[item];
        return (
          <li key={item}>
            <label className="flex cursor-pointer items-center gap-3 rounded-lg bg-panel/60 px-4 py-2.5 hairline transition-colors hover:bg-panel">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={on}
                onChange={() => setChecked({ ...checked, [item]: !on })}
              />
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
                  on ? "border-coral bg-coral text-paper" : "border-line bg-paper"
                }`}
              >
                {on && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                    <path d="M2 6.5l2.5 2.5L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span className={`text-sm ${on ? "text-slate line-through" : "text-ink"}`}>{item}</span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* palette — visual identity                                           */
/* ------------------------------------------------------------------ */

function PaletteWidget({ d }: { d: Deliverable }) {
  const [value, setValue] = useDeliverable<{ swatches: string[]; tone: string }>(d.id, {
    swatches: ["#0c2a27", "#fb5230"],
    tone: "",
  });
  const setSwatch = (i: number, hex: string) =>
    setValue({ ...value, swatches: value.swatches.map((s, idx) => (idx === i ? hex : s)) });
  const addSwatch = () => setValue({ ...value, swatches: [...value.swatches, "#128379"] });
  const removeSwatch = (i: number) => setValue({ ...value, swatches: value.swatches.filter((_, idx) => idx !== i) });

  return (
    <div className="rounded-lg bg-panel/40 p-4 hairline">
      <span className="eyebrow">Brand palette</span>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        {value.swatches.map((hex, i) => (
          <div key={i} className="group relative flex flex-col items-center gap-1">
            <label
              className="block h-14 w-14 cursor-pointer rounded-xl shadow-sm ring-1 ring-black/10"
              style={{ background: hex }}
            >
              <input
                type="color"
                className="sr-only"
                value={hex}
                onChange={(e) => setSwatch(i, e.target.value)}
                aria-label={`Swatch ${i + 1}`}
              />
            </label>
            <span className="font-mono text-[0.6rem] text-slate">{hex}</span>
            <button
              className="absolute -right-1 -top-1 hidden rounded-full bg-ink p-1 text-paper group-hover:block"
              onClick={() => removeSwatch(i)}
              aria-label={`Remove swatch ${i + 1}`}
            >
              <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden>
                <path d="M1 1l6 6M7 1L1 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        ))}
        <button
          className="flex h-14 w-14 items-center justify-center rounded-xl border-2 border-dashed border-line text-slate hover:border-coral hover:text-coral"
          onClick={addSwatch}
          aria-label="Add swatch"
        >
          <IconPlus />
        </button>
      </div>
      <label className="mt-4 flex flex-col gap-1">
        <span className="eyebrow">Tone of voice</span>
        <AutoTextarea
          value={value.tone}
          onChange={(v) => setValue({ ...value, tone: v })}
          placeholder="Confident, playful, technical…  Three words that capture the brand."
        />
      </label>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* dispatcher                                                          */
/* ------------------------------------------------------------------ */

export function Widget({ d }: { d: Deliverable }) {
  switch (d.kind) {
    case "text":
      return <TextWidget d={d} />;
    case "sections":
      return <SectionsWidget d={d} />;
    case "records":
      return <RecordsWidget d={d} />;
    case "matrix":
      return <MatrixWidget d={d} />;
    case "tree":
      return <TreeWidget d={d} />;
    case "gantt":
      return <GanttWidget d={d} />;
    case "lifecycle":
      return <LifecycleWidget d={d} />;
    case "checklist":
      return <ChecklistWidget d={d} />;
    case "palette":
      return <PaletteWidget d={d} />;
    default:
      return null;
  }
}
