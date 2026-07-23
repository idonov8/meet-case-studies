// The structure of the case study, inferred from the deliverables template.
// Each deliverable maps to an interactive widget (its `kind`).

export type FieldType = "text" | "textarea" | "select";

export interface RecordField {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: string[];
}

export interface Deliverable {
  id: string;
  title: string;
  prompt: string;
  day: 1 | 2 | 3;
  kind:
    | "text"
    | "sections"
    | "records"
    | "matrix"
    | "tree"
    | "gantt"
    | "lifecycle"
    | "checklist"
    | "palette";
  // kind-specific config
  placeholder?: string;
  sections?: { key: string; label: string; placeholder?: string }[];
  fields?: RecordField[];
  recordNoun?: string; // e.g. "question", "competitor"
  highlightMax?: number; // for records that should stay small (e.g. 2-3 recommendations)
  matrixCols?: string[];
  matrixRows?: string[];
  checklist?: string[];
  seedTasks?: { name: string; start: number; end: number; track: string }[];
}

export interface Part {
  id: string;
  index: number;
  title: string;
  tagline: string;
  blurb: string;
  deliverables: Deliverable[];
}

export const PARTS: Part[] = [
  {
    id: "understand",
    index: 1,
    title: "Understand",
    tagline: "Company & challenge",
    blurb:
      "Research the company, analyze the challenge, and complete the minimum requirements. Then draft your SLC with Claude.",
    deliverables: [
      {
        id: "research",
        title: "Company research",
        prompt: "What did you learn? Log each finding with its source.",
        day: 1,
        kind: "records",
        recordNoun: "finding",
        fields: [
          { key: "source", label: "Source", type: "text", placeholder: "Website, article, LinkedIn…" },
          { key: "insight", label: "Insight", type: "textarea", placeholder: "What this tells you about the company" },
        ],
      },
      {
        id: "problem",
        title: "Problem statement",
        prompt: "In one or two sentences, what problem is the company facing?",
        day: 1,
        kind: "text",
        placeholder: "The company struggles to…",
      },
      {
        id: "current-solution",
        title: "Current solution",
        prompt: "How does the company address this problem today?",
        day: 1,
        kind: "text",
        placeholder: "Right now they…",
      },
      {
        id: "value",
        title: "UVP & Unfair Advantage",
        prompt: "Sharpen what makes the company distinctly valuable and hard to copy.",
        day: 1,
        kind: "sections",
        sections: [
          { key: "uvp", label: "Unique Value Proposition", placeholder: "The one thing they do better than anyone…" },
          { key: "unfair", label: "Unfair Advantage", placeholder: "What can't be easily bought or copied…" },
        ],
      },
      {
        id: "questions",
        title: "Questions for the rep",
        prompt: "What do you need to ask in the meeting with your company representative?",
        day: 1,
        kind: "records",
        recordNoun: "question",
        fields: [{ key: "q", label: "Question", type: "textarea", placeholder: "What we still need to know…" }],
      },
      {
        id: "competitive",
        title: "Competitive analysis",
        prompt: "Compare the company against its rivals across the dimensions that matter.",
        day: 2,
        kind: "matrix",
        matrixCols: ["Positioning", "Pricing", "Strength", "Weakness"],
        matrixRows: ["Your company", "Competitor 1", "Competitor 2"],
      },
      {
        id: "stakeholders",
        title: "Stakeholders",
        prompt: "Who is affected, and how much influence do they hold?",
        day: 2,
        kind: "records",
        recordNoun: "stakeholder",
        fields: [
          { key: "name", label: "Name / group", type: "text", placeholder: "e.g. Operations team" },
          { key: "influence", label: "Influence", type: "select", options: ["High", "Medium", "Low"] },
          { key: "needs", label: "Needs & interests", type: "textarea", placeholder: "What they care about" },
        ],
      },
      {
        id: "identity",
        title: "Visual identity",
        prompt: "Capture the brand's palette and tone so your work stays on-brand.",
        day: 2,
        kind: "palette",
      },
      {
        id: "lifecycle",
        title: "Product life cycle",
        prompt: "Where does the product sit today?",
        day: 2,
        kind: "lifecycle",
      },
      {
        id: "channels",
        title: "Channels",
        prompt: "How does the company reach and serve its customers?",
        day: 2,
        kind: "records",
        recordNoun: "channel",
        fields: [
          { key: "channel", label: "Channel", type: "text", placeholder: "e.g. Direct sales, App store…" },
          { key: "role", label: "Role in the journey", type: "text", placeholder: "Awareness, conversion, retention…" },
        ],
      },
      {
        id: "slc",
        title: "SLC with Claude",
        prompt: "Define a Simple, Lovable, Complete first version — built with Claude.",
        day: 2,
        kind: "sections",
        sections: [
          { key: "simple", label: "Simple", placeholder: "The smallest thing that works end-to-end" },
          { key: "lovable", label: "Lovable", placeholder: "Why people will actually want it" },
          { key: "complete", label: "Complete", placeholder: "It does its one job fully, no dead ends" },
        ],
      },
    ],
  },
  {
    id: "develop",
    index: 2,
    title: "Develop",
    tagline: "Your solution",
    blurb:
      "Brainstorm, validate your assumptions, and turn analysis into 2–3 clear recommendations, next steps, and agent requirements.",
    deliverables: [
      {
        id: "brainstorm",
        title: "Brainstorm",
        prompt: "Get every idea out first — judge them later.",
        day: 2,
        kind: "records",
        recordNoun: "idea",
        fields: [
          { key: "idea", label: "Idea", type: "text", placeholder: "What if we…" },
          { key: "note", label: "Note", type: "text", placeholder: "Why it might work" },
        ],
      },
      {
        id: "assumptions",
        title: "Validate assumptions",
        prompt: "List the beliefs your solution rests on, and how you'll test each.",
        day: 2,
        kind: "records",
        recordNoun: "assumption",
        fields: [
          { key: "assumption", label: "Assumption", type: "text", placeholder: "We believe that…" },
          { key: "test", label: "How to validate", type: "textarea", placeholder: "We'll know we're right if…" },
          { key: "status", label: "Status", type: "select", options: ["Untested", "Validated", "Invalidated"] },
        ],
      },
      {
        id: "why-tree",
        title: "Why Tree",
        prompt: "Start from the problem and keep asking why to reach root causes.",
        day: 2,
        kind: "tree",
      },
      {
        id: "effect",
        title: "Effect analysis",
        prompt: "Trace how each cause ripples into effects, and how badly.",
        day: 2,
        kind: "records",
        recordNoun: "link",
        fields: [
          { key: "cause", label: "Cause", type: "text", placeholder: "Because…" },
          { key: "effect", label: "Effect", type: "text", placeholder: "…this happens" },
          { key: "severity", label: "Severity", type: "select", options: ["Critical", "Major", "Minor"] },
        ],
      },
      {
        id: "recommendations",
        title: "Recommendations",
        prompt: "Land 2–3 clear recommendations. Rank each by impact and effort.",
        day: 3,
        kind: "records",
        recordNoun: "recommendation",
        highlightMax: 3,
        fields: [
          { key: "title", label: "Recommendation", type: "text", placeholder: "We recommend that the company…" },
          { key: "rationale", label: "Rationale", type: "textarea", placeholder: "Why this, why now" },
          { key: "impact", label: "Impact", type: "select", options: ["High", "Medium", "Low"] },
          { key: "effort", label: "Effort", type: "select", options: ["Low", "Medium", "High"] },
        ],
      },
      {
        id: "next-steps",
        title: "Next steps",
        prompt: "What should the company do first, second, third?",
        day: 3,
        kind: "records",
        recordNoun: "step",
        fields: [{ key: "step", label: "Step", type: "textarea", placeholder: "The immediate next move…" }],
      },
      {
        id: "agent-requirements",
        title: "Agent requirements",
        prompt: "Spec the CS agent you'll build before you build it.",
        day: 3,
        kind: "sections",
        sections: [
          { key: "purpose", label: "Purpose", placeholder: "The single job this agent does" },
          { key: "inputs", label: "Inputs", placeholder: "What information it receives" },
          { key: "capabilities", label: "Key capabilities", placeholder: "What it can actually do" },
          { key: "guardrails", label: "Guardrails", placeholder: "What it must never do" },
          { key: "success", label: "Success criteria", placeholder: "How you'll know it works" },
        ],
      },
    ],
  },
  {
    id: "present",
    index: 3,
    title: "Present",
    tagline: "Build & pitch",
    blurb:
      "Build your presentation and your CS agent, plan the sprint, and get ready for the dry run and the final pitch.",
    deliverables: [
      {
        id: "timeline",
        title: "Sprint timeline",
        prompt: "Plan the four days. Drag the edges to reshape each task.",
        day: 1,
        kind: "gantt",
        seedTasks: [
          { name: "Company research", start: 0, end: 1, track: "Understand" },
          { name: "Problem & UVP drafts", start: 0, end: 1, track: "Understand" },
          { name: "Competitive & stakeholders", start: 1, end: 2, track: "Understand" },
          { name: "Why Tree & effect analysis", start: 1, end: 2, track: "Develop" },
          { name: "Recommendations", start: 2, end: 3, track: "Develop" },
          { name: "Build the agent", start: 1, end: 3, track: "Present" },
          { name: "Presentation", start: 2, end: 3, track: "Present" },
          { name: "Dry run", start: 3, end: 4, track: "Present" },
        ],
      },
      {
        id: "presentation",
        title: "Presentation outline",
        prompt: "A 5-minute pitch. Check off each slide as it's ready.",
        day: 3,
        kind: "checklist",
        checklist: [
          "Hook — the problem in one line",
          "The company & the challenge",
          "Your analysis (the key insight)",
          "Recommendations (2–3)",
          "The agent — live demo",
          "Next steps & the ask",
        ],
      },
      {
        id: "agent-build",
        title: "Build the CS agent",
        prompt: "Ship the agent that backs your recommendation.",
        day: 3,
        kind: "checklist",
        checklist: [
          "Agent purpose matches the spec",
          "Core capability works end-to-end",
          "Guardrails in place",
          "Tested on a real example",
          "Demo script ready",
        ],
      },
      {
        id: "dry-run",
        title: "Dry-run prep",
        prompt: "Be ready for honest, harsh feedback from the instructors.",
        day: 3,
        kind: "checklist",
        checklist: [
          "Full run-through under 5 minutes",
          "Roles assigned for each section",
          "Anticipated Q&A answers drafted",
          "Backup plan if the demo fails",
        ],
      },
    ],
  },
];

export const ALL_DELIVERABLES: (Deliverable & { partId: string })[] = PARTS.flatMap((p) =>
  p.deliverables.map((d) => ({ ...d, partId: p.id })),
);
