"use client";

import { useMemo, useState } from "react";
import { Sparkles, Info } from "lucide-react";
import { Input, Textarea, Select } from "@/components/ui/input";
import {
  ToolPanel,
  Field,
  CopyButton,
  DownloadButton,
  Stat,
} from "@/components/tools/tool-ui";
import { cn } from "@/lib/utils";

const FORMATS = [
  { id: "", label: "No preference" },
  { id: "A short paragraph.", label: "A short paragraph" },
  { id: "A bulleted list.", label: "Bulleted list" },
  { id: "A numbered, step-by-step list.", label: "Numbered steps" },
  { id: "A markdown table.", label: "Markdown table" },
  { id: "JSON only, with no prose around it.", label: "JSON only" },
  { id: "An email, ready to send.", label: "Email" },
  { id: "Code, with brief comments explaining the non-obvious parts.", label: "Code" },
];

const TONES = [
  "",
  "plain and direct",
  "warm and friendly",
  "formal and professional",
  "technical and precise",
  "persuasive",
  "patient and encouraging",
];

const LENGTHS = [
  { id: "", label: "No limit" },
  { id: "Keep it under 50 words.", label: "Very short — under 50 words" },
  { id: "Keep it under 150 words.", label: "Short — under 150 words" },
  { id: "Aim for around 400 words.", label: "Medium — around 400 words" },
  { id: "Be thorough; length is not a concern.", label: "Thorough" },
];

/**
 * Builds a prompt from its parts, entirely in the browser.
 *
 * There is no model call here and no API key anywhere: this is a writing aid,
 * not an AI service. The structure it produces — role, task, context,
 * constraints, format, then a request to ask before assuming — is what reliably
 * separates a prompt that works from one that needs three follow-ups.
 */
