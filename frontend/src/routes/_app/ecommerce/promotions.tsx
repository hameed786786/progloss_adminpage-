import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/app/TopBar";
import { Surface, SectionTitle } from "@/components/app/Surface";
import { KpiCard } from "@/components/app/KpiCard";
import { StatusChip } from "@/components/app/StatusChip";
import { Megaphone, Eye, MousePointerClick, Sparkles } from "lucide-react";
import { usePromotions } from "@/lib/hooks/api";

export const Route = createFileRoute("/_app/ecommerce/promotions")({ component: Page });

function Page() {
  const { data: campaigns = [] } = usePromotions();

  const liveCount = campaigns.filter(c => c.status === "live").length;
  const totalReach = campaigns.reduce((sum, c) => sum + (c.reach ?? 0), 0);
  const avgCtr = campaigns.length ? campaigns.reduce((sum, c) => sum + (c.ctr ?? 0), 0) / campaigns.length : 0;
  const totalConv = campaigns.reduce((sum, c) => sum + (c.conv ?? 0), 0);
  const attributedRevenue = totalConv * 150; // Dynamic estimation based on average wash value of AED 150

  return (
    <>
      <TopBar title="Promotions" subtitle="Lifecycle, seasonal & cross-sell campaigns" />
      <div className="px-4 py-4 sm:px-6 sm:py-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <KpiCard label="Live campaigns" value={String(liveCount)} icon={Megaphone} accent="primary" />
          <KpiCard label="Reach (MTD)" value={totalReach.toLocaleString()} icon={Eye} accent="primary" />
          <KpiCard label="Avg CTR" value={`${avgCtr.toFixed(1)}%`} icon={MousePointerClick} accent="success" />
          <KpiCard label="Attributed revenue" value={`AED ${attributedRevenue.toLocaleString()}`} icon={Sparkles} accent="success" />
        </div>
        <Surface padded={false}>
          <div className="px-5 py-4 border-b border-border"><SectionTitle title="Active & past campaigns" /></div>
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px] min-w-[720px]">
              <thead className="bg-surface-muted text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
                <tr><th className="px-4 py-3 text-left">Campaign</th><th className="px-4 py-3 text-left">Channels</th><th className="px-4 py-3 text-left">Window</th><th className="px-4 py-3 text-right">Reach</th><th className="px-4 py-3 text-right">CTR</th><th className="px-4 py-3 text-right">Conv.</th><th className="px-4 py-3 text-right">Status</th></tr>
              </thead>
              <tbody>
                {campaigns.map(c => (
                  <tr key={c.name} className="border-t border-border hover:bg-surface-muted/60">
                    <td className="px-4 py-3 font-bold">{c.name}</td>
                    <td className="px-4 py-3"><div className="flex flex-wrap gap-1">{c.channels.map(ch => <StatusChip key={ch} tone="info" dot={false}>{ch}</StatusChip>)}</div></td>
                    <td className="px-4 py-3 text-muted-foreground">{c.starts} → {c.ends}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{(c.reach ?? 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-bold">{c.ctr}%</td>
                    <td className="px-4 py-3 text-right tabular-nums">{c.conv}</td>
                    <td className="px-4 py-3 text-right"><StatusChip tone={c.status==="live"?"success":"neutral"}>{c.status}</StatusChip></td>
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

