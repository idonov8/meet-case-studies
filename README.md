# Sprint Room — Case Study Deliverables

An interactive workspace where student teams draft, structure, and track every deliverable
of their case-study sprint (Sun–Wed), instead of filling a static document.

Built from the *Case Studies Deliverables* template: 3 parts, 22 deliverables, each rendered
as a purpose-built interactive tool rather than a plain form field.

## Highlights

- **Landing + mock login** — a "Continue with Google" button that goes straight into the
  workspace (real Google auth is not wired up yet).
- **Interactive deliverables**, e.g.
  - **Why Tree** — build a cause tree by adding/removing "why?" branches.
  - **Sprint Gantt** — drag task bars across the four days to plan the sprint.
  - **Competitive matrix** — an editable grid with add-row / add-column.
  - **Product life-cycle curve** — click a stage on the PLC curve.
  - **Visual identity** — a live colour-swatch palette picker.
  - Structured records, sectioned prompts, and checklists for the rest.
- **Live progress** — per-deliverable, per-part, and overall completion, plus a deadline countdown.
- **Local persistence** — answers save to the browser (`localStorage`); no backend required.

## Tech

Astro · React · Tailwind CSS v4. Static output — deployable anywhere (e.g. Vercel).

## Develop

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static build to dist/
npm run check    # astro type-check
```

Requires Node 22+.
