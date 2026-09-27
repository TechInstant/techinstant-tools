"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { ToolPanel, Field, Stat, ErrorNote } from "@/components/tools/tool-ui";

/**
 * Grade points differ by institution, so the scale is explicit rather than
 * assumed. The 5.0 scale is the common Nigerian university scheme; 4.0 is the
 * common US scheme.
 */
const SCALES = {
  "5": {
    label: "5.0 scale (A=5)",
    grades: [
      { grade: "A", points: 5 },
      { grade: "B", points: 4 },
      { grade: "C", points: 3 },
      { grade: "D", points: 2 },
      { grade: "E", points: 1 },
      { grade: "F", points: 0 },
    ],
    classes: [
      { min: 4.5, label: "First Class" },
      { min: 3.5, label: "Second Class Upper" },
      { min: 2.4, label: "Second Class Lower" },
      { min: 1.5, label: "Third Class" },
      { min: 0, label: "Pass / Fail" },
    ],
  },
  "4": {
    label: "4.0 scale (A=4)",
    grades: [
      { grade: "A", points: 4 },
      { grade: "B", points: 3 },
      { grade: "C", points: 2 },
      { grade: "D", points: 1 },
      { grade: "F", points: 0 },
    ],
    classes: [
      { min: 3.7, label: "Excellent" },
      { min: 3.0, label: "Very good" },
      { min: 2.0, label: "Good" },
      { min: 1.0, label: "Pass" },
      { min: 0, label: "Fail" },
    ],
  },
} as const;

type ScaleKey = keyof typeof SCALES;

interface Course {
  id: number;
  name: string;
  units: string;
  grade: string;
}

let nextId = 1;
const blank = (grade: string): Course => ({
  id: nextId++,
  name: "",
  units: "3",
  grade,
});

