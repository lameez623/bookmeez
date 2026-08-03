import type { ReactNode } from "react";
import { NavPill } from "./NavPill";
import { Footer } from "./Footer";
import { ThemeToggle } from "./ThemeToggle";
import { LearningDoodles } from "./LearningDoodles";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-dvh bg-background">
      <LearningDoodles />
      <ThemeToggle />
      {children}
      <Footer />
      <NavPill />
    </div>
  );
}
