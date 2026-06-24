const CATEGORIES = ['all', 'art', 'photography', 'writing', 'design', 'music', 'other'];

export default function CategoryFilter({ active = 'all', onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((c) => (
        <button
          key={c}
          onClick={() => onChange(c)}
          className={`rounded-full border px-4 py-1.5 font-mono text-xs uppercase tracking-wider transition ${
            active === c
              ? 'border-ink bg-ink text-white'
              : 'border-ink/15 text-ink/60 hover:border-ink hover:text-ink'
          }`}
        >
          {c}
        </button>
      ))}
    </div>
  );
}

export { CATEGORIES };