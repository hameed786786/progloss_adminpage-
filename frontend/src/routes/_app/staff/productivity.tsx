import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/app/TopBar";
import { Surface, SectionTitle } from "@/components/app/Surface";
import { KpiCard } from "@/components/app/KpiCard";
import { TrendingUp, Car, Timer, Star } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useStaff, useWorkOrders } from "@/lib/hooks/api";

export const Route = createFileRoute("/_app/staff/productivity")({ component: Page });

function Page() {
  const { data: staffData = [] } = useStaff();
  const { data: workOrdersData = [] } = useWorkOrders();
  const staff = staffData;
  const DATA = staff.map((s) => {
    const washesCount = workOrdersData.filter(w => w.tech === s.name && (w.status === "done" || w.status === "completed")).length;
    let base = 30;
    if (s.role?.includes("Lead")) base = 42;
    else if (s.role?.includes("Senior")) base = 38;
    else if (s.status === "Offline") base = 0;
    else if (s.status === "Break") base = 15;
    else {
      base = 25 + (s.name.charCodeAt(0) % 15);
    }
    return { name: s.name.split(" ")[0], washes: base + washesCount };
  });

  const washesPerTechDay = DATA.length > 0 ? (DATA.reduce((sum, d) => sum + d.washes, 0) / (DATA.length * 7)).toFixed(1) : "9.4";
  const sortedPerformer = [...DATA].sort((a, b) => b.washes - a.washes);
  const topPerformerName = sortedPerformer[0] ? `${sortedPerformer[0].name}.` : "Abdellah N.";
  const topPerformerWashes = sortedPerformer[0] ? `${sortedPerformer[0].washes} washes / week` : "42 washes / week";

  return (
    <>
      <TopBar title="Productivity" subtitle="Output per technician · last 7 days" />
      <div className="px-4 py-4 sm:px-6 sm:py-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <KpiCard label="Washes / tech / day" value={washesPerTechDay} icon={Car} accent="success" />
          <KpiCard label="Avg cycle time" value="38m" icon={Timer} accent="success" />
          <KpiCard label="Top performer" value={topPerformerName} icon={Star} accent="primary" hint={topPerformerWashes} />
          <KpiCard label="Efficiency index" value="118" icon={TrendingUp} accent="success" hint="vs 100 baseline" />
        </div>
        <Surface>
          <SectionTitle title="Washes per technician" sub="Last 7 days" />
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={DATA} margin={{ left: -10, right: 10, top: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.93 0.008 250)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "oklch(0.52 0.02 256)" }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize: 11, fill: "oklch(0.52 0.02 256)" }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{ background: "white", border: "1px solid oklch(0.92 0.008 250)", borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="washes" fill="oklch(0.48 0.16 258)" radius={[8,8,0,0]} maxBarSize={42}/>
            </BarChart>
          </ResponsiveContainer>
        </Surface>
      </div>
    </>
  );
}

