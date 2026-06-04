import { ArrowUpRight, ArrowDownRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function KpiCard({
  label, value, delta, icon: Icon, accent = "primary", hint,
}: {
  label: string; value: string; delta?: number; icon: LucideIcon;
  accent?: "primary" | "success" | "warning" | "danger"; hint?: string;
}) {
  const positive = (delta ?? 0) >= 0;
  const accentBg = {
    primary: "bg-primary/10 text-primary",
    success: "bg-[color:oklch(0.95_0.05_155)] text-[color:oklch(0.4_0.12_155)]",
    warning: "bg-[color:oklch(0.97_0.06_75)] text-[color:oklch(0.45_0.13_60)]",
    danger: "bg-[color:oklch(0.96_0.04_25)] text-[color:oklch(0.45_0.18_25)]",
  }[accent];
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-card transition-shadow hover:shadow-elevated">
      <div className="flex items-start justify-between gap-3">
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", accentBg)}>
          <Icon className="h-4 w-4" strokeWidth={2} />
        </div>
        {typeof delta === "number" && (
          <span className={cn(
            "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-bold",
            positive ? "bg-[color:oklch(0.95_0.05_155)] text-[color:oklch(0.4_0.12_155)]"
                     : "bg-[color:oklch(0.96_0.04_25)] text-[color:oklch(0.45_0.18_25)]"
          )}>
            {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(delta).toFixed(1)}%
          </span>
        )}
      </div>
      <div className="mt-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-[26px] font-black leading-none tracking-tight text-foreground">{value}</div>
      {hint && <div className="mt-2 text-[11.5px] text-muted-foreground">{hint}</div>}
    </div>
  );
}
