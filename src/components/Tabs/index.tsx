import type { ReactNode } from "react";

export interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  ariaLabel?: string;
}

export function Tabs({ tabs, activeId, onChange, ariaLabel }: TabsProps) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel ?? "Tabs"}
      className="flex bg-brand-champagne p-1 rounded-full"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            role="tab"
            type="button"
            aria-selected={isActive}
            aria-controls={`tabpanel-${tab.id}`}
            onClick={() => onChange(tab.id)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all ${
              isActive
                ? "bg-brand-primary text-brand-onPrimary shadow-sm"
                : "text-brand-primaryText hover:text-brand-text hover:bg-brand-primary/10"
            }`}
          >
            {tab.icon ? <span className="text-sm normal-case tracking-normal">{tab.icon}</span> : null}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
