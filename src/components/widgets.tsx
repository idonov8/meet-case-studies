import { useEffect, useRef, useState, type ReactNode } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import type { Deliverable, RecordField, TrackerStatus } from "../lib/deliverables";
import { useDeliverable } from "../lib/store";
import { MOCK_COMPANY_NAME, MOCK_TEAM_MEMBERS } from "../lib/mockTeam";

/* ------------------------------------------------------------------ */
/* Shared primitives                                                   */
/* ------------------------------------------------------------------ */

const menuBtn =
  "flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm font-semibold text-slate hover:bg-mist hover:text-ink transition-colors";
const menuBtnActive = "bg-ink text-paper hover:bg-ink hover:text-paper";

function IconBulletList() {
  return (
    <svg width="15" height="13" viewBox="0 0 16 14" fill="none" aria-hidden>
      <circle cx="1.5" cy="2" r="1.4" fill="currentColor" />
      <circle cx="1.5" cy="7" r="1.4" fill="currentColor" />
      <circle cx="1.5" cy="12" r="1.4" fill="currentColor" />
      <path d="M5.5 2h9M5.5 7h9M5.5 12h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function MenuButton({
  onClick,
  active,
  label,
  title,
  className,
}: {
  onClick: () => void;
  active?: boolean;
  label: ReactNode;
  title: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={`${menuBtn} ${active ? menuBtnActive : ""} ${className ?? ""}`}
      title={title}
      aria-label={title}
      aria-pressed={!!active}
      // mousedown (not click), and blur the field never fires: this keeps the editor
      // focused through the click so the toolbar doesn't disappear mid-interaction
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
    >
      {label}
    </button>
  );
}

