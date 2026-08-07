import { useCallback, useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Mode = "light" | "dark";
const STORAGE_KEY = "bookmeez-theme";

function systemMode(): Mode {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyMode(mode: Mode) {
  const root = document.documentElement;
  root.classList.toggle("dark", mode === "dark");
  root.style.colorScheme = mode;
}

/** Small Sun/Moon toggle. Follows the OS theme until the visitor picks one. */
export function ThemeToggle() {
  const [mode, setMode] = useState<Mode>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Mode | null;
    const initial = stored === "light" || stored === "dark" ? stored : systemMode();
    setMode(initial);
    applyMode(initial);
    setMounted(true);

    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (window.localStorage.getItem(STORAGE_KEY)) return; // explicit choice wins
      const next = mql.matches ? "dark" : "light";
      setMode(next);
      applyMode(next);
    };
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  const toggle = useCallback(() => {
    setMode((prev) => {
      const next: Mode = prev === "dark" ? "light" : "dark";
      window.localStorage.setItem(STORAGE_KEY, next);
      applyMode(next);
      return next;
    });
  }, []);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      title={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="glass-panel fixed right-4 top-4 z-50 grid h-11 w-11 place-items-center rounded-full text-ink-soft transition-all duration-300 hover:-translate-y-0.5 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={mounted ? mode : "placeholder"}
          initial={{ opacity: 0, rotate: -35, scale: 0.7 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 35, scale: 0.7 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="grid place-items-center"
        >
          {mode === "dark" ? (
            <Sun className="h-[1.15rem] w-[1.15rem]" strokeWidth={1.7} />
          ) : (
            <Moon className="h-[1.15rem] w-[1.15rem]" strokeWidth={1.7} />
          )}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
