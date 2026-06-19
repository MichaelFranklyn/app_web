"use client";

import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import React, { ChangeEvent, useEffect, useRef, useState } from "react";

interface DropdownOption {
  value: number | string;
  label: string;
  disabled?: boolean;
}

interface Props {
  options?: DropdownOption[];
  value?: number | string | readonly string[];
  onChange?: (event: ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
  disabled?: boolean;
  "aria-label"?: string;
}

export function CalendarDropdown({
  options = [],
  value,
  onChange,
  className,
  disabled,
  "aria-label": ariaLabel,
}: Props) {
  const currentValue = Array.isArray(value) ? value[0] : value;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);
  const selected = options.find((o) => String(o.value) === String(currentValue));

  useEffect(() => {
    if (!open) return;
    const handler = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (ref.current?.contains(target)) return;
      setOpen(false);
    };
    // Capture phase: the InputDate popup calls stopPropagation on bubble,
    // which would prevent this listener from firing for clicks happening
    // inside the popup (e.g., the sibling month/year dropdown).
    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, [open]);

  // Scroll the currently-selected option into view when the dropdown opens.
  // Without this, year lists (which span decades) and even the 12-month list
  // open scrolled to the top, hiding the currently-selected entry.
  useEffect(() => {
    if (!open) return;
    const list = listRef.current;
    const target = selectedRef.current;
    if (!list || !target) return;
    list.scrollTop = target.offsetTop - list.clientHeight / 2 + target.clientHeight / 2;
  }, [open]);

  const handleSelect = (option: DropdownOption) => {
    const event = {
      target: { value: String(option.value) },
    } as unknown as ChangeEvent<HTMLSelectElement>;
    onChange?.(event);
    setOpen(false);
  };

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        className="flex items-center gap-[4px] bg-(--bg3) border border-(--border) rounded-(--r-sm) px-[6px] py-[4px] text-[13px] font-mono text-(--text) cursor-pointer hover:border-(--amber) focus:outline-none focus:border-(--amber) disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span>{selected?.label}</span>
        <ChevronDown
          size={12}
          className={cn("transition-transform duration-150", open && "rotate-180")}
        />
      </button>
      {open && (
        <div
          ref={listRef}
          className="absolute top-full left-0 mt-[4px] max-h-[200px] min-w-full overflow-y-auto overflow-x-hidden bg-(--bg2) rounded-(--r-sm) shadow-lg ring-1 ring-(--border) z-[10000] flex flex-col p-[4px] gap-[2px] [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-(--border2) [&::-webkit-scrollbar-thumb]:rounded-[2px]"
        >
          {options.map((option) => {
            const isSelected = String(option.value) === String(currentValue);
            return (
              <button
                key={option.value}
                ref={isSelected ? selectedRef : undefined}
                type="button"
                disabled={option.disabled}
                onClick={() => handleSelect(option)}
                className={cn(
                  "text-left px-[10px] py-[6px] text-[13px] font-mono rounded-(--r-sm) cursor-pointer hover:bg-(--bg3) disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap",
                  isSelected
                    ? "bg-(--amber-bg) text-(--amber)"
                    : "text-(--text)"
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
