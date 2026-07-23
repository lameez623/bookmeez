import { Link } from "@tanstack/react-router";
import { Home, CalendarHeart, Sparkles, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

const items = [
  { to: "/", label: "Home", icon: Home },
  { to: "/reserve", label: "Reserve", icon: CalendarHeart },
  { to: "/approach", label: "Approach", icon: Sparkles },
  { to: "/contact", label: "Contact", icon: MessageCircle },
] as const;

export function NavPill() {
  return (
    <motion.nav
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
      className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2"
      aria-label="Primary"
    >
      <ul
        className="flex items-center gap-1 rounded-full border border-border/70 bg-background/70 p-1.5 shadow-[0_10px_40px_-20px_oklch(0.29_0.005_264/0.35)] backdrop-blur-xl"
      >
        {items.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <Link
              to={to}
              className="group flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:text-ink"
              activeProps={{
                className:
                  "flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium bg-ink text-primary-foreground",
              }}
              activeOptions={{ exact: to === "/" }}
            >
              <Icon className="h-4 w-4" strokeWidth={2} />
              <span className="hidden sm:inline">{label}</span>
              <span className="sr-only sm:hidden">{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </motion.nav>
  );
}
