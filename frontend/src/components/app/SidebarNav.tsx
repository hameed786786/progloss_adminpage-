import { Sparkles } from "lucide-react";
import { NavTree } from "./NavTree";
import { useAuth } from "@/lib/auth-store";

export function SidebarNav() {
  return (
    <aside className="hidden lg:flex h-screen sticky top-0 w-[252px] shrink-0 flex-col border-r border-border bg-sidebar">
      <BrandHeader />
      <WorkspaceCard />
      <nav className="mt-3 flex-1 overflow-y-auto px-3 pb-4">
        <NavTree />
      </nav>
      <UserFooter />
    </aside>
  );
}

export function BrandHeader() {
  const { user } = useAuth();
  return (
    <div className="flex items-center gap-2.5 px-5 py-5">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-card">
        <Sparkles className="h-[18px] w-[18px]" strokeWidth={2} />
      </div>
      <div className="flex flex-col leading-tight">
        <span className="text-[15px] font-black tracking-tight text-foreground">Progloss</span>
        <span className="text-[10.5px] font-medium uppercase tracking-[0.12em] text-muted-foreground">{user?.role || "Super Admin"}</span>
      </div>
    </div>
  );
}

export function WorkspaceCard() {
  return (
    <div className="px-3">
      <div className="rounded-xl border border-border bg-surface-muted px-3 py-2.5">
        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Workspace</div>
        <div className="mt-0.5 truncate text-[13px] font-bold text-foreground">Progloss Dubai HQ</div>
      </div>
    </div>
  );
}

export function UserFooter() {
  const { user } = useAuth();
  const email = user?.email || "admin@progloss.ae";
  const name = email.split('@')[0];
  const initials = name.slice(0, 2).toUpperCase();

  return (
    <div className="border-t border-border px-3 py-3">
      <div className="flex items-center gap-2.5 rounded-lg px-2 py-1.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">{initials}</div>
        <div className="min-w-0 flex-1 leading-tight">
          <div className="truncate text-[12.5px] font-bold text-foreground">{name}</div>
          <div className="truncate text-[10.5px] text-muted-foreground">{user?.role || "Super Admin"} · Dubai</div>
        </div>
      </div>
    </div>
  );
}
