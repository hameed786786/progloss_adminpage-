import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV, type NavGroupDef, type NavItem } from "./nav-config";

function Item({ to, label, icon: Icon, depth = 0, onNavigate }: NavItem & { depth?: number; onNavigate?: () => void }) {
  const { location } = useRouterState();
  
  let active = location.pathname === to;
  if (!active && to !== "/dashboard") {
    if (to === "/customers") {
      active = location.pathname.startsWith("/customers") &&
               !location.pathname.startsWith("/customers/complaints") &&
               !location.pathname.startsWith("/customers/tickets") &&
               !location.pathname.startsWith("/customers/lifecycle");
    } else {
      active = location.pathname.startsWith(to);
    }
  }
  return (
    <Link
      to={to}
      onClick={onNavigate}
      className={cn(
        "group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors",
        depth > 0 ? "ml-7 text-muted-foreground" : "text-foreground/80",
        active ? "bg-primary/8 text-primary" : "hover:bg-accent hover:text-foreground"
      )}
    >
      <Icon className={cn("h-[15px] w-[15px]", active ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} strokeWidth={1.75} />
      <span className="truncate">{label}</span>
    </Link>
  );
}

function Group({ group, onNavigate }: { group: NavGroupDef; onNavigate?: () => void }) {
  const { location } = useRouterState();
  const groupActive = group.items?.some((i) => location.pathname.startsWith(i.to)) ?? false;
  const [open, setOpen] = useState(groupActive);
  if (group.to) return <Item to={group.to} label={group.label} icon={group.icon} onNavigate={onNavigate} />;
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium text-foreground/80 transition-colors hover:bg-accent"
      >
        <group.icon className="h-[15px] w-[15px] text-muted-foreground" strokeWidth={1.75} />
        <span className="flex-1 text-left">{group.label}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="mt-0.5 flex flex-col gap-0.5 py-0.5">
          {group.items?.map((i) => <Item key={i.to} {...i} depth={1} onNavigate={onNavigate} />)}
        </div>
      )}
    </div>
  );
}

export function NavTree({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex flex-col gap-0.5">
      {NAV.map((g) => <Group key={g.label} group={g} onNavigate={onNavigate} />)}
    </div>
  );
}
