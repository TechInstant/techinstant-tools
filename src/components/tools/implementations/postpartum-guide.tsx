"use client";

import { AlertTriangle } from "lucide-react";
import { Checklist, type ChecklistSection } from "@/components/tools/checklist";
import { HealthNotice } from "@/components/tools/health-notice";

const SECTIONS: ChecklistSection[] = [
  {
    title: "The first two weeks",
    intro:
      "Recovery is not a race, and it is not the same for everyone. Whether you had a vaginal birth or a caesarean changes what is normal and what is not.",
    items: [
      { label: "Rest whenever the baby sleeps", note: "Broken sleep is the hardest part of this period. Sleeping in short stretches counts." },
      { label: "Keep pain relief regular, not just when it gets bad", note: "Ask which painkillers are safe if you are breastfeeding — several common ones are." },
      { label: "Drink water constantly", note: "Keep a bottle wherever you feed. Thirst arrives suddenly when breastfeeding." },
      { label: "Eat regularly, including fibre", note: "Constipation is very common after birth and makes everything else harder." },
      { label: "Keep any wound or stitches clean and dry", note: "Change pads often. Pat dry rather than rubbing." },
      { label: "Accept every offer of practical help", note: "Meals, laundry, older children, the shopping. Say yes." },
      { label: "Attend your postnatal checks", note: "Both yours and the baby's. Write the dates somewhere you will see them." },
    ],
  },
  {
    title: "Your body",
    items: [
      { label: "Expect bleeding for two to six weeks", note: "It should gradually get lighter and change from red to brown to pale." },
      { label: "Start gentle pelvic floor exercises when you feel able", note: "A few squeezes several times a day. Ask a physiotherapist if anything hurts." },
      { label: "Move a little each day", note: "Short, slow walks. Hold off on real exercise until you have been checked over." },
      { label: "Wear comfortable, supportive clothing", note: "Nothing tight over a caesarean scar." },
      { label: "Get breastfeeding checked if it hurts", note: "Pain usually means positioning or latch, and both are fixable with help." },
    ],
  },
  {
    title: "Your mind",
    intro:
      "Feeling tearful in the first week is extremely common and usually passes. Feelings that deepen or last are a medical matter, not a character flaw.",
    items: [
      { label: "Tell someone how you are actually feeling", note: "A partner, a friend, your midwife or health visitor." },
      { label: "Lower the bar on everything that is not you and the baby", note: "The house can wait." },
      { label: "Get outside briefly when you can", note: "Daylight and a change of scene help more than they sound like they would." },
      { label: "Notice if low mood lasts beyond two weeks", note: "Postnatal depression is common and treatable. Raise it early." },
    ],
  },
  {
    title: "Get medical help straight away if",
    intro:
      "These are not wait-and-see symptoms. Contact your midwife, doctor or emergency services.",
    items: [
      { label: "Heavy bleeding — soaking a pad in an hour, or large clots", urgent: true },
      { label: "A fever, chills, or a wound that is hot, swollen or leaking", urgent: true },
      { label: "Severe headache, vision changes, or pain under your ribs", urgent: true, note: "These can signal high blood pressure after birth." },
      { label: "Pain, redness or swelling in one leg, or chest pain and breathlessness", urgent: true },
      { label: "Thoughts of harming yourself or the baby", urgent: true, note: "This is an emergency and help is available immediately. You will not be judged." },
    ],
  },
];

export default function PostpartumGuide() {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
        <p className="text-sm leading-relaxed text-muted-foreground">
          This is a general checklist, not a care plan. Your midwife, health
          visitor or doctor knows your circumstances and theirs is the advice to
          follow. If something feels wrong, contact them — you are never wasting
          their time.
        </p>
      </div>

      <Checklist sections={SECTIONS} printTitle="Postpartum recovery checklist" />

      <HealthNotice extra="Recovery timelines differ enormously, particularly after a caesarean or a difficult birth." />
    </div>
  );
}
