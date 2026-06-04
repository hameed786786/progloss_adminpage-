import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

export function FormDialog({
  open, onOpenChange, title, description, children, footer, size = "md",
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const sizes = { sm: "sm:max-w-[420px]", md: "sm:max-w-[520px]", lg: "sm:max-w-[680px]", xl: "sm:max-w-[860px]" };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("p-0 overflow-hidden max-h-[92vh] flex flex-col", sizes[size])}>
        <DialogHeader className="px-5 py-4 border-b border-border">
          <DialogTitle className="text-[16px] font-black tracking-tight">{title}</DialogTitle>
          {description && <DialogDescription className="text-[12.5px]">{description}</DialogDescription>}
        </DialogHeader>
        <div className="flex-1 overflow-auto px-5 py-4 space-y-4">{children}</div>
        {footer && (
          <DialogFooter className="px-5 py-3 border-t border-border bg-surface-muted/30 gap-2">{footer}</DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function Field({ label, children, hint, className }: { label: string; children: React.ReactNode; hint?: string; className?: string }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function FieldGrid({ children, cols = 2 }: { children: React.ReactNode; cols?: 1 | 2 | 3 }) {
  const c = { 1: "", 2: "sm:grid-cols-2", 3: "sm:grid-cols-3" }[cols];
  return <div className={cn("grid gap-4", c)}>{children}</div>;
}

export function PrimaryBtn({ children, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...p} className={cn("inline-flex h-9 items-center gap-1.5 rounded-xl bg-primary px-3 text-[12.5px] font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50", p.className)}>
      {children}
    </button>
  );
}

export function SecondaryBtn({ children, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...p} className={cn("inline-flex h-9 items-center rounded-xl border border-border bg-surface px-3 text-[12.5px] font-bold text-muted-foreground hover:text-foreground", p.className)}>
      {children}
    </button>
  );
}
