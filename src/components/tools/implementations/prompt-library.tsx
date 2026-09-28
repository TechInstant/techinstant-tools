"use client";

import { useMemo, useState } from "react";
import { Search, Info, ChevronDown } from "lucide-react";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ToolPanel, Field, CopyButton } from "@/components/tools/tool-ui";
import { cn } from "@/lib/utils";

interface Template {
  id: string;
  title: string;
  group: string;
  summary: string;
  /** Placeholders are written as [SQUARE BRACKETS] so they are easy to spot. */
  body: string;
}

const TEMPLATES: Template[] = [
  {
    id: "rewrite-clearer",
    title: "Make this clearer without dumbing it down",
    group: "Writing",
    summary: "Tightens prose while keeping the meaning and the technical terms.",
    body: `Rewrite the text below so it is easier to read, without simplifying the substance.

Rules:
- Keep every technical term that is doing real work. Explain one briefly on first use only if a reader would otherwise stop.
- Split sentences over about 25 words.
- Cut hedging and filler, but do not cut caveats that change the meaning.
- Keep my voice; do not make it sound like marketing copy.

Text:
[PASTE YOUR TEXT]`,
  },
  {
    id: "critique",
    title: "Find the holes in my argument",
    group: "Thinking",
    summary: "Adversarial review of a plan or argument, with severity ranking.",
    body: `Read the argument below and try to find what is wrong with it.

Give me:
1. The single weakest link, and why.
2. Any claim presented as fact that is actually an assumption.
3. The strongest counter-argument someone who disagrees would make.
4. What evidence would change my mind, if it existed.

Be direct. Do not soften it, and do not list strengths unless I have overstated one.

Argument:
[PASTE YOUR ARGUMENT]`,
  },
  {
    id: "explain-level",
    title: "Explain this at the right level",
    group: "Learning",
    summary: "An explanation pitched at what you already know, not at a generic beginner.",
    body: `Explain [TOPIC] to me.

What I already know: [WHAT YOU ALREADY UNDERSTAND]
What I am trying to do with it: [YOUR ACTUAL GOAL]

Start from where I am rather than from first principles. Use one concrete example. If there is a common misunderstanding about this, tell me what it is and why it is wrong. Do not use an analogy that breaks down under scrutiny.`,
  },
  {
    id: "code-review",
    title: "Review this code properly",
    group: "Code",
    summary: "A review that looks for defects rather than style opinions.",
    body: `Review the code below. I care about correctness first, then clarity.

For each issue: say what breaks, give concrete inputs or state that trigger it, and rank it (critical / worth fixing / minor).

Specifically check for:
- Off-by-one and boundary conditions
- Unhandled error paths and rejected promises
- Race conditions and stale state
- Anything that assumes input is well-formed

Do not comment on formatting or naming unless it actually obscures a bug.

Language / framework: [LANGUAGE]
Code:
\`\`\`
[PASTE YOUR CODE]
\`\`\``,
  },
  {
    id: "debug",
    title: "Help me debug this",
    group: "Code",
    summary: "Structures a bug report so you get diagnosis rather than guesses.",
    body: `I have a bug I cannot work out.

What should happen: [EXPECTED BEHAVIOUR]
What actually happens: [ACTUAL BEHAVIOUR]
Error message, in full: [ERROR OR "none"]
What I have already tried: [WHAT YOU RULED OUT]
Environment: [LANGUAGE, VERSION, OS, BROWSER]

Relevant code:
\`\`\`
[PASTE YOUR CODE]
\`\`\`

Give me the most likely cause first and how to confirm it, before suggesting a fix. If you need to see something I have not shown you, ask for it rather than guessing.`,
  },
  {
    id: "email-difficult",
    title: "Write a difficult email",
    group: "Work",
    summary: "Says the hard thing clearly without being cold or apologetic.",
    body: `Help me write an email.

To: [WHO, AND YOUR RELATIONSHIP TO THEM]
What I need to say: [THE MESSAGE, INCLUDING ANYTHING AWKWARD]
What I want to happen next: [THE OUTCOME]
Any history that matters: [CONTEXT]

Be direct but not cold. Do not over-apologise, do not pad it, and do not bury the main point below pleasantries. Keep it under 150 words. Give me one version, not three.`,
  },
  {
    id: "meeting-notes",
    title: "Turn messy notes into something usable",
    group: "Work",
    summary: "Extracts decisions and owners from raw notes or a transcript.",
    body: `Turn the notes below into a summary.

Give me exactly these sections:
- Decisions made (only things actually decided)
- Actions, each with an owner and a date if one was given
- Open questions nobody answered
- Anything said that contradicts something else said

If an owner or a date was never stated, write "not assigned" rather than inferring one. Do not add anything that is not in the notes.

Notes:
[PASTE YOUR NOTES]`,
  },
  {
    id: "study-quiz",
    title: "Quiz me until I actually know it",
    group: "Learning",
    summary: "Active recall practice rather than a summary you read passively.",
    body: `Quiz me on [TOPIC] to check whether I actually understand it.

How to run it:
- Ask one question at a time and wait for my answer.
- Start easy, then get harder based on how I do.
- Mix recall questions with "why" and "what would happen if" questions.
- After each answer, tell me if I am right, and if I am not, explain the gap rather than just giving the correct answer.
- If I get something wrong, come back to it later in a different form.

Do not give me a list of questions up front. Ask the first one now.`,
  },
  {
    id: "summarise-faithful",
    title: "Summarise without distorting",
    group: "Writing",
    summary: "A summary that keeps the hedging and flags what it left out.",
    body: `Summarise the text below in [NUMBER] words.

Requirements:
- Keep the author's hedging. If they said "may" do not write "does".
- Preserve any numbers, dates and named entities exactly.
- Separate what the text claims from what it merely reports others as claiming.
- At the end, list anything significant you had to leave out.

Text:
[PASTE YOUR TEXT]`,
  },
  {
    id: "decision",
    title: "Help me decide between options",
    group: "Thinking",
    summary: "A recommendation with a reason, not a balanced list you still have to judge.",
    body: `I need to decide between these options.

Options: [OPTION A] vs [OPTION B]
What I am optimising for: [WHAT MATTERS MOST]
Constraints: [BUDGET, TIME, SKILLS, ANYTHING FIXED]
What happens if I get it wrong: [COST OF BEING WRONG]

Give me a recommendation and the reasoning, not a neutral table. Tell me the strongest argument against your recommendation. Tell me which option is easier to reverse. If the answer genuinely depends on something I have not told you, ask.`,
  },
  {
    id: "job-application",
    title: "Tailor my CV to a job advert",
    group: "Work",
    summary: "Matches real experience to a posting without inventing anything.",
    body: `Help me tailor my CV to this job.

Rules that matter more than anything else:
- Do not invent experience, qualifications, tools or dates. Work only from what I give you.
- If the advert asks for something I do not have, say so plainly instead of papering over it.
- Use the advert's own wording for skills I genuinely have, since a screening system may be matching on it.

Job advert:
[PASTE THE ADVERT]

My CV:
[PASTE YOUR CV]

Give me: the bullet points to rewrite and how, what to lead with, and an honest list of the gaps.`,
  },
  {
    id: "sql-explain",
    title: "Explain what this query actually does",
    group: "Code",
    summary: "Plain-English walkthrough of a query, plus what could bite you.",
    body: `Explain what this query does, step by step, in plain English.

Then tell me:
- What it returns when a joined table has no matching row
- Whether it can return duplicates, and why
- Anything about it that would get slow on a large table
- Any NULL handling that might surprise me

Dialect: [POSTGRES / MYSQL / SQLITE / OTHER]
\`\`\`sql
[PASTE YOUR QUERY]
\`\`\``,
  },
];

