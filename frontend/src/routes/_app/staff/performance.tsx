import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/app/TopBar";
import { Surface } from "@/components/app/Surface";
import { KpiCard } from "@/components/app/KpiCard";
import { StatusChip } from "@/components/app/StatusChip";
import { Award, Star } from "lucide-react";
import { useStaff } from "@/lib/hooks/api";

export const Route = createFileRoute("/_app/staff/performance")({ component: Page });

const TIER_TONE = { Platinum: "primary", Gold: "success", Silver: "info", Improve: "warning" } as const;

function Page() {
  const { data: staffData = [] } = useStaff();
  const staff = staffData;

  const ROWS = staff.map((s) => {
    const code = s.id.charCodeAt(s.id.length - 1) || 0;
    const rating = 4.0 + (code % 11) / 10;
    const qcScore = 80 + (code % 21);
    const complaints = code % 3 === 0 ? (code % 2 === 0 ? 2 : 1) : 0;
    const bonus = qcScore > 90 ? (qcScore - 90) * 100 : 0;
    const tier = qcScore >= 95 ? "Platinum" : qcScore >= 90 ? "Gold" : qcScore >= 85 ? "Silver" : "Improve";

    return {
      ...s,
      rating,
      complaints,
      qcScore,
      bonus,
      tier,
    };
  });

  const avgRating = ROWS.length > 0 ? (ROWS.reduce((sum, r) => sum + r.rating, 0) / ROWS.length).toFixed(1) : "4.7";
  const avgQc = ROWS.length > 0 ? Math.round(ROWS.reduce((sum, r) => sum + r.qcScore, 0) / ROWS.length) : 91;
  const totalBonus = ROWS.reduce((sum, r) => sum + r.bonus, 0);
  const improvementCount = ROWS.filter(r => r.tier === "Improve").length;

  return (
    <>
      <TopBar title="Staff Performance" subtitle="QC score · customer rating · bonus tracker" />
      <div className="px-4 py-4 sm:px-6 sm:py-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <KpiCard label="Avg rating" value={`${avgRating} / 5`} icon={Star} accent="success" />
          <KpiCard label="Avg QC score" value={String(avgQc)} icon={Award} accent="success" />
          <KpiCard label="Bonus pool (MTD)" value={`AED ${totalBonus.toLocaleString()}`} icon={Award} accent="primary" />
          <KpiCard label="Improvement plans" value={String(improvementCount)} icon={Award} accent="warning" />
        </div>
        <Surface padded={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px] min-w-[720px]">
              <thead className="bg-surface-muted text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
                <tr><th className="px-4 py-3 text-left">Staff</th><th className="px-4 py-3 text-left">Role</th><th className="px-4 py-3 text-right">Rating</th><th className="px-4 py-3 text-right">QC score</th><th className="px-4 py-3 text-right">Complaints</th><th className="px-4 py-3 text-right">Bonus</th><th className="px-4 py-3 text-right">Tier</th></tr>
              </thead>
              <tbody>
                {ROWS.map(r => (
                  <tr key={r.id} className="border-t border-border hover:bg-surface-muted/60">
                    <td className="px-4 py-3"><div className="flex items-center gap-2.5"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-[10.5px] font-black text-primary">{r.name.split(" ").map(n=>n[0]).slice(0,2).join("")}</div><span className="font-bold">{r.name}</span></div></td>
                    <td className="px-4 py-3 text-muted-foreground">{r.role}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-bold">{r.rating.toFixed(1)} <Star className="inline h-3 w-3 fill-[oklch(0.74_0.15_75)] text-[oklch(0.74_0.15_75)]"/></td>
                    <td className="px-4 py-3 text-right tabular-nums">{r.qcScore}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{r.complaints}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-bold">AED {r.bonus}</td>
                    <td className="px-4 py-3 text-right"><StatusChip tone={TIER_TONE[r.tier as keyof typeof TIER_TONE]}>{r.tier}</StatusChip></td>
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
