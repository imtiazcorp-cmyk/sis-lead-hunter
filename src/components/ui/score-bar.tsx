import { cn } from "@/lib/cn";

interface ScoreBarProps {
  label: string;
  value: number;
  inverted?: boolean; // true = plus bas est mieux (ex: obsolescence)
  className?: string;
}

function barColor(value: number, inverted: boolean) {
  if (inverted) {
    if (value >= 70) return "#FF4757";
    if (value >= 50) return "#FFA502";
    return "#2ED573";
  }
  if (value < 35) return "#FF4757";
  if (value < 55) return "#FFA502";
  return "#2ED573";
}

export function ScoreBar({ label, value, inverted = false, className }: ScoreBarProps) {
  const color = barColor(value, inverted);
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span className="text-[11px] text-[#7A9AC0] w-14 flex-shrink-0">{label}</span>
      <div className="flex-1 h-1 bg-[#0D1530] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
      <span className="text-[11px] font-semibold w-6 text-right flex-shrink-0" style={{ color }}>
        {value}
      </span>
    </div>
  );
}

export function ObsScore({ value }: { value: number }) {
  const color = value >= 70 ? "#FF4757" : value >= 50 ? "#FFA502" : "#2ED573";
  return (
    <div className="flex flex-col items-center bg-[#0D1530] border border-[#1E3055] rounded-xl px-3 py-2 flex-shrink-0">
      <span className="text-[22px] font-bold leading-none" style={{ color }}>{value}</span>
      <span className="text-[9px] text-[#3A5080] mt-1 tracking-wider uppercase">Obsol.</span>
    </div>
  );
}
