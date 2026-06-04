import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/app/TopBar";
import { Surface } from "@/components/app/Surface";
import { KpiCard } from "@/components/app/KpiCard";
import { StatusChip } from "@/components/app/StatusChip";
import { FileMinus, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { FormDialog, Field, FieldGrid, PrimaryBtn, SecondaryBtn } from "@/components/app/FormDialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreditNotes, useInvoices, queryKeys } from "@/lib/hooks/api";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export const Route = createFileRoute("/_app/billing/credit")({ component: Page });

const REASONS = ["Service downgrade","Goodwill credit","Plan correction","SLA breach compensation","Pricing error","Duplicate charge","Service cancellation","Other"];

function Page() {
  const queryClient = useQueryClient();
  const { data: creditNotesData = [] } = useCreditNotes();
  const { data: invoicesData = [] } = useInvoices();
  const invoices = invoicesData.filter(i => i && i.id && i.customer);

  const [open, setOpen] = useState(false);

  return (
    <>
      <TopBar title="Credit Notes" subtitle="Customer credit balance & ledger adjustments" actions={
        <PrimaryBtn onClick={()=>setOpen(true)}><Plus className="h-3.5 w-3.5"/> <span className="hidden sm:inline">Issue credit note</span></PrimaryBtn>
      }/>
      <div className="px-4 py-4 sm:px-6 sm:py-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <KpiCard label="Issued this month" value={String(creditNotesData.length)} icon={FileMinus} accent="primary" />
          <KpiCard label="Credit liability" value={`AED ${creditNotesData.reduce((s, c) => s + (c.total || 0), 0).toLocaleString()}`} icon={FileMinus} accent="warning" />
          <KpiCard label="Applied YTD" value={`AED ${creditNotesData.filter(n=>n.status==="applied").reduce((s, c) => s + (c.total || 0), 0).toLocaleString()}`} icon={FileMinus} accent="success" />
          <KpiCard label="Pending approval" value={String(creditNotesData.filter(n=>n.status==="pending").length)} icon={FileMinus} accent="warning" />
        </div>
        <Surface padded={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px] min-w-[720px]">
              <thead className="bg-surface-muted text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Credit note</th>
                  <th className="px-4 py-3 text-left">Linked invoice</th>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">Reason</th>
                  <th className="px-4 py-3 text-right">Subtotal</th>
                  <th className="px-4 py-3 text-right">VAT 5%</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {creditNotesData.map(n => (
                  <tr key={n.id} className="border-t border-border hover:bg-surface-muted/60">
                    <td className="px-4 py-3 font-mono font-bold">{n.id}</td>
                    <td className="px-4 py-3 font-mono text-muted-foreground">{n.invoice}</td>
                    <td className="px-4 py-3">{n.customer}</td>
                    <td className="px-4 py-3 text-muted-foreground">{n.reason}</td>
                    <td className="px-4 py-3 text-right tabular-nums">AED {(n.amount || 0).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">AED {(n.vat || 0).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-bold">AED {(n.total || 0).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right"><StatusChip tone={n.status==="applied"?"success":"warning"}>{n.status}</StatusChip></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Surface>
      </div>

      <IssueCreditDialog 
        open={open} 
        onOpenChange={setOpen} 
        invoices={invoices} 
        nextId={`CN-2026-${String(119 + creditNotesData.length).padStart(4,"0")}`} 
        onCreate={async (n)=>{
          try {
            await api.createCreditNote(n);
            void queryClient.invalidateQueries({ queryKey: queryKeys.creditNotes });
            toast.success("Credit note issued", { description: `${n.id} · AED ${n.total.toFixed(2)}` });
          } catch (e: any) {
            toast.error(e.message || "Failed to issue credit note");
          }
        }} 
      />
    </>
  );
}

function IssueCreditDialog({ open, onOpenChange, onCreate, nextId, invoices }: { open: boolean; onOpenChange: (o:boolean)=>void; onCreate: (n: any)=>Promise<void>; nextId: string; invoices: any[] }) {
  const [invoice, setInvoice] = useState("");
  const [reason, setReason] = useState(REASONS[0]);
  const [amount, setAmount] = useState("0");
  const [notes, setNotes] = useState("");
  const [approve, setApprove] = useState("pending");

  useEffect(() => {
    if (invoices.length > 0 && !invoice) {
      setInvoice(invoices[0].id);
    }
  }, [invoices, invoice]);

  const inv = invoices.find(i => i.id === invoice) || invoices[0];
  const amt = parseFloat(amount) || 0;
  const vat = amt * 0.05;
  const total = amt + vat;

  const reset = () => { if(invoices.length > 0) setInvoice(invoices[0].id); setReason(REASONS[0]); setAmount("0"); setNotes(""); setApprove("pending"); };

  const submit = async () => {
    if (!inv) return toast.error("Select a linked invoice");
    if (amt <= 0) return toast.error("Credit amount must be greater than zero");
    if (amt > (inv.subtotal || 0)) return toast.error(`Cannot exceed invoice subtotal (AED ${(inv.subtotal || 0).toFixed(2)})`);
    const n = {
      id: nextId, invoice: inv.id, customer: inv.customer, reason,
      amount: amt, vat, total,
      issued: new Date().toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" }),
      status: approve,
    };
    await onCreate(n);
    reset(); onOpenChange(false);
  };

  return (
    <FormDialog open={open} onOpenChange={(o)=>{ onOpenChange(o); if (!o) reset(); }}
      title="Issue credit note" description="Credit notes adjust the ledger for an existing paid or pending invoice."
      size="lg"
      footer={<><SecondaryBtn onClick={()=>{ reset(); onOpenChange(false); }}>Cancel</SecondaryBtn><PrimaryBtn onClick={submit}><Plus className="h-3.5 w-3.5"/> Issue credit note</PrimaryBtn></>}
    >
      <FieldGrid>
        <Field label="Linked invoice">
          <Select value={invoice || (invoices[0]?.id || "")} onValueChange={setInvoice}>
            <SelectTrigger><SelectValue/></SelectTrigger>
            <SelectContent>{invoices.map(i=> <SelectItem key={i.id} value={i.id}>{i.id} · {i.customer} · AED {(i.total || 0).toFixed(2)}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="Reason">
          <Select value={reason} onValueChange={setReason}>
            <SelectTrigger><SelectValue/></SelectTrigger>
            <SelectContent>{REASONS.map(r=> <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
      </FieldGrid>
      <FieldGrid>
        <Field label="Credit amount (AED)" hint={inv ? `Invoice subtotal: AED ${(inv.subtotal || 0).toFixed(2)}` : undefined}>
          <Input type="number" min={0} step="0.01" value={amount} onChange={(e)=>setAmount(e.target.value)} />
        </Field>
        <Field label="Approval status">
          <Select value={approve} onValueChange={setApprove}>
            <SelectTrigger><SelectValue/></SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending approval</SelectItem>
              <SelectItem value="applied">Apply immediately</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </FieldGrid>
      <Field label="Internal notes (optional)"><Textarea rows={3} value={notes} onChange={(e)=>setNotes(e.target.value)} placeholder="Reference to ticket, approval chain or supporting context" /></Field>
      <div className="rounded-xl border border-border bg-surface-muted/50 p-3 text-[12.5px]">
        <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="tabular-nums font-bold">AED {amt.toFixed(2)}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">VAT 5%</span><span className="tabular-nums">AED {vat.toFixed(2)}</span></div>
        <div className="mt-1 pt-1 border-t border-border flex justify-between text-[14px]"><span className="font-black">Total credit</span><span className="tabular-nums font-black text-primary">AED {total.toFixed(2)}</span></div>
      </div>
    </FormDialog>
  );
}
