import { Construction } from "lucide-react";
import { Surface } from "./Surface";

export function PageStub({ title, description }: { title: string; description: string }) {
  return (
    <Surface className="flex flex-col items-center justify-center py-20 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Construction className="h-5 w-5" />
      </div>
      <h2 className="mt-4 text-lg font-black tracking-tight">{title}</h2>
      <p className="mt-1 max-w-md text-[13px] text-muted-foreground">{description}</p>
      <div className="mt-6 flex gap-2">
        <button className="rounded-xl bg-primary px-4 py-2 text-[12.5px] font-bold text-primary-foreground shadow-card hover:bg-primary/90">Configure module</button>
        <button className="rounded-xl border border-border bg-surface px-4 py-2 text-[12.5px] font-bold text-foreground hover:bg-accent">Documentation</button>
      </div>
    </Surface>
  );
}
