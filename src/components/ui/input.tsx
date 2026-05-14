import { cn } from "@/lib/cn";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && <label className="text-[11px] text-[#7A9AC0] font-medium">{label}</label>}
        <input
          ref={ref}
          className={cn(
            "bg-[#0D1530] border border-[#1E3055] rounded-lg px-3 py-2 text-[13px] text-[#E8F0FF]",
            "outline-none transition-colors focus:border-[#1A6FFF]",
            "placeholder:text-[#3A5080]",
            "disabled:opacity-50",
            error && "border-[#FF4757]",
            className
          )}
          {...props}
        />
        {hint && <span className="text-[11px] text-[#3A5080]">{hint}</span>}
        {error && <span className="text-[11px] text-[#FF4757]">{error}</span>}
      </div>
    );
  }
);

Input.displayName = "Input";
