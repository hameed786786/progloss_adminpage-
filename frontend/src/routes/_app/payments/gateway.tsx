import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/app/TopBar";
import { Surface, SectionTitle } from "@/components/app/Surface";
import { KpiCard } from "@/components/app/KpiCard";
import { StatusChip } from "@/components/app/StatusChip";
import { AsyncState } from "@/components/app/AsyncState";
import { Network, Activity, AlertTriangle, Zap } from "lucide-react";
import { useGateways } from "@/lib/hooks/api";

export const Route = createFileRoute("/_app/payments/gateway")({ component: Page });

function formatEventTs(ts: string): string {
  try {
    const d = new Date(ts);
    if (isNaN(d.getTime())) return ts;
    const now = new Date();
    const isToday =
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();
    const time = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(d);
    if (isToday) return `Today ${time}`;
    const date = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(d);
    return `${date} ${time}`;
  } catch {
    return ts;
  }
}

function Page() {
  const { data, isLoading, error } = useGateways();

  const gateways = data?.gateways ?? [];
  const events = data?.events ?? [];

  const onlineCount = gateways.filter((g) => g.status === "operational").length;
  const totalVolume = gateways.reduce((s, g) => s + (g.volume ?? 0), 0);
  const avgSuccess =
    gateways.length > 0
      ? (gateways.reduce((s, g) => s + (g.success ?? 0), 0) / gateways.length).toFixed(1)
      : "—";
  const alertCount = events.filter((e) => e.level === "error" || e.level === "warning").length;

  return (
    <>
      <TopBar title="Gateway Logs" subtitle="Multi-gateway routing · webhooks & reconciliation" />
      <div className="px-4 py-4 sm:px-6 sm:py-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <KpiCard
            label="Gateways online"
            value={`${onlineCount} / ${gateways.length || "—"}`}
            icon={Network}
            accent="primary"
          />
          <KpiCard
            label="Webhook success"
            value={gateways.length ? `${avgSuccess}%` : "—"}
            icon={Activity}
            accent="success"
          />
          <KpiCard
            label="Volume (MTD)"
            value={totalVolume ? `AED ${totalVolume.toLocaleString()}` : "—"}
            icon={Zap}
            accent="primary"
          />
          <KpiCard
            label="Alerts (feed)"
            value={String(alertCount)}
            icon={AlertTriangle}
            accent="warning"
          />
        </div>

        {/* Gateway status table */}
        <Surface padded={false}>
          <div className="px-5 py-4 border-b border-border">
            <SectionTitle title="Gateway status" />
          </div>
          <AsyncState isLoading={isLoading} error={error as Error | null} isEmpty={gateways.length === 0} emptyMessage="No gateways found.">
            <div className="overflow-x-auto">
              <table className="w-full text-[12.5px] min-w-[640px]">
                <thead className="bg-surface-muted text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left">Gateway</th>
                    <th className="px-4 py-3 text-left">Region</th>
                    <th className="px-4 py-3 text-right">Uptime</th>
                    <th className="px-4 py-3 text-right">Volume (MTD)</th>
                    <th className="px-4 py-3 text-right">Success</th>
                    <th className="px-4 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {gateways.map((g) => (
                    <tr key={g.name} className="border-t border-border hover:bg-surface-muted/60">
                      <td className="px-4 py-3 font-bold">{g.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{g.region ?? "—"}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{g.uptime != null ? `${g.uptime}%` : "—"}</td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {g.volume != null ? `AED ${g.volume.toLocaleString()}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums font-bold">
                        {g.success != null ? `${g.success}%` : "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <StatusChip tone={g.status === "operational" ? "success" : g.status === "degraded" ? "warning" : "danger"}>
                          {g.status}
                        </StatusChip>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AsyncState>
        </Surface>

        {/* Live events feed */}
        <Surface padded={false}>
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <SectionTitle title="Recent events" sub="Live webhook feed" />
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              Live
            </span>
          </div>
          <AsyncState isLoading={isLoading} error={error as Error | null} isEmpty={events.length === 0} emptyMessage="No gateway events recorded yet.">
            <div className="divide-y divide-border max-h-[360px] overflow-y-auto font-mono text-[11.5px]">
              {events.map((e, i) => (
                <div key={i} className="flex items-start gap-3 px-5 py-2.5 hover:bg-surface-muted/30">
                  <span className="text-muted-foreground w-24 shrink-0">{formatEventTs(e.ts)}</span>
                  <span className="w-28 shrink-0 font-bold text-foreground">{e.gw}</span>
                  <span
                    className={`w-52 shrink-0 ${
                      e.level === "error"
                        ? "text-destructive font-bold"
                        : e.level === "warning"
                        ? "text-[oklch(0.55_0.16_60)]"
                        : "text-primary"
                    }`}
                  >
                    {e.event}
                  </span>
                  <span className="flex-1 text-muted-foreground truncate">{e.payload ?? ""}</span>
                </div>
              ))}
            </div>
          </AsyncState>
        </Surface>
      </div>
    </>
  );
}
