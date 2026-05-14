"use client";

import { cn } from "@/lib/cn";

interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  sub?: string;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, label, sub, disabled }: ToggleProps) {
  return (
    <div className="flex items-center justify-between bg-[#0D1530] border border-[#1E3055] rounded-lg px-3 py-2.5">
      <div>
        {label && <div className="text-[12px] text-[#E8F0FF]">{label}</div>}
        {sub && <div className="text-[10px] text-[#3A5080] mt-0.5">{sub}</div>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative w-9 h-5 rounded-full border transition-all duration-300 flex-shrink-0 focus:outline-none",
          checked ? "bg-[#1A6FFF] border-[#1A6FFF]" : "bg-[#111D3A] border-[#1E3055]",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 w-3.5 h-3.5 rounded-full transition-all duration-300",
            checked ? "left-[calc(100%-16px)] bg-white" : "left-0.5 bg-[#3A5080]"
          )}
        />
      </button>
    </div>
  );
}
