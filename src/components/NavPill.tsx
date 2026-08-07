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
      className="fixed bottom-5 left-1/2 z-50 h-16 w-[95%] max-w-5xl -translate-x-1/2 rounded-full border border-white/30 bg-apricot/70 shadow-xl backdrop-blur-xl"
      aria-label="Primary"
    >
      <ul className="flex h-full items-center justify-evenly">
        {items.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <Link
              to={to}
              className="flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-cloud transition-all duration-200 hover:scale-105 hover:text-sage active:scale-95"
              activeProps={{
                className:
                  "flex items-center gap-2 rounded-full bg-apricot px-4 py-2.5 text-sm font-medium text-sage transition-all duration-200 hover:scale-105 active:scale-95",
              }}
              activeOptions={{ exact: to === "/" }}
            >
              <Icon className="h-5 w-5" strokeWidth={2} />
              <span className="hidden sm:inline">{label}</span>
              <span className="sr-only sm:hidden">{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </motion.nav>
  );
}
