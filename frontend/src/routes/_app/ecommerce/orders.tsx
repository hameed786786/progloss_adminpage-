import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/app/TopBar";
import { Surface } from "@/components/app/Surface";
import { KpiCard } from "@/components/app/KpiCard";
import { StatusChip } from "@/components/app/StatusChip";
import { ShoppingBag, Truck, CheckCircle2, Banknote } from "lucide-react";
import { useEcommerceOrders } from "@/lib/hooks/api";

export const Route = createFileRoute("/_app/ecommerce/orders")({ component: Page });

function Page() {
  const { data: orders = [] } = useEcommerceOrders();

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total ?? 0), 0);
  const inTransit = orders.filter(o => o.status === "shipped" || o.status === "processing").length;
  const delivered = orders.filter(o => o.status === "delivered").length;
  const fulfilledTotal = orders.filter(o => o.status !== "cancelled").length;
  const fulfilmentRate = fulfilledTotal > 0 ? (delivered / fulfilledTotal) * 100 : 0;

  return (
    <>
      <TopBar title="Orders" subtitle="One-off ecommerce orders · fulfilment & status" />
      <div className="px-4 py-4 sm:px-6 sm:py-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <KpiCard label="Orders (MTD)" value={String(totalOrders)} icon={ShoppingBag} accent="primary" />
          <KpiCard label="Revenue" value={`AED ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} icon={Banknote} accent="success" />
          <KpiCard label="In transit" value={String(inTransit)} icon={Truck} accent="primary" />
          <KpiCard label="Fulfilment rate" value={`${fulfilmentRate.toFixed(1)}%`} icon={CheckCircle2} accent="success" />
        </div>
        <Surface padded={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px] min-w-[720px]">
              <thead className="bg-surface-muted text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
                <tr><th className="px-4 py-3 text-left">Order</th><th className="px-4 py-3 text-left">Customer</th><th className="px-4 py-3 text-right">Items</th><th className="px-4 py-3 text-right">Total</th><th className="px-4 py-3 text-left">Channel</th><th className="px-4 py-3 text-left">Date</th><th className="px-4 py-3 text-right">Status</th></tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id} className="border-t border-border hover:bg-surface-muted/60">
                    <td className="px-4 py-3 font-mono font-bold">{o.id}</td>
                    <td className="px-4 py-3">{o.customer}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{o.items}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-bold">AED {Number(o.total || 0).toFixed(2)}</td>
                    <td className="px-4 py-3">{o.channel && <StatusChip tone="info" dot={false}>{o.channel}</StatusChip>}</td>
                    <td className="px-4 py-3 text-muted-foreground">{o.date}</td>
                    <td className="px-4 py-3 text-right"><StatusChip tone={o.status==="delivered"?"success":o.status==="cancelled"?"danger":o.status==="shipped"?"info":"warning"}>{o.status}</StatusChip></td>
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

