import { cn } from "@/lib/cn";
import { ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "default" | "green" | "gold" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const variants: Record<ButtonVariant, string> = {
  primary: "bg-[#1A6FFF] text-white border-[#1A6FFF] hover:bg-[#1560E0]",
  default: "bg-[#0D1530] text-[#E8F0FF] border-[#1E3055] hover:bg-[#111D3A]",
  green:   "bg-[rgba(46,213,115,0.15)] text-[#2ED573] border-[rgba(46,213,115,0.3)] hover:bg-[rgba(46,213,115,0.25)]",
  gold:    "bg-[rgba(255,215,0,0.12)] text-[#FFD700] border-[rgba(255,215,0,0.25)] hover:bg-[rgba(255,215,0,0.2)]",
  danger:  "bg-[rgba(255,71,87,0.15)] text-[#FF4757] border-[rgba(255,71,87,0.3)] hover:bg-[rgba(255,71,87,0.25)]",
  ghost:   "bg-transparent text-[#7A9AC0] border-transparent hover:bg-[#0D1530]",
};

const sizes: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-[12px] gap-1.5",
  md: "px-4 py-2 text-[13px] gap-2",
  lg: "px-5 py-2.5 text-[14px] gap-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "default", size = "md", loading, className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center font-medium rounded-lg border transition-all duration-150 cursor-pointer whitespace-nowrap",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading && (
          <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
