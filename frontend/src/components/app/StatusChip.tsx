import { cn } from "@/lib/utils";

type Tone = "success" | "warning" | "danger" | "info" | "neutral" | "primary";

const TONES: Record<Tone, string> = {
  success: "bg-[color:oklch(0.95_0.05_155)] text-[color:oklch(0.4_0.12_155)] ring-[color:oklch(0.88_0.07_155)]",
  warning: "bg-[color:oklch(0.97_0.06_75)] text-[color:oklch(0.45_0.13_60)] ring-[color:oklch(0.9_0.1_75)]",
  danger: "bg-[color:oklch(0.96_0.04_25)] text-[color:oklch(0.45_0.18_25)] ring-[color:oklch(0.88_0.08_25)]",
  info: "bg-[color:oklch(0.96_0.04_230)] text-[color:oklch(0.4_0.13_230)] ring-[color:oklch(0.88_0.06_230)]",
  neutral: "bg-surface-muted text-muted-foreground ring-border",
  primary: "bg-primary/8 text-primary ring-primary/15",
};

export function StatusChip({ tone = "neutral", children, dot = true, className }: {
  tone?: Tone; children: React.ReactNode; dot?: boolean; className?: string;
}) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-bold ring-1 ring-inset",
      TONES[tone], className
    )}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />}
      {children}
    </span>
  );
}
