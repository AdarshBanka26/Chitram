import { Loader2 } from 'lucide-react';

export default function Spinner({ full = false, label }) {
  const inner = (
    <div className="flex flex-col items-center gap-3 text-ink/60">
      <Loader2 className="h-7 w-7 animate-spin text-magenta" />
      {label && <span className="font-mono text-xs uppercase tracking-widest">{label}</span>}
    </div>
  );
  if (full) {
    return <div className="flex min-h-[60vh] w-full items-center justify-center">{inner}</div>;
  }
  return <div className="flex w-full items-center justify-center py-12">{inner}</div>;
}
