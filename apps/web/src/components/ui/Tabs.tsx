import React, { useRef, useState, useId, useEffect } from 'react';

export interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  defaultSelectedId?: string;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ items, defaultSelectedId, className = '' }) => {
  const tabsId = useId();
  const [selectedId, setSelectedId] = useState(defaultSelectedId || items[0]?.id);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const selectedIndex = items.findIndex((t) => t.id === selectedId);

  useEffect(() => {
    if (defaultSelectedId) {
      setSelectedId(defaultSelectedId);
    }
  }, [defaultSelectedId]);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let newIndex = index;
    if (e.key === 'ArrowRight') {
      newIndex = index < items.length - 1 ? index + 1 : 0;
    } else if (e.key === 'ArrowLeft') {
      newIndex = index > 0 ? index - 1 : items.length - 1;
    }

    if (newIndex !== index) {
      e.preventDefault();
      setSelectedId(items[newIndex].id);
      tabRefs.current[newIndex]?.focus();
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div
        role="tablist"
        aria-orientation="horizontal"
        className="flex overflow-x-auto no-scrollbar border-b border-(--qc-border)"
      >
        {items.map((tab, index) => {
          const isSelected = selectedId === tab.id;
          return (
            <button
              key={tab.id}
              ref={(el) => (tabRefs.current[index] = el)}
              role="tab"
              aria-selected={isSelected}
              aria-controls={`${tabsId}-panel-${tab.id}`}
              id={`${tabsId}-tab-${tab.id}`}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => setSelectedId(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={`
                relative px-4 h-12 flex items-center justify-center text-[14px] font-medium whitespace-nowrap
                transition-colors duration-(--qc-duration-fast)
                focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-(--qc-focus) focus-visible:ring-inset
                ${isSelected ? 'text-(--qc-primary) bg-(--qc-primary-bg)' : 'text-(--qc-ink-2) hover:text-(--qc-ink) hover:bg-(--qc-bg)'}
              `}
            >
              {tab.label}
              {isSelected && (
                <span 
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-(--qc-primary) transition-transform duration-(--qc-duration-panel) origin-left motion-reduce:transition-none" 
                />
              )}
            </button>
          );
        })}
      </div>
      <div className="pt-4">
        {items.map((tab) => (
          <div
            key={tab.id}
            role="tabpanel"
            id={`${tabsId}-panel-${tab.id}`}
            aria-labelledby={`${tabsId}-tab-${tab.id}`}
            hidden={selectedId !== tab.id}
            tabIndex={0}
            className="focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-(--qc-focus) rounded-xs"
          >
            {selectedId === tab.id && tab.content}
          </div>
        ))}
      </div>
    </div>
  );
};
