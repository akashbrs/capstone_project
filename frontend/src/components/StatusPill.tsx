const styles: Record<string, string> = {
  AVAILABLE: 'bg-sage-500/10 text-sage-400 border-sage-500/30',
  OCCUPIED: 'bg-rust-500/10 text-rust-400 border-rust-500/30',
  RESERVED: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  NEEDS_CLEANING: 'bg-ink-600/30 text-ink-500 border-ink-600',
  OPEN: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  IN_KITCHEN: 'bg-rust-500/10 text-rust-400 border-rust-500/30',
  READY: 'bg-sage-500/10 text-sage-400 border-sage-500/30',
  SERVED: 'bg-ink-600/30 text-paper-200 border-ink-600',
  PAID: 'bg-sage-500/10 text-sage-400 border-sage-500/30',
  CANCELLED: 'bg-ink-600/30 text-ink-500 border-ink-600 line-through',
};

export default function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-mono font-medium uppercase tracking-wide border ${
        styles[status] || 'bg-ink-600/30 text-ink-500 border-ink-600'
      }`}
    >
      {status.replace('_', ' ')}
    </span>
  );
}
