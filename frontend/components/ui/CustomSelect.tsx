"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

interface Option {
  value: string;
  label: string;
  color?: string; // optional text color class e.g. "text-emerald-400"
}

interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  bangla?: boolean; // enables Noto Sans Bengali font
}

// Bangla font style
const banglaStyle = { fontFamily: "'Noto Sans Bengali', 'SolaimanLipi', sans-serif" };

export default function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Select...",
  disabled = false,
  bangla = false,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Calculate dropdown position based on trigger button position
  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setDropdownStyle({
      position: "fixed",
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
      zIndex: 9999,
    });
  };

  // Open/close dropdown
  const handleToggle = () => {
    if (disabled) return;
    if (!open) updatePosition();
    setOpen((prev) => !prev);
  };

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Recalculate on scroll or resize
  useEffect(() => {
    if (!open) return;
    const handleScroll = () => updatePosition();
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleScroll);
    };
  }, [open]);

  // Find selected option
  const selectedOption = options.find((o) => o.value === value);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;
  const displayColor = selectedOption?.color || "text-slate-200";

  const dropdownList = (
    <div
      ref={dropdownRef}
      style={dropdownStyle}
      className="
        bg-slate-900 border border-slate-700
        rounded-xl shadow-2xl shadow-black/60
        max-h-64 overflow-y-auto
      "
    >
      {/* Placeholder option */}
      <div
        onClick={() => { onChange(""); setOpen(false); }}
        className="px-4 py-2.5 text-sm text-slate-500 hover:bg-slate-800 cursor-pointer transition-colors duration-150"
        style={bangla ? banglaStyle : undefined}
      >
        {placeholder}
      </div>

      {/* Divider */}
      <div className="border-t border-slate-800 mx-2" />

      {/* Options */}
      {options.map((option) => (
        <div
          key={option.value}
          onClick={() => { onChange(option.value); setOpen(false); }}
          style={bangla ? banglaStyle : undefined}
          className={`
            px-4 py-2.5 text-sm cursor-pointer
            leading-snug break-words
            transition-colors duration-150
            ${option.value === value
              ? "bg-indigo-600/30 text-indigo-300"
              : `hover:bg-slate-800 ${option.color || "text-slate-200"}`
            }
          `}
        >
          {option.label}
        </div>
      ))}

      {/* Empty state */}
      {options.length === 0 && (
        <div className="px-4 py-3 text-sm text-slate-500 text-center">
          No options available
        </div>
      )}
    </div>
  );

  return (
    <div className="relative w-full">

      {/* Trigger button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        style={bangla ? banglaStyle : undefined}
        className={`
          w-full bg-slate-900/60 border rounded-xl px-4 py-2.5 text-sm text-left
          flex items-center justify-between gap-2
          transition-all duration-200
          ${open
            ? "border-indigo-500 ring-2 ring-indigo-500/20"
            : "border-slate-700 hover:border-slate-500"
          }
          ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
          ${displayColor}
        `}
      >
        {/* Selected label — wraps if long */}
        <span className="leading-snug break-words min-w-0">
          {displayLabel}
        </span>

        {/* Chevron icon */}
        <svg
          className={`w-4 h-4 flex-shrink-0 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown rendered via portal — avoids overflow:hidden clipping from parent modal */}
      {open && typeof window !== "undefined" && createPortal(dropdownList, document.body)}

    </div>
  );
}