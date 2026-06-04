import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/app/TopBar";
import { Surface } from "@/components/app/Surface";
import { History, Search, Download } from "lucide-react";
import { useAudit } from "@/lib/hooks/api";
import { useState } from "react";
import { exportToCSV } from "@/lib/utils";
import { AsyncState } from "@/components/app/AsyncState";

export const Route = createFileRoute("/_app/audit")({ component: AuditLogs });

function formatTs(ts: string) {
  try {
    const d = new Date(ts);
    const date = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(d);
    const time = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false }).format(d);
    return { date, time };
  } catch {
    return { date: ts, time: "" };
  }
}

function formatIp(ip?: string) {
  if (!ip || ip === "::1" || ip === "127.0.0.1") return "—";
  return ip;
}

function AuditLogs() {
  const { data: auditData, isLoading, error } = useAudit();
  const [search, setSearch] = useState("");
  const [activeRole, setActiveRole] = useState("All");

  const filteredAudit = (Array.isArray(auditData) ? auditData : []).filter((a) => {
    const s = search.toLowerCase();
    const matchesSearch =
      (a.actor || "").toLowerCase().includes(s) ||
      (a.action || "").toLowerCase().includes(s) ||
      (a.ip || "").toLowerCase().includes(s) ||
      (a.role || "").toLowerCase().includes(s);

    const matchesRole =
      activeRole === "All" ||
      (activeRole === "Super Admin" && a.role === "Super Admin") ||
      (activeRole === "Finance" && a.role?.includes("Finance")) ||
      (activeRole === "Operations" && (a.role?.includes("Ops") || a.role?.includes("Operations") || a.role?.includes("Dispatcher"))) ||
      (activeRole === "System" && (a.role === "System" || a.role === "AutoBilling" || a.role === "Gateway"));

    return matchesSearch && matchesRole;
  });

  return (
    <>
      <TopBar title="Audit Logs" subtitle="Tamper-evident · system-wide activity trail" actions={
        <button 
          onClick={() => exportToCSV(filteredAudit, "audit_logs")}
          className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border bg-surface px-3 text-[12.5px] font-bold hover:bg-accent"
        >
          <Download className="h-3.5 w-3.5" /> Export CSV
        </button>
      } />
      <div className="px-4 py-4 sm:px-6 sm:py-6 space-y-4">
        <Surface padded={false}>
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-surface-muted px-2.5 py-1.5 text-[12px] flex-1 max-w-md">
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              <input 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search actor, action, IP…" 
                className="w-full bg-transparent outline-none" 
              />
            </div>
            {["All","Super Admin","Finance","Operations","System"].map((t) => (
              <button 
                key={t} 
                onClick={() => setActiveRole(t)}
                className={`rounded-lg px-2.5 py-1.5 text-[11.5px] font-bold ${activeRole === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"}`}
              >
                {t}
              </button>
            ))}
          </div>
          <AsyncState isLoading={isLoading} error={error as Error | null} isEmpty={filteredAudit.length === 0} emptyMessage="No audit logs match the current filters.">
            <div className="divide-y divide-border">
              {filteredAudit.map((a, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-3 hover:bg-surface-muted/40">
                  <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0"><History className="h-3.5 w-3.5" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] text-foreground"><span className="font-bold">{a.actor || "System"}</span> <span className="text-muted-foreground">·</span> <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{a.role || "System"}</span></div>
                    <div className="text-[12.5px] text-foreground/80 mt-0.5">{a.action}</div>
                  </div>
                  <div className="text-right text-[11.5px] text-muted-foreground shrink-0">
                    <div>{formatTs(a.ts).date}</div>
                    <div className="text-[10.5px] tabular-nums">{formatTs(a.ts).time}</div>
                    <div className="font-mono text-[10.5px] mt-0.5">{formatIp(a.ip)}</div>
                  </div>
                </div>
              ))}
            </div>
          </AsyncState>
        </Surface>
      </div>
    </>
  );
}


