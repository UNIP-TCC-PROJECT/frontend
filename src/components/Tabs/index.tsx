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
      className="flex bg-slate-100 p-1 rounded-2xl"
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
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
              isActive
                ? "bg-white text-brand-primary shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.icon ? <span className="text-base">{tab.icon}</span> : null}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
