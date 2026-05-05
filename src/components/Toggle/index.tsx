interface ToggleItem {
  id: string;
  label: string;
}

interface ToggleProps {
  items: ToggleItem[];
  activeId: string;
  onChange: (id: string) => void;
  ariaLabel?: string;
}

export function Toggle({ items, activeId, onChange, ariaLabel }: ToggleProps) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel ?? "Toggle"}
      className="flex bg-slate-100 p-1 rounded-2xl"
    >
      {items.map((item) => {
        const isActive = item.id === activeId;
        return (
          <button
            key={item.id}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(item.id)}
            className={`flex flex-1 items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition ${
              isActive
                ? "bg-white text-brand-primary shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
