"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";
import { CATEGORY_CONFIGS } from "@/lib/constants/implementations";

export function Legend() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const categories = Object.entries(CATEGORY_CONFIGS).filter(
    ([key]) => key !== "custom",
  );

  return (
    <div className="absolute bottom-4 left-4 z-50">
      <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full px-3 py-2 flex items-center justify-between hover:bg-muted/50 transition-colors"
        >
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Legend
          </span>
          {isCollapsed ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>

        {/* Content */}
        {!isCollapsed && (
          <div className="px-3 pb-3 grid grid-cols-2 gap-x-4 gap-y-1.5 max-h-[200px] overflow-y-auto">
            {categories.map(([category, config]) => {
              const Icon = LucideIcons[
                config.icon as keyof typeof LucideIcons
              ] as React.ComponentType<{ className?: string }>;

              return (
                <div key={category} className="flex items-center gap-2">
                  <div
                    className={cn(
                      "w-3 h-3 rounded-sm flex items-center justify-center",
                      config.bgColor,
                    )}
                  >
                    {Icon && <Icon className={cn("w-2 h-2", config.color)} />}
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {config.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
