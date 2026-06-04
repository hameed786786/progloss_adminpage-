import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/app/TopBar";
import { Surface } from "@/components/app/Surface";
import { KpiCard } from "@/components/app/KpiCard";
import { StatusChip } from "@/components/app/StatusChip";
import { MessageSquareWarning, Clock, ShieldAlert, CheckCircle2 } from "lucide-react";
import { useComplaints } from "@/lib/hooks/api";

export const Route = createFileRoute("/_app/customers/complaints")({ component: Page });

const TONE = { urgent: "danger", high: "danger", medium: "warning", low: "neutral" } as const;
const STATUS = { investigating: "warning", escalated: "danger", "in-progress": "info", resolved: "success" } as const;

function Page() {
  const { data: complaints = [] } = useComplaints();

  const openComplaintsCount = complaints.filter(c => c.status !== "resolved").length;
  const slaBreachesCount = complaints.filter(c => c.sla === "Breached").length;
  const resolvedCount = complaints.filter(c => c.status === "resolved").length;

  return (
    <>
      <TopBar title="Complaints" subtitle="Customer escalations · root-cause & SLA monitoring" />
      <div className="px-4 py-4 sm:px-6 sm:py-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <KpiCard label="Open complaints" value={String(openComplaintsCount)} icon={MessageSquareWarning} accent="danger" />
          <KpiCard label="SLA breaches" value={String(slaBreachesCount)} icon={ShieldAlert} accent="danger" />
          <KpiCard label="Avg resolution" value="6h 42m" icon={Clock} accent="success" />
          <KpiCard label="Resolved (7d)" value={String(resolvedCount)} icon={CheckCircle2} accent="success" />
        </div>
        <Surface padded={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px] min-w-[840px]">
              <thead className="bg-surface-muted text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
                <tr><th className="px-4 py-3 text-left">ID</th><th className="px-4 py-3 text-left">Subject</th><th className="px-4 py-3 text-left">Customer</th><th className="px-4 py-3 text-left">Community</th><th className="px-4 py-3 text-left">Severity</th><th className="px-4 py-3 text-left">Status</th><th className="px-4 py-3 text-left">SLA</th><th className="px-4 py-3 text-left">Owner</th></tr>
              </thead>
              <tbody>
                {complaints.map(c => (
                  <tr key={c.id} className="border-t border-border hover:bg-surface-muted/60">
                    <td className="px-4 py-3 font-mono font-bold">{c.id}</td>
                    <td className="px-4 py-3"><div className="font-bold">{c.subject}</div><div className="text-[10.5px] text-muted-foreground">{c.opened}</div></td>
                    <td className="px-4 py-3">{c.customer}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.community}</td>
                    <td className="px-4 py-3"><StatusChip tone={TONE[c.severity as keyof typeof TONE] || "neutral"}>{c.severity}</StatusChip></td>
                    <td className="px-4 py-3"><StatusChip tone={STATUS[c.status as keyof typeof STATUS] || "neutral"}>{c.status}</StatusChip></td>
                    <td className="px-4 py-3 tabular-nums font-bold">{c.sla}</td>
                    <td className="px-4 py-3">{c.owner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Surface>
      </div>
    </>
  );
}
