import { cn } from "@/lib/cn";

type BadgeVariant = "default" | "ok" | "warn" | "bad" | "accent" | "muted";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  default: "bg-[#111D3A] text-[#7A9AC0] border-[#1E3055]",
  accent:  "bg-[rgba(26,111,255,0.15)] text-[#4D94FF] border-[rgba(26,111,255,0.3)]",
  ok:      "bg-[rgba(46,213,115,0.12)] text-[#5CFF8F] border-[rgba(46,213,115,0.25)]",
  warn:    "bg-[rgba(255,165,2,0.12)] text-[#FFB830] border-[rgba(255,165,2,0.25)]",
  bad:     "bg-[rgba(255,71,87,0.12)] text-[#FF6B7A] border-[rgba(255,71,87,0.25)]",
  muted:   "bg-[#0D1530] text-[#3A5080] border-[#1E3055]",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