function RichTextToolbar({ editor, visible }: { editor: Editor; visible: boolean }) {
  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", prev ?? "https://");
    if (url == null) return;
    if (url === "") {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
  };
  return (
    <div className={`rte-toolbar flex items-center gap-1 ${visible ? "rte-toolbar--visible" : ""}`}>
      <div className="flex w-full flex-wrap items-center gap-1 border-b border-line pb-2 mb-2">
        <MenuButton className="font-bold" label="B" title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} />
        <MenuButton className="italic" label="I" title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} />
        <MenuButton className="underline" label="U" title="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()} />
        <span className="mx-0.5 h-5 w-px bg-line" />
        <MenuButton
          className="text-lg font-bold"
          label="H1"
          title="Heading 1"
          active={editor.isActive("heading", { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        />
        <MenuButton
          className="text-base font-bold"
          label="H2"
          title="Heading 2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        />
        <MenuButton
          className="text-sm font-bold"
          label="H3"
          title="Heading 3"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        />
        <span className="mx-0.5 h-5 w-px bg-line" />
        <MenuButton label={<IconBulletList />} title="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} />
        <MenuButton label="1." title="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} />
        <MenuButton label="❝" title="Blockquote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()} />
        <MenuButton label="🔗" title="Link" active={editor.isActive("link")} onClick={setLink} />
      </div>
    </div>
  );
}

function RichTextField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [focused, setFocused] = useState(false);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: false,
        horizontalRule: false,
        strike: false,
        link: { openOnClick: false, autolink: true },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    immediatelyRender: false,
    editorProps: { attributes: { class: "rte-content" } },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
  });

  // Keep external resets (e.g. "reset all") in sync without fighting the user's cursor.
  useEffect(() => {
    if (!editor || editor.isFocused) return;
    if (editor.getHTML() !== value) editor.commands.setContent(value, { emitUpdate: false });
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className="rte">
      <RichTextToolbar editor={editor} visible={focused} />
      <EditorContent editor={editor} className="field" />
    </div>
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

function IconArrowDeeper() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path d="M3 1v5a2 2 0 0 0 2 2h5M8 5.5 11 8l-3 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function MockBadge({ note }: { note: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-panel/60 px-3 py-2 hairline">
      <span
        className="shrink-0 rounded-full bg-mist px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-wider text-slate"
        title={note}
      >
        Mock data
      </span>
      <span className="text-xs text-slate">{note}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* text                                                                */
/* ------------------------------------------------------------------ */

function TextWidget({ d }: { d: Deliverable }) {
  const [value, setValue] = useDeliverable<string>(d.id, "");
  return (
    <div className="rounded-lg bg-panel/60 px-4 py-3 hairline">
      {d.plain ? (
        <input
          className="field text-[0.95rem]"
          value={value}
          placeholder={d.placeholder}
          onChange={(e) => setValue(e.target.value)}
        />
      ) : (
        <RichTextField value={value} onChange={setValue} placeholder={d.placeholder} />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* sections                                                            */
/* ------------------------------------------------------------------ */

function SectionsWidget({ d }: { d: Deliverable }) {
  const [value, setValue] = useDeliverable<Record<string, string>>(d.id, d.sectionsSeed ?? {});

  if (d.readonly) {
    const values = d.sectionsSeed ?? {};
    return (
      <div className="flex flex-col gap-3">
        <MockBadge note="Preview of your team & company data — will sync live from your account once sign-in is connected." />
        <div className="grid gap-3 sm:grid-cols-2">
          {d.sections!.map((s) => (
            <div
              key={s.key}
              className={`flex flex-col gap-1.5 rounded-lg bg-panel/60 px-4 py-3 hairline ${
                (s.type ?? "textarea") === "textarea" ? "sm:col-span-2" : ""
              }`}
            >
              <span className="eyebrow">{s.label}</span>
              <span className="whitespace-pre-wrap text-[0.95rem] text-ink">{values[s.key] || "—"}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {d.sectionsSeed && <MockBadge note="Pre-filled with a placeholder company & team — replace with your real details." />}
      <div className="grid gap-3 sm:grid-cols-2">
      {d.sections!.map((s) => {
        const type = s.type ?? "textarea";
        const set = (v: string) => setValue({ ...value, [s.key]: v });
        return (
          <label
            key={s.key}
            className={`flex flex-col gap-1.5 rounded-lg bg-panel/60 px-4 py-3 hairline ${
              type === "textarea" ? "sm:col-span-2" : ""
            }`}
          >
            <span className="eyebrow">{s.label}</span>
            {type === "select" ? (
              <select
                className="w-full rounded-md bg-paper px-2.5 py-1.5 text-sm hairline"
                value={value[s.key] ?? ""}
                onChange={(e) => set(e.target.value)}
              >
                <option value="">—</option>
                {s.options!.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            ) : type === "text" ? (
              <input
                className="field text-[0.95rem]"
                value={value[s.key] ?? ""}
                placeholder={s.placeholder}
                onChange={(e) => set(e.target.value)}
              />
            ) : (
              <RichTextField value={value[s.key] ?? ""} onChange={set} placeholder={s.placeholder} />
            )}
          </label>
        );
      })}
      </div>
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
    return <RichTextField value={value ?? ""} onChange={onChange} placeholder={field.placeholder} />;
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
            className="absolute right-2 top-2 rounded-md p-1.5 text-slate opacity-0 transition-opacity hover:bg-mist hover:text-brand group-hover:opacity-100 focus-visible:opacity-100"
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
  update,
  addChild,
  addSibling,
  remove,
}: {
  node: TreeNode;
  nodes: TreeNode[];
  update: (id: string, text: string) => void;
  addChild: (parent: string) => void;
  addSibling: (node: TreeNode) => void;
  remove: (id: string) => void;
}) {
  const children = nodes.filter((n) => n.parent === node.id);
  const isRoot = node.parent === null;
  return (
    <div className="flex items-center">
      <div className="flex shrink-0 flex-col items-start gap-1.5 py-1">
        <div
          className={`flex items-center gap-2 rounded-lg px-3 py-1.5 hairline ${
            isRoot ? "bg-ink text-paper" : "bg-paper"
          }`}
          style={!isRoot ? { borderLeft: `3px solid var(--color-brand)` } : undefined}
        >
          {!isRoot && <span className="font-mono text-[0.6rem] text-brand">WHY</span>}
          <input
            className={`min-w-40 bg-transparent text-sm outline-none placeholder:text-slate/60 ${
              isRoot ? "placeholder:text-paper/50" : ""
            }`}
            value={node.text}
            placeholder={isRoot ? "The core problem…" : "Because…"}
            onChange={(e) => update(node.id, e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1 pl-1">
          <button
            className={`${ghostBtn} px-2 py-1`}
            onClick={() => addChild(node.id)}
            aria-label="Ask why — add a deeper cause"
            title="Ask why — add a cause of this"
          >
            <IconArrowDeeper /> why?
          </button>
          {!isRoot && (
            <button
              className={`${ghostBtn} px-2 py-1`}
              onClick={() => addSibling(node)}
              aria-label="Add another cause at this level"
              title="Add another cause at this level"
            >
              <IconPlus /> and
            </button>
          )}
          {!isRoot && (
            <button
              className="rounded-md p-1.5 text-slate hover:bg-mist hover:text-brand"
              onClick={() => remove(node.id)}
              aria-label="Remove branch"
            >
              <IconTrash />
            </button>
          )}
        </div>
      </div>
      {children.length > 0 && (
        <>
          <span className="h-0 w-6 shrink-0 self-center border-t-2 border-dashed border-line" />
          <div className="flex flex-col gap-3 border-l-2 border-dashed border-line pl-6">
            {children.map((c) => (
              <div key={c.id} className="relative flex items-center">
                <span className="absolute -left-6 top-1/2 h-0 w-6 -translate-y-1/2 border-t-2 border-dashed border-line" />
                <TreeBranch
                  node={c}
                  nodes={nodes}
                  update={update}
                  addChild={addChild}
                  addSibling={addSibling}
                  remove={remove}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function TreeWidget({ d }: { d: Deliverable }) {
  const [nodes, setNodes] = useDeliverable<TreeNode[]>(d.id, [{ id: "root", parent: null, text: "" }]);
  const root = nodes.find((n) => n.parent === null) ?? nodes[0];

  const update = (id: string, text: string) => setNodes(nodes.map((n) => (n.id === id ? { ...n, text } : n)));
  const addChild = (parent: string) => setNodes([...nodes, { id: uid(), parent, text: "" }]);
  // A sibling shares the node's parent — another cause at the same level. The root has
  // no parent, so a sibling of it would be a second root; disallowed in the UI.
  const addSibling = (node: TreeNode) =>
    node.parent === null ? undefined : setNodes([...nodes, { id: uid(), parent: node.parent, text: "" }]);
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
    <div className="overflow-x-auto rounded-lg bg-panel/40 p-4 hairline">
      <TreeBranch node={root} nodes={nodes} update={update} addChild={addChild} addSibling={addSibling} remove={remove} />
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
  Understand: "var(--color-brand)",
  Develop: "var(--color-sky)",
  Present: "var(--color-red)",
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
                className="rounded p-1 text-slate opacity-0 hover:text-brand group-hover:opacity-100"
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

// Build a smooth curve (Catmull-Rom → cubic Bézier) that passes exactly through
// the given points, so the plotted dots always sit on the line.
function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return "";
  const p = (i: number) => pts[Math.max(0, Math.min(pts.length - 1, i))];
  let d = `M${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = p(i - 1), p1 = p(i), p2 = p(i + 1), p3 = p(i + 2);
    const c1x = p1.x + (p2.x - p0.x) / 6, c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6, c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C${c1x},${c1y} ${c2x},${c2y} ${p2.x},${p2.y}`;
  }
  return d;
}

function LifecycleWidget({ d }: { d: Deliverable }) {
  const [value, setValue] = useDeliverable<{ stage: string; note: string }>(d.id, { stage: "", note: "" });
  const W = 600, BASE = 172;
  // Evenly-spaced stages with the classic PLC height profile (dev low → grow → peak → decline).
  const ys = [150, 128, 62, 46, 104];
  const pts = STAGES.map((_, i) => ({ x: 60 + i * ((W - 120) / (STAGES.length - 1)), y: ys[i] }));
  const path = smoothPath(pts);
  return (
    <div className="rounded-lg bg-panel/40 p-4 hairline">
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${W} 200`} className="w-full min-w-[520px]" role="group" aria-label="Product life cycle">
          <line x1="0" y1={BASE} x2={W} y2={BASE} stroke="var(--color-line)" strokeWidth="1.5" />
          <path d={path} fill="none" stroke="var(--color-ink)" strokeWidth="2.5" strokeLinecap="round" />
          {STAGES.map((s, i) => {
            const p = pts[i];
            const active = value.stage === s;
            return (
              <g key={s} className="cursor-pointer" onClick={() => setValue({ ...value, stage: s })}>
                <line x1={p.x} y1={p.y} x2={p.x} y2={BASE} stroke="var(--color-line)" strokeDasharray="3 3" />
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={active ? 9 : 6}
                  fill={active ? "var(--color-brand)" : "var(--color-paper)"}
                  stroke={active ? "var(--color-brand)" : "var(--color-ink)"}
                  strokeWidth="2.5"
                />
                <text
                  x={p.x}
                  y="192"
                  textAnchor="middle"
                  className="font-mono"
                  fontSize="11"
                  fill={active ? "var(--color-brand)" : "var(--color-slate)"}
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
        <RichTextField
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
                  on ? "border-brand bg-brand text-paper" : "border-line bg-paper"
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
  const [value, setValue] = useDeliverable<{ swatches: string[]; tone: string; assessment: string }>(d.id, {
    swatches: ["#123330", "#34afb0"],
    tone: "",
    assessment: "",
  });
  const setSwatch = (i: number, hex: string) =>
    setValue({ ...value, swatches: value.swatches.map((s, idx) => (idx === i ? hex : s)) });
  const addSwatch = () => setValue({ ...value, swatches: [...value.swatches, "#e04444"] });
  const removeSwatch = (i: number) => setValue({ ...value, swatches: value.swatches.filter((_, idx) => idx !== i) });

  return (
    <div className="rounded-lg bg-panel/40 p-4 hairline">
      <label className="mb-4 flex flex-col gap-1">
        <span className="eyebrow">Assessment — are they communicating well? What needs to change?</span>
        <RichTextField
          value={value.assessment}
          onChange={(v) => setValue({ ...value, assessment: v })}
          placeholder="Their visual identity says…  It works / falls short because…"
        />
      </label>
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
          className="flex h-14 w-14 items-center justify-center rounded-xl border-2 border-dashed border-line text-slate hover:border-brand hover:text-brand"
          onClick={addSwatch}
          aria-label="Add swatch"
        >
          <IconPlus />
        </button>
      </div>
      <label className="mt-4 flex flex-col gap-1">
        <span className="eyebrow">Tone of voice</span>
        <RichTextField
          value={value.tone}
          onChange={(v) => setValue({ ...value, tone: v })}
          placeholder="Confident, playful, technical…  Three words that capture the brand."
        />
      </label>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* upload — Social Lean Canvas (mock, local-only)                      */
/* ------------------------------------------------------------------ */

interface Upload {
  name: string;
  type: string;
  size: number;
  dataUrl?: string; // kept only for small images
}

// ponytail: the real product will upload to storage on submit. For now we keep
// the file in localStorage — capped at ~1.2MB and images only, so the shared
// state JSON can't blow the ~5MB localStorage quota. Upgrade path: swap the
// FileReader block for an upload to the backend and store the returned URL.
const PREVIEW_CAP = 1_200_000;

function UploadWidget({ d }: { d: Deliverable }) {
  const [file, setFile] = useDeliverable<Upload | null>(d.id, null);
  const inputRef = useRef<HTMLInputElement>(null);

  const onPick = (f: File | undefined) => {
    if (!f) return;
    const base: Upload = { name: f.name, type: f.type, size: f.size };
    if (f.type.startsWith("image/") && f.size <= PREVIEW_CAP) {
      const reader = new FileReader();
      reader.onload = () => setFile({ ...base, dataUrl: String(reader.result) });
      reader.readAsDataURL(f);
    } else {
      setFile(base);
    }
  };

  const kb = file ? (file.size < 1024 * 1024 ? `${Math.round(file.size / 1024)} KB` : `${(file.size / 1024 / 1024).toFixed(1)} MB`) : "";

  return (
    <div className="rounded-lg bg-panel/40 p-4 hairline">
      {!file ? (
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-line py-10 text-center transition-colors hover:border-brand">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden className="text-brand">
            <path d="M12 16V4m0 0L7 9m5-5 5 5M4 17v2a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-display text-sm font-semibold text-ink">Upload your Social Lean Canvas</span>
          <span className="text-xs text-slate">Image or PDF — drag in or click to choose</span>
          <input
            ref={inputRef}
            type="file"
            accept={d.accept}
            className="sr-only"
            onChange={(e) => onPick(e.target.files?.[0] ?? undefined)}
          />
        </label>
      ) : (
        <div className="flex flex-col gap-3">
          {file.dataUrl ? (
            <img src={file.dataUrl} alt={`Preview of ${file.name}`} className="max-h-80 w-full rounded-lg object-contain ring-1 ring-black/10" />
          ) : (
            <div className="flex items-center gap-3 rounded-lg bg-paper px-4 py-6 hairline">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden className="text-slate">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
              </svg>
              <div>
                <div className="text-sm font-semibold text-ink">{file.name}</div>
                <div className="text-xs text-slate">Preview available on the live product — file kept locally for now.</div>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="truncate text-xs text-slate">
              {file.name} · {kb}
            </span>
            <button className={ghostBtn} onClick={() => setFile(null)}>
              <IconTrash /> Remove
            </button>
          </div>
        </div>
      )}
      <p className="mt-3 text-xs text-slate">
        Mock upload — the file stays in your browser. Real submission comes with Google sign-in.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* tracker — the sprint Task Tracker                                   */
/* ------------------------------------------------------------------ */

interface TrackerRow {
  owner: string;
  status: TrackerStatus;
  staffChecked: boolean;
  notes: string;
}
type TrackerState = Record<string, TrackerRow>;

const EMPTY_ROW: TrackerRow = { owner: "", status: "not-started", staffChecked: false, notes: "" };
const STATUS_LABELS: Record<TrackerStatus, string> = {
  "not-started": "Not started",
  "in-progress": "In progress",
  done: "Done",
};
const STATUS_COLORS: Record<TrackerStatus, string> = {
  "not-started": "var(--color-slate)",
  "in-progress": "var(--color-sky)",
  done: "var(--color-green)",
};
const TRACKER_GRID = "grid-cols-[1fr_150px_136px_96px_220px]";
const STAFF_ONLY = "For instructor use — not editable by students";

function TrackerRowView({
  task,
  row,
  onChange,
  striped,
}: {
  task: { key: string; label: string };
  row: TrackerRow;
  onChange: (patch: Partial<TrackerRow>) => void;
  striped: boolean;
}) {
  return (
    <div className={`grid ${TRACKER_GRID} items-center gap-3 border-t border-line px-3 py-2 text-sm ${striped ? "bg-panel/30" : ""}`}>
      <span className="text-ink">{task.label}</span>
      <select
        className="rounded-md bg-paper px-2 py-1 text-xs font-medium hairline"
        value={row.owner}
        onChange={(e) => onChange({ owner: e.target.value })}
      >
        <option value="">—</option>
        {MOCK_TEAM_MEMBERS.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
      <select
        className="rounded-md bg-paper px-2 py-1 text-xs font-medium hairline"
        value={row.status}
        onChange={(e) => onChange({ status: e.target.value as TrackerStatus })}
        style={{ color: STATUS_COLORS[row.status] }}
      >
        {(Object.keys(STATUS_LABELS) as TrackerStatus[]).map((s) => (
          <option key={s} value={s}>
            {STATUS_LABELS[s]}
          </option>
        ))}
      </select>
      <span className="flex justify-center" title={STAFF_ONLY}>
        <input type="checkbox" checked={row.staffChecked} disabled className="h-4 w-4 rounded border-line opacity-60" />
      </span>
      <span className="truncate text-xs text-slate" title={row.notes || STAFF_ONLY}>
        {row.notes || "—"}
      </span>
    </div>
  );
}

function TrackerWidget({ d }: { d: Deliverable }) {
  const seeded: TrackerState = {};
  for (const group of d.trackerGroups ?? []) {
    for (const task of group.tasks) {
      if (task.seed) seeded[task.key] = { ...EMPTY_ROW, ...task.seed };
    }
  }
  const [state, setState] = useDeliverable<TrackerState>(d.id, seeded);
  const getRow = (key: string): TrackerRow => state[key] ?? EMPTY_ROW;
  const setRow = (key: string, patch: Partial<TrackerRow>) =>
    setState({ ...state, [key]: { ...getRow(key), ...patch } });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 rounded-lg bg-panel/60 px-4 py-2.5 hairline">
        <span className="text-sm">
          Tracking for <span className="font-semibold">{MOCK_COMPANY_NAME}</span>
        </span>
        <span
          className="ml-auto shrink-0 rounded-full bg-mist px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-wider text-slate"
          title="This company name and team roster are placeholders — real data will load from your team's account once sign-in is live."
        >
          Mock data
        </span>
      </div>
      {d.trackerGroups!.map((group) => (
        <div key={group.label} className="overflow-hidden rounded-lg hairline">
          <div className="eyebrow bg-mist px-3 py-1.5" style={{ borderLeft: "3px solid var(--color-brand)" }}>
            {group.label}
          </div>
          <div className={`grid ${TRACKER_GRID} gap-3 bg-panel/50 px-3 py-1.5 text-[0.65rem] uppercase tracking-wider text-slate`}>
            <span>Task</span>
            <span>Owner</span>
            <span>Status</span>
            <span className="text-center" title={STAFF_ONLY}>
              Staff checked
            </span>
            <span title={STAFF_ONLY}>Notes</span>
          </div>
          {group.tasks.map((task, i) => (
            <TrackerRowView
              key={task.key}
              task={task}
              row={getRow(task.key)}
              onChange={(patch) => setRow(task.key, patch)}
              striped={i % 2 === 1}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* dispatcher                                                          */
/* ------------------------------------------------------------------ */

export function Widget({ d }: { d: Deliverable }) {
  switch (d.kind) {
    case "upload":
      return <UploadWidget d={d} />;
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
    case "tracker":
      return <TrackerWidget d={d} />;
    default:
      return null;
  }
}
