import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { TopBar } from "@/components/app/TopBar";
import { Surface, SectionTitle } from "@/components/app/Surface";
import { Field, FieldGrid, PrimaryBtn, SecondaryBtn } from "@/components/app/FormDialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, FileText, Plus, Trash2 } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { toast } from "sonner";
import { useCustomers, useApartments, useVehicles, usePlans, queryKeys } from "@/lib/hooks/api";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export const Route = createFileRoute("/_app/billing/invoices/new")({ component: NewInvoice });

type Line = { id: string; desc: string; qty: number; rate: number };

function NewInvoice() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: customersData = [] } = useCustomers();
  const { data: apartmentsData = [] } = useApartments();
  const { data: vehiclesData = [] } = useVehicles();
  const { data: plansData = [] } = usePlans();

  const customersList = customersData.filter(c => c && c.name);
  const communitiesList = apartmentsData.map(a => a.name).filter(Boolean);
  const platesList = vehiclesData.map(v => v.plate).filter(Boolean);
  const plansList = plansData.filter(p => p && p.name);

  const [customer, setCustomer] = useState("");
  const [community, setCommunity] = useState("");
  const [plate, setPlate] = useState("");
  const [plan, setPlan] = useState("");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().slice(0,10));
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("Thank you for your business.");
  const [vatRate, setVatRate] = useState("5");
  const [lines, setLines] = useState<Line[]>([
    { id: crypto.randomUUID(), desc: "Royal Monthly subscription", qty: 1, rate: 420 },
  ]);

  useEffect(() => {
    if (customersList.length > 0 && !customer) setCustomer(customersList[0].name);
  }, [customersList, customer]);

  useEffect(() => {
    if (communitiesList.length > 0 && !community) setCommunity(communitiesList[0]);
  }, [communitiesList, community]);

  useEffect(() => {
    if (platesList.length > 0 && !plate) setPlate(platesList[0]);
  }, [platesList, plate]);

  useEffect(() => {
    if (plansList.length > 0 && !plan) setPlan(plansList[0].name);
  }, [plansList, plan]);

  const subtotal = useMemo(() => lines.reduce((s, l) => s + l.qty * l.rate, 0), [lines]);
  const vat = useMemo(() => (subtotal * (parseFloat(vatRate) || 0)) / 100, [subtotal, vatRate]);
  const total = subtotal + vat;

  const updateLine = (id: string, patch: Partial<Line>) =>
    setLines(lines.map(l => l.id === id ? { ...l, ...patch } : l));

  const submit = async () => {
    if (lines.length === 0) return toast.error("Add at least one line item");
    if (lines.some(l => !l.desc.trim() || l.qty <= 0)) return toast.error("All line items need a description and quantity");
    
    try {
      const id = `INV-2026-${String(Math.floor(Math.random() * 90000) + 10000)}`;
      await api.createInvoice({
        id,
        customer,
        community,
        plate,
        plan,
        subtotal,
        vat,
        total,
        status: "pending",
        date: new Date().toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.invoices });
      toast.success("Invoice created", { description: `${id} · AED ${total.toFixed(2)}` });
      navigate({ to: "/billing/invoices" });
    } catch (err: any) {
      toast.error(err.message || "Failed to create invoice");
    }
  };

  return (
    <>
      <TopBar title="Create invoice" subtitle="Manual invoice — issued outside of the recurring billing cycle" />
      <div className="px-4 py-4 sm:px-6 sm:py-6 space-y-6">
        <Link to="/billing/invoices" className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-muted-foreground hover:text-foreground"><ArrowLeft className="h-3.5 w-3.5"/> Back to invoices</Link>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Surface>
              <SectionTitle title="Bill to" sub="Pick an existing customer and assign the vehicle" />
              <div className="space-y-4">
                <FieldGrid>
                  <Field label="Customer">
                    <Select value={customer} onValueChange={setCustomer}>
                      <SelectTrigger><SelectValue/></SelectTrigger>
                      <SelectContent>{customersList.map(c=> <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </Field>
                  <Field label="Community">
                    <Select value={community} onValueChange={setCommunity}>
                      <SelectTrigger><SelectValue/></SelectTrigger>
                      <SelectContent>{communitiesList.map(c=> <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </Field>
                </FieldGrid>
                <FieldGrid>
                  <Field label="Vehicle plate">
                    <Select value={plate} onValueChange={setPlate}>
                      <SelectTrigger><SelectValue/></SelectTrigger>
                      <SelectContent>{platesList.map(p=> <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                    </Select>
                  </Field>
                  <Field label="Plan">
                    <Select value={plan} onValueChange={setPlan}>
                      <SelectTrigger><SelectValue/></SelectTrigger>
                      <SelectContent>{plansList.map(p=> <SelectItem key={p.id || p.name} value={p.name}>{p.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </Field>
                </FieldGrid>
              </div>
            </Surface>

            <Surface>
              <SectionTitle title="Line items" sub="Add services, one-off charges or fees"
                action={<button onClick={()=>setLines([...lines, { id: crypto.randomUUID(), desc: "", qty: 1, rate: 0 }])} className="inline-flex items-center gap-1 text-[12px] font-bold text-primary hover:underline"><Plus className="h-3.5 w-3.5"/> Add line</button>}
              />
              <div className="space-y-2">
                <div className="hidden sm:grid grid-cols-12 gap-2 text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground px-1">
                  <div className="col-span-6">Description</div>
                  <div className="col-span-2 text-right">Qty</div>
                  <div className="col-span-2 text-right">Rate (AED)</div>
                  <div className="col-span-2 text-right">Total</div>
                </div>
                {lines.map(l => (
                  <div key={l.id} className="grid grid-cols-12 gap-2 items-center rounded-xl border border-border p-2 sm:p-0 sm:border-0">
                    <div className="col-span-12 sm:col-span-6">
                      <Input value={l.desc} onChange={(e)=>updateLine(l.id, { desc: e.target.value })} placeholder="Service or item description" />
                    </div>
                    <div className="col-span-4 sm:col-span-2"><Input type="number" min={1} value={l.qty} onChange={(e)=>updateLine(l.id, { qty: parseInt(e.target.value)||0 })} className="text-right tabular-nums" /></div>
                    <div className="col-span-4 sm:col-span-2"><Input type="number" min={0} step="0.01" value={l.rate} onChange={(e)=>updateLine(l.id, { rate: parseFloat(e.target.value)||0 })} className="text-right tabular-nums" /></div>
                    <div className="col-span-3 sm:col-span-1 text-right tabular-nums font-bold text-[13px]">AED {(l.qty*l.rate).toFixed(2)}</div>
                    <div className="col-span-1 text-right">
                      <button onClick={()=>setLines(lines.filter(x=>x.id!==l.id))} className="text-muted-foreground hover:text-destructive" aria-label="Remove">
                        <Trash2 className="h-3.5 w-3.5"/>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Surface>

            <Surface>
              <SectionTitle title="Notes" />
              <Textarea rows={3} value={notes} onChange={(e)=>setNotes(e.target.value)} />
            </Surface>
          </div>

          <div className="space-y-6">
            <Surface>
              <SectionTitle title="Invoice details" />
              <div className="space-y-4">
                <Field label="Issue date"><Input type="date" value={issueDate} onChange={(e)=>setIssueDate(e.target.value)} /></Field>
                <Field label="Due date"><Input type="date" value={dueDate} onChange={(e)=>setDueDate(e.target.value)} /></Field>
                <Field label="VAT rate (%)"><Input type="number" min={0} max={100} value={vatRate} onChange={(e)=>setVatRate(e.target.value)} /></Field>
              </div>
            </Surface>

            <Surface>
              <SectionTitle title="Summary" />
              <div className="space-y-2 text-[13px]">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="tabular-nums font-bold">AED {subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">VAT ({vatRate}%)</span><span className="tabular-nums">AED {vat.toFixed(2)}</span></div>
                <div className="border-t border-border pt-2 flex justify-between text-[15px]"><span className="font-black">Total due</span><span className="tabular-nums font-black text-primary">AED {total.toFixed(2)}</span></div>
              </div>
              <div className="mt-4 flex flex-col gap-2">
                <PrimaryBtn onClick={submit} className="w-full justify-center"><FileText className="h-3.5 w-3.5"/> Create invoice</PrimaryBtn>
                <SecondaryBtn onClick={()=>navigate({ to: "/billing/invoices" })} className="w-full justify-center">Cancel</SecondaryBtn>
              </div>
            </Surface>
          </div>
        </div>
      </div>
    </>
  );
}

