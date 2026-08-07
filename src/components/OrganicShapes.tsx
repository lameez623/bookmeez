import { motion } from "framer-motion";

/** Soft flat shapes used behind hero sections. Solid palette colours, no gradients. */
export function OrganicShapes() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-28 top-10 h-72 w-72 rounded-full bg-cloud"
      />
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: [0, 18, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-24 top-44 h-80 w-80 rounded-full bg-apricot"
      />
    </div>
  );
}
