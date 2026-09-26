"use client";

import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";

/**
 * next-themes handles the three modes the spec asks for (light / dark /
 * system), persists the choice to localStorage and injects a blocking script
 * so the correct theme is on <html> before first paint.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="techinstant-tools-theme"
    >
      {children}
    </ThemeProvider>
  );
}
