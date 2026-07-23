import type { ReactNode } from "react";
import { NavPill } from "./NavPill";
import { Footer } from "./Footer";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-background">
      {children}
      <Footer />
      <NavPill />
    </div>
  );
}
