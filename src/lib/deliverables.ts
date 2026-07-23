// The structure of the case study, matching the MEET Case Studies deliverables document.
// Each deliverable maps to an interactive widget (its `kind`).

export type FieldType = "text" | "textarea" | "select";

export interface RecordField {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: string[];
}

export interface Section {
  key: string;
  label: string;
  placeholder?: string;
  type?: "textarea" | "text" | "select"; // default: textarea
  options?: string[];
}

export interface Deliverable {
  id: string;
  title: string;
  prompt: string;
  day: 1 | 2 | 3;
  optional?: boolean;
  kind:
    | "text"
    | "sections"
    | "records"
    | "matrix"
    | "tree"
    | "gantt"
    | "lifecycle"
    | "checklist"
    | "palette"
    | "upload";
  // kind-specific config
  placeholder?: string;
  sections?: Section[];
  fields?: RecordField[];
  recordNoun?: string; // e.g. "question", "competitor"
  highlightMax?: number; // for records that should stay small (e.g. 2-3 recommendations)
  matrixCols?: string[];
  matrixRows?: string[];
  checklist?: string[];
  accept?: string; // for upload
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

const STAKEHOLDER_TYPES = ["Deciders", "Implementers", "Developers", "Beneficiaries"];

export const PARTS: Part[] = [
  {
    id: "understand",
    index: 1,
    title: "Understand",
    tagline: "Company & challenge",
    blurb:
      "Research the company, analyze the challenge, and complete every minimum requirement. Then create your Social Lean Canvas with Claude.",
    deliverables: [
      {
        id: "brief",
        title: "Project brief",
        prompt: "Set the basics for your team before you dig in.",
        day: 1,
        kind: "sections",
        sections: [
          { key: "organization", label: "Organization", type: "text", placeholder: "The company / initiative you're helping" },
          { key: "challenge", label: "Challenge", type: "text", placeholder: "The challenge they sent you" },
          { key: "group", label: "Group", type: "text", placeholder: "Your group name / number" },
          { key: "members", label: "Team members", placeholder: "Everyone on the team" },
        ],
      },
      {
        id: "problem",
        title: "Problem statement",
        prompt: "Define the company's problem in 3 sentences — refer back to the slides.",
        day: 1,
        kind: "text",
        placeholder: "The company struggles to…",
      },
      {
        id: "research",
        title: "Online research",
        prompt:
          "Understand the company's solution, strategy, and how they run their business. Log each finding with its source.",
        day: 1,
        kind: "records",
        recordNoun: "finding",
        fields: [
          { key: "insight", label: "Finding", type: "textarea", placeholder: "What you learned about the company" },
          { key: "source", label: "Source", type: "text", placeholder: "URL, article, LinkedIn, info sheet…" },
        ],
      },
      {
        id: "field-research",
        title: "Field research",
        prompt: "Prepare your interview questions for the meeting with the company representative.",
        day: 1,
        kind: "records",
        recordNoun: "question",
        fields: [{ key: "q", label: "Question", type: "textarea", placeholder: "What we still need to ask the rep…" }],
      },
      {
        id: "current-solution",
        title: "Solution statement",
        prompt:
          "Define the company's current solution — not the one you're proposing. What are they doing right now, and is it digital, physical, or services?",
        day: 1,
        kind: "sections",
        sections: [
          { key: "statement", label: "Current solution", placeholder: "Right now they…" },
          { key: "type", label: "Solution type", type: "select", options: ["Digital", "Physical", "Services", "Hybrid"] },
        ],
      },
      {
        id: "uvp",
        title: "Unique Value Proposition",
        prompt: "What's the added value users are getting? Keep the focus on the customer.",
        day: 1,
        kind: "text",
        placeholder: "Customers get…",
      },
      {
        id: "unfair-advantage",
        title: "Unfair Advantage",
        prompt: "What about the company can't be easily copied by competitors? Focus on the competitors.",
        day: 1,
        kind: "text",
        placeholder: "Competitors can't easily copy…",
      },
      {
        id: "competitive",
        title: "Competitive analysis",
        prompt:
          "Where does the company stand in the competitive ecosystem? Map it against at least 3 other companies.",
        day: 2,
        kind: "matrix",
        matrixCols: ["Positioning", "Pricing", "Key strength", "Key weakness"],
        matrixRows: ["Your company", "Competitor 1", "Competitor 2", "Competitor 3"],
      },
      {
        id: "stakeholders",
        title: "Stakeholders & target audience",
        prompt: "Identify the 4 types of stakeholders of the company's challenge.",
        day: 2,
        kind: "records",
        recordNoun: "stakeholder",
        fields: [
          { key: "name", label: "Name / group", type: "text", placeholder: "e.g. School principals" },
          { key: "type", label: "Type", type: "select", options: STAKEHOLDER_TYPES },
          { key: "notes", label: "Notes", type: "textarea", placeholder: "What they care about / their role in the challenge" },
        ],
      },
      {
        id: "identity",
        title: "Visual identity",
        prompt:
          "Are they communicating their idea well? If not, what needs to change? Capture their palette and tone as evidence.",
        day: 2,
        kind: "palette",
      },
      {
        id: "lifecycle",
        title: "Product life cycle",
        prompt: "In what stage of the product life cycle is the company, and what does that mean?",
        day: 2,
        kind: "lifecycle",
      },
      {
        id: "channels",
        title: "Functions of channels",
        prompt:
          "What channels is the company using to reach customers? Are they the right channels for those specific customers?",
        day: 2,
        kind: "records",
        recordNoun: "channel",
        fields: [
          { key: "channel", label: "Channel", type: "text", placeholder: "e.g. Instagram, direct sales, schools…" },
          { key: "assessment", label: "Right for their customers?", type: "textarea", placeholder: "Why it works / doesn't for this audience" },
        ],
      },
      {
        id: "why-tree",
        title: "Why Tree",
        prompt:
          "Causal analysis — start from the problem statement and keep asking why to reach the root causes. Add branches on the same level or go deeper.",
        day: 2,
        kind: "tree",
      },
      {
        id: "effect",
        title: "Effect analysis",
        prompt:
          "Identify affected stakeholders, list & categorize the effects, assess severity, and prioritize.",
        day: 2,
        kind: "records",
        recordNoun: "effect",
        fields: [
          { key: "stakeholder", label: "Stakeholder affected", type: "text", placeholder: "Who is hit by this" },
          { key: "effect", label: "Effect", type: "textarea", placeholder: "What happens to them" },
          {
            key: "category",
            label: "Category",
            type: "select",
            options: ["Financial", "Operational", "Social", "Environmental", "Other"],
          },
          { key: "severity", label: "Severity", type: "select", options: ["High", "Medium", "Low"] },
          { key: "priority", label: "Priority", type: "select", options: ["High", "Medium", "Low"] },
        ],
      },
      {
        id: "slc",
        title: "Social Lean Canvas (SLC)",
        prompt:
          "Once your minimum requirements are done, create a Social Lean Canvas with Claude, then upload it here to preview.",
        day: 2,
        kind: "upload",
        accept: "image/*,.pdf",
      },
    ],
  },
  {
    id: "develop",
    index: 2,
    title: "Develop",
    tagline: "Ideation & solution",
    blurb:
      "Brainstorm from your analysis, validate the assumptions that could kill the idea, and turn it into 2–3 clear recommendations, an agent spec, and next steps.",
    deliverables: [
      {
        id: "brainstorm",
        title: "Solution ideation",
        prompt:
          "Brainstorm solutions from your Why Tree / Effect Analysis. Prioritize severe effects and intervene at the root causes.",
        day: 2,
        kind: "records",
        recordNoun: "idea",
        fields: [
          { key: "idea", label: "Idea", type: "text", placeholder: "What if we…" },
          { key: "note", label: "Note", type: "textarea", placeholder: "Which cause/effect it targets, why it might work" },
        ],
      },
      {
        id: "assumptions",
        title: "Solution-based assumptions",
        prompt:
          "List the assumptions that kill the idea if false, validate them, and run a devil's advocate exercise.",
        day: 2,
        kind: "records",
        recordNoun: "assumption",
        fields: [
          { key: "assumption", label: "Assumption", type: "text", placeholder: "We believe that…" },
          { key: "validate", label: "How did you validate it?", type: "textarea", placeholder: "Online / field research…" },
          { key: "devil", label: "Devil's advocate — what could break it?", type: "textarea", placeholder: "The strongest case against it" },
        ],
      },
      {
        id: "recommendations",
        title: "Recommendations",
        prompt:
          "Combine 2–3 clear solutions. Explain the why behind each and connect it back to your analysis and the company's values.",
        day: 3,
        kind: "records",
        recordNoun: "recommendation",
        highlightMax: 3,
        fields: [
          { key: "title", label: "Recommendation", type: "text", placeholder: "We recommend that the company…" },
          { key: "rationale", label: "Why — connected to your analysis & their values", type: "textarea", placeholder: "This follows from the Why Tree / effects because…" },
          { key: "impact", label: "Impact", type: "select", options: ["High", "Medium", "Low"] },
          { key: "effort", label: "Effort", type: "select", options: ["Low", "Medium", "High"] },
        ],
      },
      {
        id: "ethics",
        title: "Ethical considerations",
        prompt:
          "What ethical considerations or problems come with your suggestions, how do you resolve them, and what compromises come with it?",
        day: 3,
        kind: "sections",
        sections: [
          { key: "considerations", label: "Considerations / problems", placeholder: "The ethical risks in your suggestions" },
          { key: "resolution", label: "Your solution to those", placeholder: "How you'd address them" },
          { key: "compromises", label: "Compromises", placeholder: "What trade-offs come with it" },
        ],
      },
      {
        id: "agent-requirements",
        title: "Agent requirements",
        prompt: "Define your agent: the tools it uses, its database, and the deliverable it gives the user.",
        day: 3,
        kind: "sections",
        sections: [
          { key: "purpose", label: "Purpose", placeholder: "The single job this agent does" },
          { key: "tools", label: "Tools", placeholder: "The tool call(s) it makes" },
          { key: "database", label: "Database", placeholder: "What it stores / connects to" },
          { key: "deliverable", label: "Deliverable to the user", placeholder: "What the user gets back" },
        ],
      },
      {
        id: "next-steps",
        title: "Next steps",
        prompt: "Lay out a short-term and long-term action plan for the company.",
        day: 3,
        kind: "sections",
        sections: [
          { key: "short", label: "Short-term (3 months)", placeholder: "The immediate moves" },
          { key: "long", label: "Long-term (1 year)", placeholder: "Where it should lead" },
        ],
      },
      {
        id: "additional-research",
        title: "Additional research",
        prompt: "Optional — identify further research needs.",
        day: 3,
        optional: true,
        kind: "text",
        placeholder: "To go further, the team would want to research…",
      },
    ],
  },
  {
    id: "present",
    index: 3,
    title: "Present",
    tagline: "Presentation & agent",
    blurb:
      "Build your presentation and CS agent, plan the four-day sprint, and get ready for the dry run and the final pitch. 5 min presentation, 7 min Q&A.",
    deliverables: [
      {
        id: "timeline",
        title: "Sprint timeline",
        prompt: "Plan the four days. Drag a bar to move it, drag its edges to reshape a task.",
        day: 1,
        kind: "gantt",
        seedTasks: [
          { name: "Online & field research", start: 0, end: 1, track: "Understand" },
          { name: "Problem, solution & UVP", start: 0, end: 1, track: "Understand" },
          { name: "Competitive, stakeholders, PLC", start: 1, end: 2, track: "Understand" },
          { name: "Why Tree & effect analysis", start: 1, end: 2, track: "Develop" },
          { name: "Recommendations & next steps", start: 2, end: 3, track: "Develop" },
          { name: "Build the CS agent", start: 1, end: 3, track: "Present" },
          { name: "Presentation", start: 2, end: 3, track: "Present" },
          { name: "Dry run & final pitch", start: 3, end: 4, track: "Present" },
        ],
      },
      {
        id: "presentation",
        title: "Presentation outline",
        prompt: "A 5-minute pitch. Check off each section as it's ready.",
        day: 3,
        kind: "checklist",
        checklist: [
          "Company description",
          "Challenge description",
          "Effects — cost of not solving it",
          "Causes — connected to your recommendations",
          "Recommendations — your solution",
          "Strategy — the tools you based it on (Why Tree, effects, UVP…)",
          "Next steps — short & long term",
          "Additional research (optional)",
        ],
      },
      {
        id: "presentation-link",
        title: "Presentation link",
        prompt: "Link your presentation — make sure to give access.",
        day: 3,
        kind: "text",
        placeholder: "https://… (give edit/view access!)",
      },
      {
        id: "cs-agent",
        title: "CS agent",
        prompt:
          "Choose your agent option and say why. Whichever you pick needs one working tool call, a real deliverable, and a database connection — shared on GitHub.",
        day: 3,
        kind: "sections",
        sections: [
          {
            key: "option",
            label: "Which option?",
            type: "select",
            options: ["Option 1 — Agent in your solution", "Option 2 — Social Lean Canvas Agent"],
          },
          { key: "reasoning", label: "Why this option?", placeholder: "Your solution needs / doesn't need an agent because…" },
          { key: "github", label: "GitHub repo link", type: "text", placeholder: "https://github.com/…" },
        ],
      },
      {
        id: "agent-build",
        title: "Build the CS agent",
        prompt: "Ship the agent. Everything here is required, whichever option you chose.",
        day: 3,
        kind: "checklist",
        checklist: [
          "One working tool call",
          "A real deliverable produced",
          "A database connection",
          "Code shared with the team on GitHub",
          "Demo script ready",
        ],
      },
      {
        id: "dry-run",
        title: "Dry-run prep",
        prompt: "Be ready for honest (harsh!) feedback from the instructors.",
        day: 3,
        kind: "checklist",
        checklist: [
          "Full run-through under 5 minutes",
          "Roles assigned for each section",
          "Answers drafted for the 7-minute Q&A",
          "Support ready — research citations & interview answers",
          "Backup plan if the demo fails",
        ],
      },
    ],
  },
];

export const ALL_DELIVERABLES: (Deliverable & { partId: string })[] = PARTS.flatMap((p) =>
  p.deliverables.map((d) => ({ ...d, partId: p.id })),
);
