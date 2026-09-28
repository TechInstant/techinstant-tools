"use client";

import { useCallback, useState } from "react";
import { Info } from "lucide-react";
import { Checklist, type ChecklistSection } from "@/components/tools/checklist";
import { ShoppingLinks } from "@/components/tools/shopping-links";

const SECTIONS: ChecklistSection[] = [
  {
    title: "First trimester — weeks 1 to 12",
    intro:
      "Very little of this is shopping for the baby. It is mostly getting you through the sickest, most tired weeks.",
    items: [
      { label: "Prenatal vitamins with folic acid", note: "400 micrograms of folic acid daily is the usual advice for the first 12 weeks. Ask your midwife about vitamin D too." },
      { label: "Something for morning sickness", note: "Ginger, plain crackers by the bed, travel bands. If you cannot keep fluids down, that is a reason to ring your midwife." },
      { label: "A big water bottle you actually like using" },
      { label: "Bland snacks for the bedside", note: "Eating something before you sit up in the morning helps more than it sounds like it should." },
      { label: "A soft toothbrush", note: "Brushing sets off nausea for a lot of people; a softer brush and unflavoured paste help." },
      { label: "Comfortable, non-wired bras", note: "Breast tenderness usually starts long before any size change." },
      { label: "A pregnancy book or a reputable app", note: "One is plenty. Reading four will mostly make you anxious." },
      { label: "A notebook for questions between appointments" },
    ],
  },
  {
    title: "Second trimester — weeks 13 to 27",
    intro: "The comfortable stretch for most people, and the right time to buy the bigger things slowly.",
    items: [
      { label: "Maternity clothes, or a bump band for your own trousers", note: "A bump band buys you several more weeks in clothes you already own." },
      { label: "Two or three tops that will still fit at term" },
      { label: "A pregnancy or body pillow", note: "Sleeping on your side gets uncomfortable around now. This is the item people say they wish they had bought sooner." },
      { label: "Stretch mark or belly oil", note: "It will not prevent stretch marks — nothing reliably does — but it helps with itching and dryness." },
      { label: "Supportive, flat shoes you can get on without bending" },
      { label: "Heartburn remedies your midwife has approved" },
      { label: "Compression socks if your legs or ankles swell" },
      { label: "Antenatal classes booked", note: "Popular ones fill up early, so book in this trimester rather than the next." },
      { label: "Start the baby's sleeping and feeding shortlist", note: "Research now, buy in the third trimester. Prices and your mind both change." },
    ],
  },
  {
    title: "Third trimester — weeks 28 to birth",
    intro: "Buy the essentials now and pack the hospital bag around 34 weeks. Labour rarely gives much notice.",
    items: [
      { label: "Car seat, fitted and practised with", note: "Most hospitals will not discharge you without one. Practise the straps before the day, not on it." },
      { label: "Somewhere safe for the baby to sleep", note: "Moses basket, crib or bedside cot, with a firm flat mattress that fits with no gaps." },
      { label: "Nursing bras and breast pads", note: "Get measured late in the third trimester — sizing before then is guesswork." },
      { label: "Maternity pads — two packs at least", note: "Regular sanitary pads are not suitable for after the birth." },
      { label: "Newborn nappies and cotton wool or water wipes" },
      { label: "Six or seven sleepsuits and vests", note: "Not too many in newborn size; some babies outgrow it within weeks." },
      { label: "Pushchair or pram that lies flat", note: "Newborns need to lie flat. Check this before anything else about it." },
      { label: "Batch-cooked meals in the freezer", note: "Your past self doing your future self an enormous favour." },
      { label: "Paperwork ready for registering the birth and any leave or pay" },
    ],
  },
  {
    title: "Hospital bag — for you",
    items: [
      { label: "ID and maternity notes" },
      { label: "Loose nightwear that opens at the front", note: "Front-opening makes feeding and skin-to-skin far easier." },
      { label: "Dressing gown and non-slip slippers" },
      { label: "Dark, comfortable underwear a size up", note: "Several pairs you will not mind throwing away." },
      { label: "Toiletries, hair tie, lip balm", note: "Hospital wards are hot and dry." },
      { label: "Phone and a long charging cable", note: "Sockets are rarely next to the bed." },
      { label: "Snacks and a water bottle with a straw" },
      { label: "Going-home outfit", note: "What fitted at around six months, not pre-pregnancy clothes." },
    ],
  },
  {
    title: "Hospital bag — for the baby",
    items: [
      { label: "Newborn nappies", note: "Newborn size, not size 1, unless you are told otherwise." },
      { label: "Cotton wool or water wipes" },
      { label: "Three or four sleepsuits and vests" },
      { label: "Hat, scratch mittens and socks" },
      { label: "Blanket or swaddle" },
      { label: "The car seat, in the car" },
    ],
  },
  {
    title: "Sleeping",
    items: [
      { label: "Moses basket, crib or bedside cot" },
      { label: "Firm, flat mattress that fits with no gaps", note: "This matters for safe sleep. Second-hand cot is fine; buy the mattress new." },
      { label: "Two or three fitted sheets", note: "You will change these at three in the morning. Have spares." },
      { label: "Baby sleeping bags or cellular blankets", note: "No pillows, duvets or cot bumpers for a newborn." },
      { label: "Room thermometer", note: "Around 16–20°C is the usual guidance." },
    ],
  },
  {
    title: "Feeding",
    intro: "Get the basics either way — plans change, and that is normal.",
    items: [
      { label: "Muslin cloths — a dozen", note: "The single most used item in the house." },
      { label: "Nursing pillow", note: "Saves your back and shoulders in the early weeks." },
      { label: "Nipple cream" },
      { label: "Bottles and teats", note: "Worth having even if you plan to breastfeed." },
      { label: "Steriliser and bottle brush" },
      { label: "Formula", note: "Only if you plan to use it — ask your midwife which and how much." },
    ],
  },
  {
    title: "Changing and bathing",
    items: [
      { label: "Changing mat, plus a spare" },
      { label: "Nappies in newborn and size 1" },
      { label: "Nappy cream" },
      { label: "Baby bath or a bath support" },
      { label: "Two hooded towels" },
      { label: "Nappy bin or bags" },
    ],
  },
  {
    title: "Easy to forget",
    items: [
      { label: "Baby nail scissors or a file" },
      { label: "Digital thermometer" },
      { label: "Infant paracetamol", note: "Check the age it can be given from before you need it." },
      { label: "Nightlight", note: "Night feeds are much easier without the main light." },
      { label: "Changing bag, packed and left by the door" },
      { label: "Sling or carrier", note: "Optional, but many people find it the thing that lets them get anything done." },
    ],
  },
];

export default function PregnancyShoppingList() {
  const [selected, setSelected] = useState<string[]>([]);

  /* Stable identity, or the checklist's effect would fire on every render. */
  const handleSelection = useCallback((labels: string[]) => setSelected(labels), []);

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-xl border border-border bg-background-subtle p-4">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
        <p className="text-sm leading-relaxed text-muted-foreground">
          You need far less than the shops suggest. Work through it by trimester,
          tick what you already have, and buy the sleeping, feeding and car seat
          items first. Almost everything can be bought later, and much of it
          second-hand — with the exception of cot mattresses and car seats, which
          should be new or from someone you trust completely.
        </p>
      </div>

      <Checklist
        sections={SECTIONS}
        printTitle="Pregnancy and newborn shopping list"
        allowCustom
        customTitle="Your own items"
        onSelectionChange={handleSelection}
      />

      <ShoppingLinks items={selected} />
    </div>
  );
}
