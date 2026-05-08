export function ActionButton({ children, variant = 'primary', className = '', ...props }) {
  const styles =
    variant === 'primary'
      ? 'bg-limeball text-ink hover:shadow-glow'
      : 'border border-black/10 bg-white/70 text-ink hover:border-limeball dark:border-white/10 dark:bg-white/10 dark:text-white';

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-black transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 ${styles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
