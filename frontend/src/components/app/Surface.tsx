import { cn } from "@/lib/utils";

export function Surface({ className, children, padded = true }: {
  className?: string; children: React.ReactNode; padded?: boolean;
}) {
  return (
    <div className={cn(
      "rounded-2xl border border-border bg-surface shadow-card",
      padded && "p-5",
      className,
    )}>
      {children}
    </div>
  );
}

export function SectionTitle({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 mb-4">
      <div>
        <h3 className="text-[15px] font-black tracking-tight text-foreground">{title}</h3>
        {sub && <p className="mt-0.5 text-[12px] text-muted-foreground">{sub}</p>}
      </div>
      {action}
    </div>
  );
}