export default function PromptGenerator() {
  const [role, setRole] = useState("");
  const [task, setTask] = useState("");
  const [context, setContext] = useState("");
  const [audience, setAudience] = useState("");
  const [format, setFormat] = useState("");
  const [tone, setTone] = useState("");
  const [length, setLength] = useState("");
  const [constraints, setConstraints] = useState("");
  const [examples, setExamples] = useState("");
  const [askFirst, setAskFirst] = useState(true);
  const [thinkStepByStep, setThinkStepByStep] = useState(false);

  const prompt = useMemo(() => {
    const blocks: string[] = [];

    if (role.trim()) blocks.push(`You are ${role.trim()}.`);

    if (task.trim()) {
      blocks.push(`# Task\n${task.trim()}`);
    }

    if (context.trim()) {
      blocks.push(`# Context\n${context.trim()}`);
    }

    if (examples.trim()) {
      blocks.push(`# Example of what good looks like\n${examples.trim()}`);
    }

    const requirements: string[] = [];
    if (audience.trim()) requirements.push(`Write for ${audience.trim()}.`);
    if (tone) requirements.push(`Use a ${tone} tone.`);
    if (format) requirements.push(`Format the answer as: ${format}`);
    if (length) requirements.push(length);
    if (constraints.trim()) {
      for (const line of constraints.split("\n").map((l) => l.trim()).filter(Boolean)) {
        requirements.push(line.replace(/^[-•*]\s*/, ""));
      }
    }
    if (thinkStepByStep) {
      requirements.push("Work through the reasoning step by step before giving the answer.");
    }

    if (requirements.length > 0) {
      blocks.push(`# Requirements\n${requirements.map((r) => `- ${r}`).join("\n")}`);
    }

    if (askFirst) {
      blocks.push(
        "If anything above is ambiguous or you are missing something you need, ask me before you start rather than guessing."
      );
    }

    return blocks.join("\n\n");
  }, [
    role,
    task,
    context,
    audience,
    format,
    tone,
    length,
    constraints,
    examples,
    askFirst,
    thinkStepByStep,
  ]);

  const stats = useMemo(() => {
    const words = prompt.split(/\s+/).filter(Boolean).length;
    return {
      words,
      characters: prompt.length,
      /* Roughly four characters per token for English — close enough to tell
         you whether you are anywhere near a context limit. */
      tokens: Math.ceil(prompt.length / 4),
    };
  }, [prompt]);

  const missingTask = !task.trim();

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-xl border border-border bg-background-subtle p-4">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
        <p className="text-sm leading-relaxed text-muted-foreground">
          This writes the prompt; it does not run it. Nothing is sent to any AI
          service from this page — fill in the parts, copy the result, and paste
          it into whichever assistant you use.
        </p>
      </div>

      <ToolPanel className="space-y-4">
        <Field
          label="The task"
          htmlFor="pg-task"
          hint="The one thing you want done. Be specific about the outcome, not the method."
        >
          <Textarea
            id="pg-task"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="Rewrite the product description below so it leads with the benefit rather than the specification."
            className="min-h-24"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Role (optional)"
            htmlFor="pg-role"
            hint="Useful when the job needs a particular lens."
          >
            <Input
              id="pg-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="a copywriter who works on ecommerce sites"
            />
          </Field>

          <Field label="Audience (optional)" htmlFor="pg-audience">
            <Input
              id="pg-audience"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="small business owners with no technical background"
            />
          </Field>
        </div>

        <Field
          label="Context and source material"
          htmlFor="pg-context"
          hint="Paste the text, data or background the answer must be based on."
        >
          <Textarea
            id="pg-context"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Paste the current description, the brief, the data…"
            className="min-h-28"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Output format" htmlFor="pg-format">
            <Select id="pg-format" value={format} onChange={(e) => setFormat(e.target.value)}>
              {FORMATS.map((f) => (
                <option key={f.label} value={f.id}>
                  {f.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Tone" htmlFor="pg-tone">
            <Select id="pg-tone" value={tone} onChange={(e) => setTone(e.target.value)}>
              {TONES.map((t) => (
                <option key={t || "none"} value={t}>
                  {t || "No preference"}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Length" htmlFor="pg-length">
            <Select id="pg-length" value={length} onChange={(e) => setLength(e.target.value)}>
              {LENGTHS.map((l) => (
                <option key={l.label} value={l.id}>
                  {l.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field
          label="Constraints (optional)"
          htmlFor="pg-constraints"
          hint="One per line. Things to avoid are often more useful than things to do."
        >
          <Textarea
            id="pg-constraints"
            value={constraints}
            onChange={(e) => setConstraints(e.target.value)}
            placeholder={"Do not invent statistics\nKeep our product names exactly as written\nBritish spelling"}
            className="min-h-24"
          />
        </Field>

        <Field
          label="Example of a good answer (optional)"
          htmlFor="pg-examples"
          hint="One good example moves quality more than any amount of instruction."
        >
          <Textarea
            id="pg-examples"
            value={examples}
            onChange={(e) => setExamples(e.target.value)}
            className="min-h-20"
          />
        </Field>

        <div className="flex flex-wrap gap-x-5 gap-y-2">
          <Check
            id="pg-ask"
            checked={askFirst}
            onChange={setAskFirst}
            label="Ask me before assuming anything"
          />
          <Check
            id="pg-steps"
            checked={thinkStepByStep}
            onChange={setThinkStepByStep}
            label="Reason step by step first"
          />
        </div>
      </ToolPanel>

      <ToolPanel>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-base font-bold tracking-tight text-foreground">
            <Sparkles className="h-4 w-4 text-brand" />
            Your prompt
          </h2>
          <div className="flex gap-2">
            <CopyButton value={prompt} disabled={!prompt} />
            <DownloadButton
              value={prompt}
              filename="prompt.txt"
              mime="text/plain"
              disabled={!prompt}
            />
          </div>
        </div>

        {missingTask ? (
          <p className="mt-3 rounded-lg border border-dashed border-border bg-background-subtle p-6 text-center text-sm text-muted-foreground">
            Describe the task above and your prompt appears here.
          </p>
        ) : (
          <>
            <pre className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-background-subtle p-4 text-sm leading-relaxed text-foreground">
              {prompt}
            </pre>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Stat label="Words" value={stats.words.toLocaleString()} />
              <Stat label="Characters" value={stats.characters.toLocaleString()} />
              <Stat label="Tokens (approx.)" value={`~${stats.tokens.toLocaleString()}`} />
            </div>
          </>
        )}
      </ToolPanel>
    </div>
  );
}

function Check({
  id,
  checked,
  onChange,
  label,
}: {
  id: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <label htmlFor={id} className="flex min-h-11 cursor-pointer items-center gap-2 text-sm">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className={cn("h-4 w-4 rounded border-border accent-[var(--color-brand-solid,#05a85a)]")}
      />
      <span className="text-foreground">{label}</span>
    </label>
  );
}
