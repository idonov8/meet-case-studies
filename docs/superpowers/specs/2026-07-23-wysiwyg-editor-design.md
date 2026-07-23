# WYSIWYG editor for long text fields

## Problem

Every long-form answer in the Sprint Room workspace (`src/components/widgets.tsx`) is a plain
auto-resizing `<textarea>` via the shared `AutoTextarea` component. Students writing multi-sentence
answers (problem statements, rationale, research findings, etc.) have no way to add structure —
bold emphasis, lists, headings — beyond raw line breaks.

## Goal

Replace `AutoTextarea` with a rich-text (WYSIWYG) editor, built on an existing open-source library
rather than implemented from scratch, across every field that currently uses it.

## Library: Tiptap

[Tiptap](https://tiptap.dev) v3, headless and built on ProseMirror. Core is MIT-licensed and free;
only optional "Pro" extensions (collab cursors, AI) are paid, and none of those are used here.

Chosen over Lexical because it's headless with less boilerplate for this feature set, and its
`StarterKit` bundle already includes everything needed (bold, italic, lists, heading, blockquote,
link) in a single package for Tiptap v3.

Packages added:
- `@tiptap/react`
- `@tiptap/pm`
- `@tiptap/starter-kit`
- `@tiptap/extension-placeholder`

## Scope — which fields change

Every call site of the current `AutoTextarea` component, **except** the ones noted below:

| Widget | Field(s) | Change |
|---|---|---|
| `TextWidget` (kind: `text`) | e.g. Problem statement, UVP, Unfair Advantage, Additional research | → rich text |
| `SectionsWidget` | any section with `type: "textarea"` (the default) | → rich text |
| `RecordsWidget` / `FieldInput` | any record field with `type: "textarea"` | → rich text |
| `PaletteWidget` | assessment, tone | → rich text |
| `LifecycleWidget` | note | → rich text |
| `TextWidget` | `presentation-link` specifically | **stays a plain single-line `<input>`** — it's a URL, not prose, even though it currently reuses `AutoTextarea` |
| `MatrixWidget` | competitive-analysis cells | **unchanged** — already a plain `<textarea>`, not `AutoTextarea`, and stays that way (short grid notes) |
| `SectionsWidget` (readonly mode) | `brief` deliverable preview | **unchanged** — plain-text display of synced data, never edited through this editor |

Since `presentation-link` is the only `kind: "text"` deliverable that isn't prose, `TextWidget` needs
a way to render a plain input instead of the rich editor for that one case (e.g. a `plain?: boolean`
flag on the `Deliverable`, checked in `deliverables.ts` for that entry).

## Component design

A new `RichTextField` component in `widgets.tsx`, matching `AutoTextarea`'s existing props
(`value: string`, `onChange: (v: string) => void`, `placeholder?: string`):

- `useEditor` from `@tiptap/react` with:
  - `StarterKit.configure(...)` — headings restricted to `[2, 3]`; `codeBlock`, `horizontalRule`,
    `strike`, `underline` disabled (out of scope per the "Standard + headings" formatting choice).
  - `Placeholder.configure({ placeholder })`.
  - `immediatelyRender: false` (avoids Tiptap's SSR-mismatch warning; harmless here since the whole
    workspace renders `client:only="react"`, but it's the documented-correct setting).
  - `content: value` on init; `onUpdate` calls `onChange(editor.getHTML())`.
  - An effect that calls `editor.commands.setContent(value, { emitUpdate: false })` when `value`
    changes externally (e.g. after "reset all") and the editor isn't currently focused, so external
    resets take effect without fighting the user's cursor.
- `BubbleMenu` (from `@tiptap/react/menus`) — floating toolbar shown only on text selection, with
  buttons: **B**, *I*, H2, H3, bullet list, numbered list, blockquote, link. Buttons styled after the
  existing `ghostBtn` pill style, highlighted (e.g. `bg-ink text-paper`) when the mark/node is active
  at the current selection.
- Link button: `window.prompt()` for the URL (no modal system exists in this codebase; introducing
  one is out of scope). Empty/cancelled prompt removes the link mark; a value sets/toggles it.

`AutoTextarea` is deleted once all call sites are migrated — `MatrixWidget`'s raw `<textarea>` is
untouched and doesn't depend on it.

## Data & storage

No type changes anywhere in `deliverables.ts` or `store.ts` — every value stays a plain `string`; it
now happens to contain HTML (from `editor.getHTML()`) instead of raw text.

Existing `localStorage` values (plain text, no markup) parse safely as HTML on load — a plain string
becomes a single paragraph node with no visible change. **No migration script needed.**

`completion()` / `nonEmpty()` in [store.ts](../../../src/lib/store.ts) currently does a plain
`.trim()` check, which would treat Tiptap's empty output (`<p></p>`) as "filled." `nonEmpty()` will
strip HTML tags (`replace(/<[^>]*>/g, "")`) before trimming, which works uniformly for both legacy
plain strings and new HTML strings — no other completion logic changes needed since `text`,
`sections`, and `records` completion all route through the same `nonEmpty()` check.

## Styling

New CSS (in `src/styles/global.css`, scoped to a `.rte-content` class on the editor's content
element) for:
- Base font/line-height/padding matching the current `.field` class, so it doesn't look visually
  different from the surrounding plain inputs when empty/unfocused.
- `h2`/`h3`, `ul`/`ol` (Tailwind's reset strips default list markers/indent — need `list-disc` /
  `list-decimal` + padding), `blockquote` (left border in `--color-brand`, matching the Why Tree's
  branch accent), and link color/underline.
- Placeholder text styling via Tiptap's `data-placeholder` empty-node attribute.

The `BubbleMenu` toolbar gets its own small styled pill, consistent with `btn`/`ghostBtn`.

## Testing plan

Manual verification in the browser preview (no existing test suite in this repo):
1. Start dev server, open the workspace, confirm existing plain-text answers still display
   correctly after the swap (no data loss from the localStorage → HTML transition).
2. Type in a `TextWidget` field (e.g. Problem statement): select text, confirm bubble menu appears;
   toggle bold/italic/H2/H3/lists/blockquote/link; confirm formatting round-trips through a page
   reload (persisted via `localStorage`).
3. Confirm `presentation-link` is still a plain single-line input, not rich text.
4. Confirm Matrix cells are untouched (still plain textareas).
5. Add/remove rows in `RecordsWidget` with a textarea field; confirm rich text works per-row and
   independently.
6. Confirm progress rings / completion percentages still behave correctly for empty vs. filled
   rich-text fields (the `nonEmpty()` HTML-stripping fix).
7. Confirm "Reset all" clears rich-text fields back to placeholder/empty state.
