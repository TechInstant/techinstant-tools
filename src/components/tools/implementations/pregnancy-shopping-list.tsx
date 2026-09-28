"use client";

import { Info } from "lucide-react";
import { Checklist, type ChecklistSection } from "@/components/tools/checklist";

const SECTIONS: ChecklistSection[] = [
  {
    title: "Hospital bag — for you",
    intro: "Pack it around 34 weeks. Labour rarely gives much notice.",
    items: [
      { label: "ID and maternity notes" },
      { label: "Loose nightwear that opens at the front", note: "Front-opening makes feeding and skin-to-skin far easier." },
      { label: "Dressing gown and non-slip slippers" },
      { label: "Maternity pads — more than you think", note: "Two packs at least. Regular sanitary pads are not suitable." },
      { label: "Dark, comfortable underwear", note: "Several pairs, a size up, that you will not mind throwing away." },
      { label: "Nursing bra and breast pads" },
      { label: "Toiletries, hair tie, lip balm", note: "Hospital wards are hot and dry." },
      { label: "Phone and a long charging cable", note: "Sockets are rarely next to the bed." },
      { label: "Snacks and a water bottle with a straw" },
      { label: "Going-home outfit", note: "What fitted at around six months, not pre-pregnancy clothes." },
    ],
  },
  {
    title: "Hospital bag — for the baby",
    items: [
      { label: "Newborn nappies", note: "A pack. Newborn size, not size 1, unless you are told otherwise." },
      { label: "Cotton wool or water wipes" },
      { label: "Three or four sleepsuits and vests" },
      { label: "Hat, scratch mittens and socks" },
      { label: "Blanket or swaddle" },
      { label: "Car seat, fitted and practised with", note: "Most hospitals will not discharge you without one. Practise the straps before the day." },
    ],
  },
  {
    title: "Sleeping",
    items: [
      { label: "Moses basket, crib or bedside cot" },
      { label: "Firm, flat mattress that fits with no gaps", note: "This matters for safe sleep. Second-hand cot, new mattress." },
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
    title: "Out and about",
    items: [
      { label: "Pushchair or pram suitable from birth", note: "Check it lies flat — newborns need to." },
      { label: "Car seat appropriate for their weight" },
      { label: "Changing bag, packed and left by the door" },
      { label: "Sling or carrier", note: "Optional, but many people find it the thing that lets them get anything done." },
      { label: "Rain cover and sunshade" },
    ],
  },
  {
    title: "Easy to forget",
    items: [
      { label: "Baby nail scissors or a file" },
      { label: "Digital thermometer" },
      { label: "Infant paracetamol", note: "Check the age it can be given from before you need it." },
      { label: "Nightlight", note: "Night feeds are much easier without the main light." },
      { label: "Batch-cooked meals in the freezer", note: "Your past self doing your future self an enormous favour." },
      { label: "Paperwork for registering the birth and any leave or benefits" },
    ],
  },
];

export default function PregnancyShoppingList() {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-xl border border-border bg-background-subtle p-4">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
        <p className="text-sm leading-relaxed text-muted-foreground">
          You need far less than the shops suggest. Tick what you already have,
          buy the sleeping, feeding and car seat items first, and leave the rest
          until you know what your baby actually likes. Almost everything can be
          bought later, and much of it second-hand — with the exception of cot
          mattresses and car seats, which should be new or from someone you trust
          completely.
        </p>
      </div>

      <Checklist sections={SECTIONS} printTitle="Pregnancy and newborn shopping list" />
    </div>
  );
}
