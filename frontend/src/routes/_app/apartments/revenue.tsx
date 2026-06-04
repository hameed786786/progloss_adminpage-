import { createFileRoute, Link } from "@tanstack/react-router";
import { TopBar } from "@/components/app/TopBar";
import { Surface, SectionTitle } from "@/components/app/Surface";
import { KpiCard } from "@/components/app/KpiCard";
import { Banknote, Building2, TrendingUp, ArrowUpRight } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useApartments } from "@/lib/hooks/api";

export const Route = createFileRoute("/_app/apartments/revenue")({ component: Page });

function Page() {
  const { data: apartmentsData = [] } = useApartments();
  const apartments = apartmentsData;
  const total = apartments.reduce((s, a) => s + (a.mrr || 0), 0);
  const data = apartments.map(a => ({ name: a.name.split(" ").slice(0,2).join(" "), mrr: a.mrr || 0 }));

  const sorted = [...apartments].sort((x, y) => (y.mrr || 0) - (x.mrr || 0));
  const topCommunity = sorted[0]?.name || "—";
  const topCommunityMRR = sorted[0]?.mrr || 0;

  return (
    <>
      <TopBar title="Apartment Revenue" subtitle="MRR contribution by community · AED" />
      <div className="px-4 py-4 sm:px-6 sm:py-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <KpiCard label="Total MRR" value={`AED ${total.toLocaleString()}`} icon={Banknote} accent="primary" />
          <KpiCard label="Top Community" value={topCommunity} icon={TrendingUp} accent="success" hint={`AED ${topCommunityMRR.toLocaleString()}/mo`} />
          <KpiCard label="Communities" value={String(apartments.length)} icon={Building2} accent="primary" hint={`${apartments.length} active billing`} />
          <KpiCard label="ARPU / community" value={`AED ${Math.round(total/(apartments.length || 1)).toLocaleString()}`} icon={Banknote} accent="success" />
        </div>
        <Surface>
          <SectionTitle title="MRR by community" sub="Last 30 days" />
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ left: -10, right: 10, top: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.93 0.008 250)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "oklch(0.52 0.02 256)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "oklch(0.52 0.02 256)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "white", border: "1px solid oklch(0.92 0.008 250)", borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="mrr" fill="oklch(0.48 0.16 258)" radius={[8,8,0,0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </Surface>
        <Surface padded={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px] min-w-[640px]">
              <thead className="bg-surface-muted text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Community</th>
                  <th className="px-4 py-3 text-right">Vehicles</th>
                  <th className="px-4 py-3 text-right">MRR</th>
                  <th className="px-4 py-3 text-right">ARPV</th>
                  <th className="px-4 py-3 text-right">Share</th>
                  <th className="px-4 py-3 text-right"></th>
                </tr>
              </thead>
              <tbody>
                {apartments.map(a => (
                  <tr key={a.name} className="border-t border-border hover:bg-surface-muted/60">
                    <td className="px-4 py-3 font-bold">{a.name}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{a.vehicles}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-bold">AED {(a.mrr ?? 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right tabular-nums">AED {Math.round((a.mrr ?? 0)/((a.vehicles ?? 1) || 1))}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{(((a.mrr ?? 0)/total)*100).toFixed(1)}%</td>
                    <td className="px-4 py-3 text-right">
                      <Link to="/apartments/revenue/$name" params={{ name: encodeURIComponent(a.name) }} className="inline-flex items-center gap-1 text-[11.5px] font-bold text-primary hover:underline">
                        Details <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    </td>
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
