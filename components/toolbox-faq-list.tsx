"use client";

import { useState } from "react";

type ToolboxFaqListProps = {
  items: readonly (readonly [string, string])[];
  initialCount: number;
  moreLabel: string;
  collapseLabel: string;
  className?: string;
};

export function ToolboxFaqList({ items, initialCount, moreLabel, collapseLabel, className = "toolbox-faq-list" }: ToolboxFaqListProps) {
  const [expanded, setExpanded] = useState(false);
  const visibleItems = expanded ? items : items.slice(0, initialCount);

  return (
    <div className={className}>
      {visibleItems.map(([q, a], index) => (
        <details key={q} open={index === 0}>
          <summary><span>{String(index + 1).padStart(2, "0")}</span>{q}<i>+</i></summary>
          <p>{a}</p>
        </details>
      ))}
      {items.length > initialCount && (
        <div className="toolbox-faq-actions">
          <button type="button" onClick={() => setExpanded((value) => !value)}>
            {expanded ? collapseLabel : moreLabel}
          </button>
        </div>
      )}
    </div>
  );
}
