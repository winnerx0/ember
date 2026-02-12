"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";
import { CATEGORY_CONFIGS } from "@/lib/constants/implementations";
import type { NodeCategory } from "@/lib/types";

interface CustomElementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (element: {
    name: string;
    category: NodeCategory;
    description: string;
    icon: string;
  }) => void;
}

const AVAILABLE_ICONS = [
  "Box",
  "Server",
  "Database",
  "Cloud",
  "Layers",
  "Cpu",
  "HardDrive",
  "Globe",
  "Lock",
  "Shield",
  "Zap",
  "Activity",
  "BarChart",
  "Bell",
  "Cog",
  "File",
  "Folder",
  "Key",
  "Link",
  "Mail",
  "MessageSquare",
  "Monitor",
  "Network",
  "Package",
  "Send",
  "Terminal",
  "Users",
  "Wifi",
];

export function CustomElementModal({
  isOpen,
  onClose,
  onSave,
}: CustomElementModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<NodeCategory>("service");
  const [icon, setIcon] = useState("Box");
  const [showIconPicker, setShowIconPicker] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    if (name.trim()) {
      onSave({
        name: name.trim(),
        category,
        description: description.trim(),
        icon,
      });
      setName("");
      setDescription("");
      setCategory("service");
      setIcon("Box");
      onClose();
    }
  };

  const SelectedIcon = LucideIcons[
    icon as keyof typeof LucideIcons
  ] as React.ComponentType<{ className?: string }>;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            Create Custom Element
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Custom Database"
              className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as NodeCategory)}
              className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {Object.entries(CATEGORY_CONFIGS).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>

          {/* Icon */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Icon
            </label>
            <div className="relative">
              <button
                onClick={() => setShowIconPicker(!showIconPicker)}
                className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground flex items-center gap-2 hover:bg-muted/80 transition-colors"
              >
                {SelectedIcon && <SelectedIcon className="w-4 h-4" />}
                <span>{icon}</span>
              </button>

              {showIconPicker && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-xl p-2 grid grid-cols-7 gap-1 max-h-[200px] overflow-y-auto z-10">
                  {AVAILABLE_ICONS.map((iconName) => {
                    const IconComponent = LucideIcons[
                      iconName as keyof typeof LucideIcons
                    ] as React.ComponentType<{ className?: string }>;
                    return (
                      <button
                        key={iconName}
                        onClick={() => {
                          setIcon(iconName);
                          setShowIconPicker(false);
                        }}
                        className={cn(
                          "p-2 rounded-md hover:bg-muted transition-colors",
                          icon === iconName &&
                            "bg-primary/20 ring-1 ring-primary",
                        )}
                        title={iconName}
                      >
                        {IconComponent && <IconComponent className="w-4 h-4" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this element..."
              rows={3}
              className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2",
              name.trim()
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-muted text-muted-foreground cursor-not-allowed",
            )}
          >
            <Plus className="w-4 h-4" />
            Create Element
          </button>
        </div>
      </div>
    </div>
  );
}
