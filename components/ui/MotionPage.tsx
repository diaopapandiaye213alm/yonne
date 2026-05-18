"use client";
import { motion } from "framer-motion";

interface Props {
  children: React.ReactNode;
  className?: string;
}

export function MotionPage({ children, className }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Staggered list animation for card grids
export function MotionList({ children, className }: Props) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function MotionItem({ children, className }: Props) {
  return (
    <motion.div
      variants={{
        hidden:  { opacity: 0, y: 8 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
