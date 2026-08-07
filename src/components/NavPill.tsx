import { Link } from "@tanstack/react-router";
import { Home, CalendarHeart, Sparkles, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

const items = [
  { to: "/", label: "Home", icon: Home },
  { to: "/reserve", label: "Reserve", icon: CalendarHeart },
  { to: "/approach", label: "Approach", icon: Sparkles },
  { to: "/contact", label: "Contact", icon: MessageCircle },
] as const;

/** SVG displacement filter used by the .liquid-glass backdrop layer. */
function LiquidGlassFilter() {
  return (
    <svg aria-hidden className="pointer-events-none absolute h-0 w-0" focusable="false">
      <defs>
        <filter id="bm-liquid-glass" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.008 0.008"
            numOctaves="2"
            seed="92"
            result="noise"
          />
          <feGaussianBlur in="noise" stdDeviation="2" result="blurred" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="blurred"
            scale="70"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  );
}

export function NavPill() {
  return (
    <>
      <LiquidGlassFilter />
      <motion.nav
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
        className="liquid-glass fixed bottom-5 left-1/2 z-50 h-16 w-[95%] max-w-5xl -translate-x-1/2 rounded-full backdrop-blur-md"
        aria-label="Primary"
      >
        <ul className="relative z-10 flex h-full items-center justify-evenly">
          {items.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <Link
                to={to}
                className="flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-espresso transition-transform duration-200 hover:scale-105 active:scale-95"
                activeProps={{
                  className:
                    "flex items-center gap-2 rounded-full bg-apricot px-4 py-2.5 text-sm font-medium text-sage transition-transform duration-200 hover:scale-105 active:scale-95",
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
    </>
  );
}
