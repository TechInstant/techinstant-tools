import type { LucideIcon } from "lucide-react";
import {
  Sparkles,
  FileText,
  Image as ImageIcon,
  Code2,
  QrCode,
  Calculator,
  GraduationCap,
  Briefcase,
  Globe,
  HeartPulse,
} from "lucide-react";

export type CategoryId =
  | "ai"
  | "pdf"
  | "image"
  | "developer"
  | "web"
  | "qr"
  | "calculators"
  | "health"
  | "student"
  | "business";

export interface Category {
  id: CategoryId;
  name: string;
  slug: string;
  description: string;
  icon: LucideIcon;
  /**
   * A subtle per-category tint used only for the icon chip, so categories stay
   * scannable without turning the page into a rainbow. Everything else in the
   * UI uses the shared brand palette.
   */
  accent: string;
}

export const CATEGORIES: Category[] = [
  {
    id: "ai",
    name: "AI Tools",
    slug: "ai",
    description: "AI-powered utilities.",
    icon: Sparkles,
    accent: "text-violet-600 dark:text-violet-400 bg-violet-500/10",
  },
  {
    id: "pdf",
    name: "PDF Tools",
    slug: "pdf",
    description: "Work with PDF files.",
    icon: FileText,
    accent: "text-rose-600 dark:text-rose-400 bg-rose-500/10",
  },
  {
    id: "image",
    name: "Image Tools",
    slug: "image",
    description: "Resize, compress and convert images.",
    icon: ImageIcon,
    accent: "text-sky-600 dark:text-sky-400 bg-sky-500/10",
  },
  {
    id: "developer",
    name: "Developer Tools",
    slug: "developer",
    description: "Utilities for developers.",
    icon: Code2,
    accent: "text-emerald-700 dark:text-emerald-400 bg-emerald-500/10",
  },
  {
    id: "web",
    name: "Web Tools",
    slug: "web",
    description: "Build, check and publish for the web.",
    icon: Globe,
    accent: "text-blue-600 dark:text-blue-400 bg-blue-500/10",
  },
  {
    id: "qr",
    name: "QR Tools",
    slug: "qr",
    description: "Create and manage QR codes.",
    icon: QrCode,
    accent: "text-teal-700 dark:text-teal-400 bg-teal-500/10",
  },
  {
    id: "health",
    name: "Health Tools",
    slug: "health",
    description: "Private cycle, pregnancy and wellbeing calculators.",
    icon: HeartPulse,
    accent: "text-pink-600 dark:text-pink-400 bg-pink-500/10",
  },
  {
    id: "calculators",
    name: "Calculators",
    slug: "calculators",
    description: "Useful everyday calculators.",
    icon: Calculator,
    accent: "text-amber-700 dark:text-amber-400 bg-amber-500/10",
  },
  {
    id: "student",
    name: "Student Tools",
    slug: "student",
    description: "Tools for study and academic work.",
    icon: GraduationCap,
    accent: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10",
  },
  {
    id: "business",
    name: "Business Tools",
    slug: "business",
    description: "Useful tools for businesses and professionals.",
    icon: Briefcase,
    accent: "text-slate-700 dark:text-slate-300 bg-slate-500/10",
  },
];

export const getCategory = (id: CategoryId) =>
  CATEGORIES.find((c) => c.id === id);

export const getCategoryBySlug = (slug: string) =>
  CATEGORIES.find((c) => c.slug === slug);
