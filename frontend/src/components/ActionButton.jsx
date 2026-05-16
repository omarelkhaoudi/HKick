import { motion } from "framer-motion";

export function ActionButton({
  children,
  variant = "primary",
  className = "",
  ...props
}) {
  const isPrimary = variant === "primary";
  const styles = isPrimary
    ? "bg-gradient-to-r from-emerald to-[#00d455] text-obsidian shadow-[0_0_20px_rgba(0,242,96,0.3)] hover:shadow-[0_0_30px_rgba(0,242,96,0.5)] border border-emerald/50"
    : "bg-white/5 border border-white/10 text-white hover:border-emerald hover:text-emerald hover:bg-emerald/5 backdrop-blur-sm";

  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`relative overflow-hidden inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-bold transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 ${styles} ${className}`}
      {...props}
    >
      {isPrimary && (
        <div className="absolute inset-0 bg-white/20 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      )}
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.button>
  );
}
