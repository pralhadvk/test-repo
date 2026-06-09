"use client";

export const CATEGORIES = [
  { key: "food",          label: "Food",          icon: "🍕", placeholder: "e.g. best ramen in Tokyo, vegetarian spots in London…" },
  { key: "travel",        label: "Travel",        icon: "✈️", placeholder: "e.g. hidden gems in Kyoto, budget beaches in SEA…" },
  { key: "tech",          label: "Tech",          icon: "💻", placeholder: "e.g. best state management in React, SQL vs NoSQL…" },
  { key: "finance",       label: "Finance",       icon: "💰", placeholder: "e.g. index funds for beginners, how to start investing…" },
  { key: "entertainment", label: "Entertainment", icon: "🎬", placeholder: "e.g. sci-fi movies like Inception, mystery podcasts…" },
];

export default function CategorySelector({
  selected,
  onChange,
}: {
  selected: string | null;
  onChange: (cat: string | null) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {CATEGORIES.map(cat => (
        <button
          key={cat.key}
          onClick={() => onChange(selected === cat.key ? null : cat.key)}
          className={`flex items-center gap-1.5 text-sm px-3.5 py-2 rounded-xl border transition-all duration-200 ${
            selected === cat.key
              ? "bg-blue-600/20 border-blue-500/50 text-blue-300 shadow shadow-blue-900/20"
              : "bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20 text-slate-400 hover:text-white"
          }`}
        >
          <span>{cat.icon}</span>
          <span className="font-medium">{cat.label}</span>
        </button>
      ))}
    </div>
  );
}
