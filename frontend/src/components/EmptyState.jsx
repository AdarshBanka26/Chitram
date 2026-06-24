import { ImageOff } from 'lucide-react';

export default function EmptyState({ message = 'Nothing here yet.', action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-ink/15 py-20 text-center">
      <ImageOff className="h-8 w-8 text-ink/30" />
      <p className="mt-4 max-w-sm font-mono text-sm uppercase tracking-wider text-ink/50">{message}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}