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
      className="flex bg-brand-sage p-1 rounded-full"
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
            className={`flex flex-1 items-center justify-center rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all ${
              isActive
                ? "bg-brand-primary text-brand-background shadow-sm"
                : "text-brand-primary/70 hover:text-brand-primary hover:bg-brand-primary/10"
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
