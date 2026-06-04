import { useState } from "react";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { NavTree } from "./NavTree";
import { BrandHeader, WorkspaceCard, UserFooter } from "./SidebarNav";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          aria-label="Open menu"
          className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface text-foreground shadow-card hover:bg-accent"
        >
          <Menu className="h-4 w-4" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] p-0 bg-sidebar flex flex-col">
        <BrandHeader />
        <WorkspaceCard />
        <nav className="mt-3 flex-1 overflow-y-auto px-3 pb-4">
          <NavTree onNavigate={() => setOpen(false)} />
        </nav>
        <UserFooter />
      </SheetContent>
    </Sheet>
  );
}
