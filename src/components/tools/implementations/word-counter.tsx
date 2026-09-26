"use client";

import { useMemo, useState } from "react";
import { Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ToolPanel, Stat } from "@/components/tools/tool-ui";

/** Average adult silent reading speed, words per minute. */
const WPM = 225;

function analyse(text: string) {
  const trimmed = text.trim();

  const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, "").length;

  /* Split on sentence-ending punctuation followed by whitespace or end. Not
     perfect with abbreviations, but honest for ordinary prose. */
  const sentences = trimmed
    ? trimmed.split(/[.!?]+(?:\s|$)/).filter((s) => s.trim().length > 0).length
    : 0;

  const paragraphs = trimmed
    ? trimmed.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length
    : 0;

  const totalSeconds = words === 0 ? 0 : Math.round((words / WPM) * 60);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const readingTime =
    words === 0 ? "—" : minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

  return {
    words,
    characters,
    charactersNoSpaces,
    sentences,
    paragraphs,
    readingTime,
  };
}

export default function WordCounter() {
  const [text, setText] = useState("");
  const stats = useMemo(() => analyse(text), [text]);

  return (
    <div className="space-y-4">
      <ToolPanel className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="wc-input" className="text-sm font-medium text-foreground">
            Your text
          </label>
          {text && (
            <Button variant="ghost" size="sm" onClick={() => setText("")}>
              Clear
            </Button>
          )}
        </div>

        <Textarea
          id="wc-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Start typing or paste your text — counts update as you go."
          className="min-h-56"
        />
      </ToolPanel>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="Words" value={stats.words.toLocaleString()} />
        <Stat label="Characters" value={stats.characters.toLocaleString()} />
        <Stat
          label="Characters (no spaces)"
          value={stats.charactersNoSpaces.toLocaleString()}
        />
        <Stat label="Sentences" value={stats.sentences.toLocaleString()} />
        <Stat label="Paragraphs" value={stats.paragraphs.toLocaleString()} />
        <Stat label="Reading time" value={stats.readingTime} />
      </div>
    </div>
  );
}
