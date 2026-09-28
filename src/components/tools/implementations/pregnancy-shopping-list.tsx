"use client";

import { useCallback, useState } from "react";
import {
  Info,
  PillBottle,
  Pill,
  Leaf,
  GlassWater,
  Cookie,
  Smile,
  Shirt,
  BookOpen,
  NotebookPen,
  Moon,
  Droplet,
  Droplets,
  Footprints,
  Flame,
  Bandage,
  CalendarCheck,
  ListChecks,
  Car,
  BedSingle,
  Bed,
  Milk,
  Layers,
  Package,
  Baby,
  Refrigerator,
  FileText,
  IdCard,
  SoapDispenserDroplet,
  Cable,
  CupSoda,
  DoorOpen,
  Hand,
  Thermometer,
  Sofa,
  CookingPot,
  Bath,
  ShowerHead,
  Trash2,
  Scissors,
  Lamp,
  Handbag,
} from "lucide-react";
import { Checklist, type ChecklistSection } from "@/components/tools/checklist";
import { ShoppingLinks } from "@/components/tools/shopping-links";

/**
 * Every item carries an icon so the list can be scanned at a glance — this is
 * long, and people come back to it repeatedly while tired. The icons are
 * decorative (aria-hidden) and the label always carries the meaning, because no
 * icon set has a picture of a muslin cloth.
 */