const GROUPS = [...new Set(TEMPLATES.map((t) => t.group))];

export default function PromptLibrary() {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("All");
  const [openId, setOpenId] = useState<string | null>(null);
  const [edits, setEdits] = useState<Record<string, string>>({});

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TEMPLATES.filter((t) => {
      if (group !== "All" && t.group !== group) return false;
      if (!q) return true;
      return (
        t.title.toLowerCase().includes(q) ||
        t.summary.toLowerCase().includes(q) ||
        t.body.toLowerCase().includes(q)
      );
    });
  }, [query, group]);

  const bodyFor = (t: Template) => edits[t.id] ?? t.body;

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-xl border border-border bg-background-subtle p-4">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
        <p className="text-sm leading-relaxed text-muted-foreground">
          Templates to copy into whichever AI assistant you use. Nothing here
          calls a model, so nothing you type on this page is sent anywhere. Fill
          in the{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">[BRACKETED]</code>{" "}
          parts before you paste — a template with the placeholders left in is
          the main reason these stop working.
        </p>
      </div>

      <ToolPanel className="space-y-4">
        <Field label="Search" htmlFor="pl-search">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="pl-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="debug, summarise, email…"
              className="pl-9"
            />
          </div>
        </Field>

        <div className="flex flex-wrap gap-2">
          {["All", ...GROUPS].map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGroup(g)}
              aria-pressed={group === g}
              className={cn(
                "min-h-11 rounded-lg border px-3 text-sm font-semibold transition-colors",
                group === g
                  ? "border-brand bg-brand/5 text-brand"
                  : "border-border bg-background-subtle text-muted-foreground hover:text-foreground"
              )}
            >
              {g}
            </button>
          ))}
        </div>
      </ToolPanel>

      <p className="text-sm text-muted-foreground">
        {filtered.length} of {TEMPLATES.length} templates
      </p>

      {filtered.length === 0 && (
        <ToolPanel className="text-center">
          <p className="text-sm text-muted-foreground">
            Nothing matches that. Try a broader word, or clear the filter.
          </p>
        </ToolPanel>
      )}

      <div className="space-y-3">
        {filtered.map((t) => {
          const open = openId === t.id;
          return (
            <ToolPanel key={t.id}>
              <button
                type="button"
                onClick={() => setOpenId(open ? null : t.id)}
                aria-expanded={open}
                className="flex w-full items-start gap-3 text-left"
              >
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                      {t.group}
                    </span>
                    <span className="text-sm font-bold text-foreground">{t.title}</span>
                  </span>
                  <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                    {t.summary}
                  </span>
                </span>
                <ChevronDown
                  className={cn(
                    "mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                    open && "rotate-180"
                  )}
                />
              </button>

              {open && (
                <div className="mt-4 space-y-3">
                  <Textarea
                    value={bodyFor(t)}
                    onChange={(e) => setEdits((x) => ({ ...x, [t.id]: e.target.value }))}
                    aria-label={`${t.title} prompt text`}
                    className="min-h-64 font-mono text-xs leading-relaxed"
                    spellCheck={false}
                  />
                  <div className="flex flex-wrap gap-2">
                    <CopyButton value={bodyFor(t)} label="Copy prompt" />
                    {edits[t.id] !== undefined && edits[t.id] !== t.body && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setEdits((x) => {
                            const next = { ...x };
                            delete next[t.id];
                            return next;
                          })
                        }
                      >
                        Reset to original
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </ToolPanel>
          );
        })}
      </div>
    </div>
  );
}
