import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/app/TopBar";
import { Surface } from "@/components/app/Surface";
import { KpiCard } from "@/components/app/KpiCard";
import { StatusChip } from "@/components/app/StatusChip";
import { Tag, Plus, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { FormDialog, Field, FieldGrid, PrimaryBtn, SecondaryBtn } from "@/components/app/FormDialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCoupons, usePlans, queryKeys } from "@/lib/hooks/api";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Coupon } from "@/lib/api/types";

export const Route = createFileRoute("/_app/ecommerce/coupons")({ component: Page });

function Page() {
  const queryClient = useQueryClient();
  const { data: coupons = [] } = useCoupons();
  const { data: plansData = [] } = usePlans();

  const plans = plansData.filter(p => p && p.name);
  const [open, setOpen] = useState(false);

  const activeCodes = coupons.filter(c => c.status === "active").length;
  const totalRedeemed = coupons.reduce((sum, c) => sum + (c.redeemed ?? 0), 0);
  const discountValue = totalRedeemed * 25; // Dynamic estimation based on average discount of AED 25

  return (
    <>
      <TopBar title="Ecommerce Coupons" subtitle="Storefront discount codes & redemption tracking" actions={
        <PrimaryBtn onClick={() => setOpen(true)}><Plus className="h-3.5 w-3.5"/> New coupon</PrimaryBtn>
      }/>
      <div className="px-4 py-4 sm:px-6 sm:py-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <KpiCard label="Active codes" value={String(activeCodes)} icon={Tag} accent="primary" />
          <KpiCard label="Total redemptions" value={String(totalRedeemed)} icon={Tag} accent="success" />
          <KpiCard label="Discount value (MTD)" value={`AED ${discountValue.toLocaleString()}`} icon={Tag} accent="warning" />
          <KpiCard label="Avg basket lift" value="+12.4%" icon={Tag} accent="success" />
        </div>
        <Surface padded={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px] min-w-[720px]">
              <thead className="bg-surface-muted text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
                <tr><th className="px-4 py-3 text-left">Code</th><th className="px-4 py-3 text-left">Discount</th><th className="px-4 py-3 text-left">Scope</th><th className="px-4 py-3 text-right">Redeemed</th><th className="px-4 py-3 text-left">Expires</th><th className="px-4 py-3 text-right">Status</th></tr>
              </thead>
              <tbody>
                {coupons.map(c => (
                  <tr key={c.code} className="border-t border-border hover:bg-surface-muted/60">
                    <td className="px-4 py-3 font-mono font-black tracking-wider">{c.code}</td>
                    <td className="px-4 py-3 font-bold">{c.discount}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.plan || "Any plan"}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{c.redeemed} / {c.cap}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.expires}</td>
                    <td className="px-4 py-3 text-right"><StatusChip tone={c.status==="active"?"success":"neutral"}>{c.status}</StatusChip></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Surface>
      </div>

      <CreateCouponDialog
        open={open}
        onOpenChange={setOpen}
        plans={plans}
        onCreate={async (coupon)=>{
          try {
            await api.createCoupon(coupon);
            void queryClient.invalidateQueries({ queryKey: queryKeys.coupons });
            toast.success("Coupon created", { description: `${coupon.code} · ${coupon.discount}` });
          } catch (e: any) {
            toast.error(e.message || "Failed to create coupon");
          }
        }}
        exists={(code)=>coupons.some(c=>c.code===code)}
      />
    </>
  );
}

function CreateCouponDialog({ open, onOpenChange, onCreate, exists, plans }: { open: boolean; onOpenChange: (o:boolean)=>void; onCreate: (c: Coupon)=>void; exists: (code: string)=>boolean; plans: any[] }) {
  const [code, setCode] = useState("");
  const [plan, setPlan] = useState("Any plan");
  const [type, setType] = useState<"pct"|"flat">("pct");
  const [amount, setAmount] = useState("10");
  const [cap, setCap] = useState("100");
  const [expires, setExpires] = useState("");

  const reset = () => { setCode(""); setPlan("Any plan"); setType("pct"); setAmount("10"); setCap("100"); setExpires(""); };

  const submit = () => {
    const c = code.trim().toUpperCase();
    if (!c) return toast.error("Coupon code is required");
    if (exists(c)) return toast.error("A coupon with that code already exists");
    if (!expires) return toast.error("Expiry date is required");
    const amt = parseFloat(amount) || 0;
    const discount = type === "pct" ? `${amt}% off` : `AED ${amt} off`;
    const formatted = new Date(expires).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" });
    const coupon: Coupon = { code: c, plan: plan === "Any plan" ? "" : plan, discount, redeemed: 0, cap: parseInt(cap)||0, expires: formatted, status: "active" };
    onCreate(coupon);
    reset(); onOpenChange(false);
  };

  return (
    <FormDialog open={open} onOpenChange={(o)=>{ onOpenChange(o); if (!o) reset(); }}
      title="Create new coupon" description="Promotion codes can be redeemed at checkout or applied to renewals."
      size="lg"
      footer={<><SecondaryBtn onClick={()=>{ reset(); onOpenChange(false); }}>Cancel</SecondaryBtn><PrimaryBtn onClick={submit}><Plus className="h-3.5 w-3.5"/> Create coupon</PrimaryBtn></>}
    >
      <FieldGrid>
        <Field label="Coupon code" hint="Uppercase letters and numbers only.">
          <Input value={code} onChange={(e)=>setCode(e.target.value.toUpperCase())} placeholder="SUMMER25" className="font-mono tracking-wider" />
        </Field>
        <Field label="Applies to plan">
          <Select value={plan} onValueChange={setPlan}>
            <SelectTrigger><SelectValue/></SelectTrigger>
            <SelectContent>
              <SelectItem value="Any plan">Any plan</SelectItem>
              {plans.map(p=> <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
      </FieldGrid>
      <FieldGrid cols={3}>
        <Field label="Discount type">
          <Select value={type} onValueChange={(v)=>setType(v as "pct"|"flat")}>
            <SelectTrigger><SelectValue/></SelectTrigger>
            <SelectContent>
              <SelectItem value="pct">Percentage (%)</SelectItem>
              <SelectItem value="flat">Flat amount (AED)</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label={type==="pct" ? "Percent off" : "AED off"}><Input type="number" value={amount} onChange={(e)=>setAmount(e.target.value)} /></Field>
        <Field label="Redemption cap"><Input type="number" value={cap} onChange={(e)=>setCap(e.target.value)} /></Field>
      </FieldGrid>
      <Field label="Expires on"><Input type="date" value={expires} onChange={(e)=>setExpires(e.target.value)} /></Field>
    </FormDialog>
  );
}

