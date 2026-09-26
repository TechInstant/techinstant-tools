"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Menu, X, ArrowUpRight } from "lucide-react";
import { BrandLockup } from "@/components/brand/brand-mark";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { SearchDialog } from "@/components/layout/search-dialog";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";
import { CATEGORIES } from "@/lib/categories";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/tools", label: "All Tools" },
  { href: "/categories", label: "Categories" },
  { href: "/popular", label: "Popular" },
  { href: "/about", label: "About" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();

  useBodyScrollLock(menuOpen);

  /* Close the drawer whenever the route changes. */
  useEffect(() => setMenuOpen(false), [pathname]);

  /* Ctrl/⌘-K opens search from anywhere. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" aria-label={`${SITE.name} home`}>
            <BrandLockup />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive(href)
                    ? "text-brand"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search tools"
              className="flex h-10 items-center gap-2 rounded-lg border border-border bg-muted px-3 text-muted-foreground transition-colors hover:text-foreground"
            >
              <Search className="h-4 w-4" />
              <span className="hidden text-sm xl:inline">Search tools</span>
              <kbd className="hidden rounded border border-border bg-card px-1.5 py-0.5 text-[10px] font-medium xl:inline">
                Ctrl K
              </kbd>
            </button>

            <ThemeToggle className="hidden sm:inline-flex" />

            <a
              href={SITE.parentUrl}
              target="_blank"
              rel="noreferrer"
              className="hidden items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground lg:inline-flex"
            >
              TechInstant
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>

            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted lg:hidden"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer — laid out for touch, not a squeezed desktop nav (§7) */}
      {menuOpen && (
        <div className="fixed inset-x-0 bottom-0 top-16 z-40 flex flex-col gap-6 overflow-y-auto overscroll-contain bg-background px-4 py-5 lg:hidden sm:px-6">
          <nav className="flex flex-col divide-y divide-border">
            {NAV.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex min-h-12 items-center text-lg font-semibold transition-colors",
                  isActive(href) ? "text-brand" : "text-foreground"
                )}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Categories
            </p>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((c) => {
                const Icon = c.icon;
                return (
                  <Link
                    key={c.id}
                    href={`/categories/${c.slug}`}
                    className="flex min-h-12 items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm font-medium"
                  >
                    <span
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
                        c.accent
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="truncate">{c.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="mt-auto space-y-4 border-t border-border pt-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Theme
              </span>
              <ThemeToggle />
            </div>
            <a
              href={SITE.parentUrl}
              target="_blank"
              rel="noreferrer"
              className="flex min-h-12 items-center justify-center gap-1.5 rounded-lg border border-border bg-card text-sm font-semibold"
            >
              Explore TechInstant
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      )}

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
