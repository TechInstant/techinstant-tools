import type { Metadata } from "next";
import { ToolsDirectory } from "./tools-directory";
import { TOOLS } from "@/lib/tools";

export const metadata: Metadata = {
  title: "All Tools",
  description: `Browse all ${TOOLS.length} free TechInstant Tools — PDF, image, developer, QR and everyday utilities that run in your browser.`,
  alternates: { canonical: "/tools" },
};

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          All tools
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Free, fast and simple. Most tools run entirely in your browser, so your
          files stay on your device.
        </p>
      </header>

      <ToolsDirectory />
    </div>
  );
}
