import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/app/TopBar";
import { Surface } from "@/components/app/Surface";
import { KpiCard } from "@/components/app/KpiCard";
import { StatusChip } from "@/components/app/StatusChip";
import { Clock, LogIn, LogOut, AlertTriangle } from "lucide-react";
import { useStaff } from "@/lib/hooks/api";

export const Route = createFileRoute("/_app/staff/attendance")({ component: Page });

function Page() {
  const { data: staffData = [] } = useStaff();
  const staff = staffData;

  const ROWS = staff.map((s) => {
    return {
      ...s,
      in: s.clockIn || "—",
      out: s.clockOut || "—",
      hours: s.hours || "—",
      state: s.attendanceState || "Absent",
    };
  });

  const clockedIn = ROWS.filter(r => r.state !== "Absent").length;
  const lateArrivals = ROWS.filter(r => r.state === "Late").length;
  const absences = ROWS.filter(r => r.state === "Absent").length;
  
  // Calculate average working hours of clocked-in staff dynamically
  const activeRows = ROWS.filter(r => r.state !== "Absent" && r.hours && r.hours !== "—");
  const totalHours = activeRows.reduce((sum, r) => {
    const val = parseFloat(r.hours.replace("h", ""));
    return sum + (isNaN(val) ? 0 : val);
  }, 0);
  const avgHoursVal = activeRows.length > 0 ? (totalHours / activeRows.length).toFixed(1) : "0.0";
  const avgHours = `${avgHoursVal}h`;

  const dateStr = new Date().toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });

  return (
    <>
      <TopBar title="Attendance" subtitle={`Today · ${dateStr} · Geo-fenced clock in/out`} />
      <div className="px-4 py-4 sm:px-6 sm:py-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <KpiCard label="Clocked in" value={`${clockedIn} / ${staff.length}`} icon={LogIn} accent="success" />
          <KpiCard label="Late arrivals" value={String(lateArrivals)} icon={AlertTriangle} accent="warning" />
          <KpiCard label="Absences" value={String(absences)} icon={LogOut} accent="danger" />
          <KpiCard label="Avg hours / day" value={avgHours} icon={Clock} accent="primary" />
        </div>
        <Surface padded={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px] min-w-[720px]">
              <thead className="bg-surface-muted text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
                <tr><th className="px-4 py-3 text-left">Staff ID</th><th className="px-4 py-3 text-left">Name</th><th className="px-4 py-3 text-left">Shift</th><th className="px-4 py-3 text-right">Clock in</th><th className="px-4 py-3 text-right">Clock out</th><th className="px-4 py-3 text-right">Hours</th><th className="px-4 py-3 text-right">State</th></tr>
              </thead>
              <tbody>
                {ROWS.map(r => (
                  <tr key={r.id} className="border-t border-border hover:bg-surface-muted/60">
                    <td className="px-4 py-3 font-mono font-bold">{r.id}</td>
                    <td className="px-4 py-3 font-bold">{r.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.shift}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-bold">{r.in}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{r.out}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{r.hours}</td>
                    <td className="px-4 py-3 text-right"><StatusChip tone={r.state==="On time"?"success":r.state==="Late"?"warning":"danger"}>{r.state}</StatusChip></td>
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
