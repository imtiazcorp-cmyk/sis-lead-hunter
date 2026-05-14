import { cn } from "@/lib/cn";
import { SelectHTMLAttributes, forwardRef } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, className, children, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && <label className="text-[11px] text-[#7A9AC0] font-medium">{label}</label>}
        <select
          ref={ref}
          className={cn(
            "bg-[#0D1530] border border-[#1E3055] rounded-lg px-3 py-2 text-[13px] text-[#E8F0FF]",
            "outline-none transition-colors focus:border-[#1A6FFF] cursor-pointer",
            "[&>option]:bg-[#0D1530]",
            className
          )}
          {...props}
        >
          {children}
        </select>
      </div>
    );
  }
);

Select.displayName = "Select";
