import { motion } from "framer-motion";

/** Soft flat shapes used behind hero sections. Purely decorative, no gradients. */
export function OrganicShapes() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-apricot/50"
      />
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: [0, 18, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-16 top-40 h-80 w-80 rounded-full bg-cloud/20"
      />
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-sage/10"
      />
    </div>
  );
}
