"use client";

import {
  AlertTriangle,
  Moon,
  Pill,
  GlassWater,
  Salad,
  Bandage,
  HeartHandshake,
  CalendarCheck,
  Droplets,
  Activity,
  Footprints,
  Shirt,
  Milk,
  MessageCircle,
  TrendingDown,
  Sun,
  CalendarClock,
  Thermometer,
  Eye,
  HeartPulse,
  PhoneCall,
} from "lucide-react";
import { Checklist, type ChecklistSection } from "@/components/tools/checklist";
import { HealthNotice } from "@/components/tools/health-notice";
import { PostpartumCalendar } from "@/components/tools/postpartum-calendar";

const SECTIONS: ChecklistSection[] = [
  {
    title: "The first two weeks",
    intro:
      "Recovery is not a race, and it is not the same for everyone. Whether you had a vaginal birth or a caesarean changes what is normal and what is not.",
    items: [
      { label: "Rest whenever the baby sleeps", icon: Moon, note: "Broken sleep is the hardest part of this period. Sleeping in short stretches counts." },
      { label: "Keep pain relief regular, not just when it gets bad", icon: Pill, note: "Ask which painkillers are safe if you are breastfeeding — several common ones are." },
      { label: "Drink water constantly", icon: GlassWater, note: "Keep a bottle wherever you feed. Thirst arrives suddenly when breastfeeding." },
      { label: "Eat regularly, including fibre", icon: Salad, note: "Constipation is very common after birth and makes everything else harder." },
      { label: "Keep any wound or stitches clean and dry", icon: Bandage, note: "Change pads often. Pat dry rather than rubbing." },
      { label: "Accept every offer of practical help", icon: HeartHandshake, note: "Meals, laundry, older children, the shopping. Say yes." },
      { label: "Attend your postnatal checks", icon: CalendarCheck, note: "Both yours and the baby's. Write the dates somewhere you will see them." },
    ],
  },
  {
    title: "Your body",
    items: [
      { label: "Expect bleeding for two to six weeks", icon: Droplets, note: "It should gradually get lighter and change from red to brown to pale." },
      { label: "Start gentle pelvic floor exercises when you feel able", icon: Activity, note: "A few squeezes several times a day. Ask a physiotherapist if anything hurts." },
      { label: "Move a little each day", icon: Footprints, note: "Short, slow walks. Hold off on real exercise until you have been checked over." },
      { label: "Wear comfortable, supportive clothing", icon: Shirt, note: "Nothing tight over a caesarean scar." },
      { label: "Get breastfeeding checked if it hurts", icon: Milk, note: "Pain usually means positioning or latch, and both are fixable with help." },
    ],
  },
  {
    title: "Your mind",
    intro:
      "Feeling tearful in the first week is extremely common and usually passes. Feelings that deepen or last are a medical matter, not a character flaw.",
    items: [
      { label: "Tell someone how you are actually feeling", icon: MessageCircle, note: "A partner, a friend, your midwife or health visitor." },
      { label: "Lower the bar on everything that is not you and the baby", icon: TrendingDown, note: "The house can wait." },
      { label: "Get outside briefly when you can", icon: Sun, note: "Daylight and a change of scene help more than they sound like they would." },
      { label: "Notice if low mood lasts beyond two weeks", icon: CalendarClock, note: "Postnatal depression is common and treatable. Raise it early." },
    ],
  },
  {
    title: "Get medical help straight away if",
    intro:
      "These are not wait-and-see symptoms. Contact your midwife, doctor or emergency services.",
    items: [
      { label: "Heavy bleeding — soaking a pad in an hour, or large clots", icon: Droplets, urgent: true },
      { label: "A fever, chills, or a wound that is hot, swollen or leaking", icon: Thermometer, urgent: true },
      { label: "Severe headache, vision changes, or pain under your ribs", icon: Eye, urgent: true, note: "These can signal high blood pressure after birth." },
      { label: "Pain, redness or swelling in one leg, or chest pain and breathlessness", icon: HeartPulse, urgent: true },
      { label: "Thoughts of harming yourself or the baby", icon: PhoneCall, urgent: true, note: "This is an emergency and help is available immediately. You will not be judged." },
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

      <PostpartumCalendar />

      <Checklist
        sections={SECTIONS}
        printTitle="Postpartum recovery checklist"
        allowCustom
        customTitle="Your own reminders"
      />

      <HealthNotice extra="Recovery timelines differ enormously, particularly after a caesarean or a difficult birth." />
    </div>
  );
}