export default function GpaCalculator() {
  const [scaleKey, setScaleKey] = useState<ScaleKey>("5");
  const scale = SCALES[scaleKey];
  const [courses, setCourses] = useState<Course[]>(() => [
    blank("A"),
    blank("B"),
    blank("C"),
  ]);
  const [previousGpa, setPreviousGpa] = useState("");
  const [previousUnits, setPreviousUnits] = useState("");

  const result = useMemo(() => {
    let points = 0;
    let units = 0;

    for (const c of courses) {
      const u = Number(c.units);
      if (!Number.isFinite(u) || u <= 0) continue;
      const g = scale.grades.find((x) => x.grade === c.grade);
      if (!g) continue;
      points += g.points * u;
      units += u;
    }

    if (units === 0) return null;
    const gpa = points / units;

    /* Optional CGPA: fold in a previous GPA weighted by its unit total. */
    const pg = Number(previousGpa);
    const pu = Number(previousUnits);
    let cgpa: number | null = null;
    if (Number.isFinite(pg) && Number.isFinite(pu) && pu > 0 && previousGpa !== "") {
      if (pg < 0 || pg > Number(scaleKey)) {
        return { error: `A previous GPA must be between 0 and ${scaleKey}.` };
      }
      cgpa = (pg * pu + points) / (pu + units);
    }

    const cls = scale.classes.find((c) => (cgpa ?? gpa) >= c.min)!;
    return { gpa, cgpa, units, points, cls };
  }, [courses, scale, scaleKey, previousGpa, previousUnits]);

  const hasError = result != null && "error" in result;

  const update = (id: number, patch: Partial<Course>) =>
    setCourses((list) => list.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  return (
    <div className="space-y-4">
      <ToolPanel className="space-y-4">
        <Field label="Grading scale" htmlFor="gpa-scale">
          <Select
            id="gpa-scale"
            value={scaleKey}
            onChange={(e) => {
              const next = e.target.value as ScaleKey;
              setScaleKey(next);
              /* Remap any grade that doesn't exist on the new scale. Widened to
                 string[] because `as const` narrows these to literal unions. */
              const valid: string[] = SCALES[next].grades.map((g) => g.grade);
              setCourses((list) =>
                list.map((c) => ({ ...c, grade: valid.includes(c.grade) ? c.grade : valid[0] }))
              );
            }}
            className="sm:max-w-64"
          >
            {(Object.keys(SCALES) as ScaleKey[]).map((k) => (
              <option key={k} value={k}>
                {SCALES[k].label}
              </option>
            ))}
          </Select>
        </Field>

        <div className="space-y-2">
          <div className="hidden gap-2 px-1 text-xs font-medium text-muted-foreground sm:grid sm:grid-cols-[1fr_5rem_6rem_2.5rem]">
            <span>Course (optional)</span>
            <span>Units</span>
            <span>Grade</span>
            <span />
          </div>

          {courses.map((c) => (
            <div
              key={c.id}
              className="grid gap-2 sm:grid-cols-[1fr_5rem_6rem_2.5rem] sm:items-center"
            >
              <Input
                value={c.name}
                onChange={(e) => update(c.id, { name: e.target.value })}
                placeholder="e.g. Microeconomics"
                aria-label="Course name"
              />
              <Input
                type="number"
                inputMode="numeric"
                min={1}
                max={12}
                value={c.units}
                onChange={(e) => update(c.id, { units: e.target.value })}
                aria-label="Credit units"
              />
              <Select
                value={c.grade}
                onChange={(e) => update(c.id, { grade: e.target.value })}
                aria-label="Grade"
              >
                {scale.grades.map((g) => (
                  <option key={g.grade} value={g.grade}>
                    {g.grade} ({g.points})
                  </option>
                ))}
              </Select>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Remove course"
                disabled={courses.length === 1}
                onClick={() => setCourses((l) => l.filter((x) => x.id !== c.id))}
              >
                <Trash2 />
              </Button>
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          onClick={() => setCourses((l) => [...l, blank(scale.grades[0].grade)])}
        >
          <Plus />
          Add course
        </Button>
      </ToolPanel>

      <ToolPanel className="space-y-4">
        <h2 className="text-sm font-bold text-foreground">
          Cumulative GPA (optional)
        </h2>
        <p className="text-sm text-muted-foreground">
          Add your standing before this semester to get a CGPA.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Previous GPA" htmlFor="gpa-prev">
            <Input
              id="gpa-prev"
              type="number"
              inputMode="decimal"
              step="0.01"
              value={previousGpa}
              onChange={(e) => setPreviousGpa(e.target.value)}
              placeholder={scaleKey === "5" ? "3.80" : "3.20"}
            />
          </Field>
          <Field label="Previous total units" htmlFor="gpa-prevu">
            <Input
              id="gpa-prevu"
              type="number"
              inputMode="numeric"
              value={previousUnits}
              onChange={(e) => setPreviousUnits(e.target.value)}
              placeholder="48"
            />
          </Field>
        </div>
      </ToolPanel>

      {hasError && <ErrorNote>{(result as { error: string }).error}</ErrorNote>}

      {result && !("error" in result) && (
        <>
          <ToolPanel>
            <p className="text-sm font-medium text-muted-foreground">
              {result.cgpa != null ? "Semester GPA" : "Your GPA"}
            </p>
            <p className="mt-1 text-4xl font-extrabold tabular-nums text-foreground">
              {result.gpa.toFixed(2)}
              <span className="ml-2 text-lg font-semibold text-muted-foreground">
                / {scaleKey}.00
              </span>
            </p>
            {result.cgpa != null && (
              <p className="mt-3 text-lg font-bold text-foreground">
                CGPA{" "}
                <span className="tabular-nums">{result.cgpa.toFixed(2)}</span>
              </p>
            )}
            <p className="mt-2 text-sm font-semibold text-brand">{result.cls.label}</p>
          </ToolPanel>

          <div className="grid grid-cols-2 gap-3">
            <Stat label="Total units" value={result.units} />
            <Stat label="Total grade points" value={result.points} />
          </div>
        </>
      )}

      {!result && (
        <p className="text-sm text-muted-foreground">
          Enter credit units and grades to see your GPA.
        </p>
      )}
    </div>
  );
}