const SECTIONS: ChecklistSection[] = [
  {
    title: "First trimester — weeks 1 to 12",
    intro:
      "Very little of this is shopping for the baby. It is mostly getting you through the sickest, most tired weeks.",
    items: [
      { label: "Prenatal vitamins with folic acid", icon: PillBottle, note: "400 micrograms of folic acid daily is the usual advice for the first 12 weeks. Ask your midwife about vitamin D too." },
      { label: "Something for morning sickness", icon: Leaf, note: "Ginger, plain crackers by the bed, travel bands. If you cannot keep fluids down, that is a reason to ring your midwife." },
      { label: "A big water bottle you actually like using", icon: GlassWater },
      { label: "Bland snacks for the bedside", icon: Cookie, note: "Eating something before you sit up in the morning helps more than it sounds like it should." },
      { label: "A soft toothbrush", icon: Smile, note: "Brushing sets off nausea for a lot of people; a softer brush and unflavoured paste help." },
      { label: "Comfortable, non-wired bras", icon: Shirt, note: "Breast tenderness usually starts long before any size change." },
      { label: "A pregnancy book or a reputable app", icon: BookOpen, note: "One is plenty. Reading four will mostly make you anxious." },
      { label: "A notebook for questions between appointments", icon: NotebookPen },
    ],
  },
  {
    title: "Second trimester — weeks 13 to 27",
    intro: "The comfortable stretch for most people, and the right time to buy the bigger things slowly.",
    items: [
      { label: "Maternity clothes, or a bump band for your own trousers", icon: Shirt, note: "A bump band buys you several more weeks in clothes you already own." },
      { label: "Two or three tops that will still fit at term", icon: Layers },
      { label: "A pregnancy or body pillow", icon: Moon, note: "Sleeping on your side gets uncomfortable around now. This is the item people say they wish they had bought sooner." },
      { label: "Stretch mark or belly oil", icon: Droplet, note: "It will not prevent stretch marks — nothing reliably does — but it helps with itching and dryness." },
      { label: "Supportive, flat shoes you can get on without bending", icon: Footprints },
      { label: "Heartburn remedies your midwife has approved", icon: Flame },
      { label: "Compression socks if your legs or ankles swell", icon: Bandage },
      { label: "Antenatal classes booked", icon: CalendarCheck, note: "Popular ones fill up early, so book in this trimester rather than the next." },
      { label: "Start the baby's sleeping and feeding shortlist", icon: ListChecks, note: "Research now, buy in the third trimester. Prices and your mind both change." },
    ],
  },
  {
    title: "Third trimester — weeks 28 to birth",
    intro: "Buy the essentials now and pack the hospital bag around 34 weeks. Labour rarely gives much notice.",
    items: [
      { label: "Car seat, fitted and practised with", icon: Car, note: "Most hospitals will not discharge you without one. Practise the straps before the day, not on it." },
      { label: "Somewhere safe for the baby to sleep", icon: BedSingle, note: "Moses basket, crib or bedside cot, with a firm flat mattress that fits with no gaps." },
      { label: "Nursing bras and breast pads", icon: Milk, note: "Get measured late in the third trimester — sizing before then is guesswork." },
      { label: "Maternity pads — two packs at least", icon: Layers, note: "Regular sanitary pads are not suitable for after the birth." },
      { label: "Newborn nappies and cotton wool or water wipes", icon: Package },
      { label: "Six or seven sleepsuits and vests", icon: Shirt, note: "Not too many in newborn size; some babies outgrow it within weeks." },
      { label: "Pushchair or pram that lies flat", icon: Baby, note: "Newborns need to lie flat. Check this before anything else about it." },
      { label: "Batch-cooked meals in the freezer", icon: Refrigerator, note: "Your past self doing your future self an enormous favour." },
      { label: "Paperwork ready for registering the birth and any leave or pay", icon: FileText },
    ],
  },
  {
    title: "Hospital bag — for you",
    items: [
      { label: "ID and maternity notes", icon: IdCard },
      { label: "Loose nightwear that opens at the front", icon: Shirt, note: "Front-opening makes feeding and skin-to-skin far easier." },
      { label: "Dressing gown and non-slip slippers", icon: Footprints },
      { label: "Dark, comfortable underwear a size up", icon: Layers, note: "Several pairs you will not mind throwing away." },
      { label: "Toiletries, hair tie, lip balm", icon: SoapDispenserDroplet, note: "Hospital wards are hot and dry." },
      { label: "Phone and a long charging cable", icon: Cable, note: "Sockets are rarely next to the bed." },
      { label: "Snacks and a water bottle with a straw", icon: CupSoda },
      { label: "Going-home outfit", icon: DoorOpen, note: "What fitted at around six months, not pre-pregnancy clothes." },
    ],
  },
  {
    title: "Hospital bag — for the baby",
    items: [
      { label: "Newborn nappies", icon: Package, note: "Newborn size, not size 1, unless you are told otherwise." },
      { label: "Cotton wool or water wipes", icon: Droplets },
      { label: "Three or four sleepsuits and vests", icon: Shirt },
      { label: "Hat, scratch mittens and socks", icon: Hand },
      { label: "Blanket or swaddle", icon: Layers },
      { label: "The car seat, in the car", icon: Car },
    ],
  },
  {
    title: "Sleeping",
    items: [
      { label: "Moses basket, crib or bedside cot", icon: BedSingle },
      { label: "Firm, flat mattress that fits with no gaps", icon: Bed, note: "This matters for safe sleep. Second-hand cot is fine; buy the mattress new." },
      { label: "Two or three fitted sheets", icon: Layers, note: "You will change these at three in the morning. Have spares." },
      { label: "Baby sleeping bags or cellular blankets", icon: Moon, note: "No pillows, duvets or cot bumpers for a newborn." },
      { label: "Room thermometer", icon: Thermometer, note: "Around 16–20°C is the usual guidance." },
    ],
  },
  {
    title: "Feeding",
    intro: "Get the basics either way — plans change, and that is normal.",
    items: [
      { label: "Muslin cloths — a dozen", icon: Layers, note: "The single most used item in the house." },
      { label: "Nursing pillow", icon: Sofa, note: "Saves your back and shoulders in the early weeks." },
      { label: "Nipple cream", icon: Droplet },
      { label: "Bottles and teats", icon: Milk, note: "Worth having even if you plan to breastfeed." },
      { label: "Steriliser and bottle brush", icon: CookingPot },
      { label: "Formula", icon: Package, note: "Only if you plan to use it — ask your midwife which and how much." },
    ],
  },
  {
    title: "Changing and bathing",
    items: [
      { label: "Changing mat, plus a spare", icon: Layers },
      { label: "Nappies in newborn and size 1", icon: Package },
      { label: "Nappy cream", icon: Droplet },
      { label: "Baby bath or a bath support", icon: Bath },
      { label: "Two hooded towels", icon: ShowerHead },
      { label: "Nappy bin or bags", icon: Trash2 },
    ],
  },
  {
    title: "Easy to forget",
    items: [
      { label: "Baby nail scissors or a file", icon: Scissors },
      { label: "Digital thermometer", icon: Thermometer },
      { label: "Infant paracetamol", icon: Pill, note: "Check the age it can be given from before you need it." },
      { label: "Nightlight", icon: Lamp, note: "Night feeds are much easier without the main light." },
      { label: "Changing bag, packed and left by the door", icon: Handbag },
      { label: "Sling or carrier", icon: Baby, note: "Optional, but many people find it the thing that lets them get anything done." },
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
