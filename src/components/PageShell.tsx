import type { ReactNode } from "react";
import { NavPill } from "./NavPill";
import { Footer } from "./Footer";
import { ThemeToggle } from "./ThemeToggle";
import { LearningDoodles } from "./LearningDoodles";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-dvh">
      <LearningDoodles />
      <ThemeToggle />
      <div className="relative z-10">
        {children}
        <Footer />
      </div>
      <NavPill />
    </div>
  );
}
