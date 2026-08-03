import { motion, useReducedMotion } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";

/**
 * Decorative, hand-drawn style line illustrations used as very low-opacity
 * background accents. Purely ornamental — never interactive, never in the
 * reading flow.
 */

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

function OpenBook() {
  return (
    <svg viewBox="0 0 64 64" className="h-full w-full">
      <g {...stroke}>
        <path d="M32 18c-5-4-12-5-19-4v34c7-1 14 0 19 4 5-4 12-5 19-4V14c-7-1-14 0-19 4Z" />
        <path d="M32 18v34" />
        <path d="M19 25h7M19 32h7M38 25h7M38 32h7" />
      </g>
    </svg>
  );
}

function Pencil() {
  return (
    <svg viewBox="0 0 64 64" className="h-full w-full">
      <g {...stroke}>
        <path d="M14 50l4-11L44 13a5 5 0 0 1 7 7L25 46l-11 4Z" />
        <path d="M40 17l7 7M18 39l7 7" />
      </g>
    </svg>
  );
}

function PaperPlane() {
  return (
    <svg viewBox="0 0 64 64" className="h-full w-full">
      <g {...stroke}>
        <path d="M56 10L8 30l18 6 6 18 24-44Z" />
        <path d="M26 36l30-26M26 36v14" />
      </g>
    </svg>
  );
}

function Lightbulb() {
  return (
    <svg viewBox="0 0 64 64" className="h-full w-full">
      <g {...stroke}>
        <path d="M32 10a15 15 0 0 0-9 27v6h18v-6a15 15 0 0 0-9-27Z" />
        <path d="M26 49h12M28 54h8" />
        <path d="M32 4v-0M12 20l-4-2M52 20l4-2" />
      </g>
    </svg>
  );
}

function Magnifier() {
  return (
    <svg viewBox="0 0 64 64" className="h-full w-full">
      <g {...stroke}>
        <circle cx="27" cy="27" r="15" />
        <path d="M38 38l16 16" />
        <path d="M20 27a7 7 0 0 1 7-7" />
      </g>
    </svg>
  );
}

function Sprig() {
  return (
    <svg viewBox="0 0 64 64" className="h-full w-full">
      <g {...stroke}>
        <path d="M32 56C32 34 34 18 44 8" />
        <path d="M34 42c-6 2-11-1-13-7 6-2 11 1 13 7ZM36 30c6 2 11-1 13-7-6-2-11 1-13 7ZM38 19c-5 1-9-2-10-7 5-1 9 2 10 7Z" />
      </g>
    </svg>
  );
}

function Star() {
  return (
    <svg viewBox="0 0 64 64" className="h-full w-full">
      <g {...stroke}>
        <path d="M32 10l6 16 16 6-16 6-6 16-6-16-16-6 16-6 6-16Z" />
      </g>
    </svg>
  );
}

function Paperclip() {
  return (
    <svg viewBox="0 0 64 64" className="h-full w-full">
      <g {...stroke}>
        <path d="M44 22v20a12 12 0 0 1-24 0V18a8 8 0 0 1 16 0v22a4 4 0 0 1-8 0V22" />
      </g>
    </svg>
  );
}

function NotebookPage() {
  return (
    <svg viewBox="0 0 64 64" className="h-full w-full">
      <g {...stroke}>
        <path d="M16 8h26l10 10v38H16z" />
        <path d="M42 8v10h10" />
        <path d="M23 28h20M23 36h20M23 44h12" />
      </g>
    </svg>
  );
}

type Doodle = {
  node: ReactNode;
  style: CSSProperties;
  size: string;
  drift: number;
  sway: number;
  duration: number;
  delay: number;
};

const doodles: Doodle[] = [
  { node: <OpenBook />, style: { top: "6%", left: "4%" }, size: "h-24 w-24 sm:h-32 sm:w-32", drift: -14, sway: 4, duration: 16, delay: 0 },
  { node: <PaperPlane />, style: { top: "14%", right: "6%" }, size: "h-20 w-20 sm:h-28 sm:w-28", drift: 16, sway: -6, duration: 19, delay: 1.5 },
  { node: <Pencil />, style: { top: "36%", left: "8%" }, size: "h-16 w-16 sm:h-24 sm:w-24", drift: 12, sway: 5, duration: 21, delay: 0.8 },
  { node: <Lightbulb />, style: { top: "46%", right: "10%" }, size: "h-20 w-20 sm:h-28 sm:w-28", drift: -12, sway: 3, duration: 17, delay: 2.2 },
  { node: <Sprig />, style: { top: "62%", left: "3%" }, size: "h-24 w-24 sm:h-32 sm:w-32", drift: -10, sway: 6, duration: 23, delay: 0.4 },
  { node: <Magnifier />, style: { top: "72%", right: "7%" }, size: "h-16 w-16 sm:h-24 sm:w-24", drift: 14, sway: -4, duration: 18, delay: 1.1 },
  { node: <NotebookPage />, style: { top: "86%", left: "10%" }, size: "h-20 w-20 sm:h-28 sm:w-28", drift: -12, sway: 4, duration: 20, delay: 2.6 },
  { node: <Paperclip />, style: { top: "92%", right: "12%" }, size: "h-14 w-14 sm:h-20 sm:w-20", drift: 10, sway: -5, duration: 22, delay: 0.2 },
  { node: <Star />, style: { top: "26%", left: "48%" }, size: "h-10 w-10 sm:h-14 sm:w-14", drift: -8, sway: 8, duration: 15, delay: 3 },
  { node: <Star />, style: { top: "78%", left: "42%" }, size: "h-8 w-8 sm:h-12 sm:w-12", drift: 9, sway: -7, duration: 24, delay: 1.8 },
];

export function LearningDoodles() {
  const reduced = useReducedMotion();

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden text-ink"
    >
      {doodles.map((d, i) => (
        <motion.div
          key={i}
          style={d.style}
          className={`absolute ${d.size} opacity-[0.07] dark:opacity-[0.09]`}
          initial={{ y: 0, x: 0, rotate: 0 }}
          animate={
            reduced
              ? undefined
              : {
                  y: [0, d.drift, 0],
                  x: [0, d.sway, 0],
                  rotate: [0, d.sway * 0.6, 0],
                }
          }
          transition={{
            duration: d.duration,
            delay: d.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {d.node}
        </motion.div>
      ))}
    </div>
  );
}
