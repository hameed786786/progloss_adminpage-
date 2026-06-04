import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { SidebarNav } from "@/components/app/SidebarNav";
import { RBACProvider } from "@/lib/rbac-store";
import { useAuth } from "@/lib/auth-store";
import { useEffect } from "react";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      void navigate({ to: "/login" });
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-sm font-bold text-muted-foreground animate-pulse">Loading admin session...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <RBACProvider>
      <div className="flex min-h-screen w-full bg-background">
        <SidebarNav />
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </RBACProvider>
  );
}

