import { cn } from "@/lib/cn";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className, hover }: CardProps) {
  return (
    <div
      className={cn(
        "bg-[#0F1A35] border border-[#1E3055] rounded-xl p-5",
        hover && "transition-colors hover:border-[#2A4070]",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("text-[11px] font-semibold text-[#7A9AC0] uppercase tracking-wider mb-4", className)}>
      {children}
    </div>
  );
}
