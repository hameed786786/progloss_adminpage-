import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/app/TopBar";
import { Surface } from "@/components/app/Surface";
import { KpiCard } from "@/components/app/KpiCard";
import { StatusChip } from "@/components/app/StatusChip";
import { ShoppingBag, Plus, Package } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { FormDialog, Field, FieldGrid, PrimaryBtn, SecondaryBtn } from "@/components/app/FormDialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEcommerceProducts, queryKeys } from "@/lib/hooks/api";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { EcommerceProduct as Product } from "@/lib/api/types";

export const Route = createFileRoute("/_app/ecommerce/products")({ component: Page });

const CATEGORIES = ["Detailing","Wash","Cabin","Accessories","Tools","Consumables"];

function Page() {
  const queryClient = useQueryClient();
  const { data: products = [] } = useEcommerceProducts();
  const [open, setOpen] = useState(false);

  return (
    <>
      <TopBar title="Products" subtitle="Detailing & ecommerce catalogue" actions={
        <PrimaryBtn onClick={()=>setOpen(true)}><Plus className="h-3.5 w-3.5"/> <span className="hidden sm:inline">New product</span></PrimaryBtn>
      }/>
      <div className="px-4 py-4 sm:px-6 sm:py-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <KpiCard label="Total SKUs" value={String(products.length)} icon={ShoppingBag} accent="primary" />
          <KpiCard label="Units in stock" value={products.reduce((s,p)=>s+(p.stock || 0),0).toLocaleString()} icon={Package} accent="primary" />
          <KpiCard label="Units sold (MTD)" value={products.reduce((s,p)=>s+(p.sold || 0),0).toLocaleString()} icon={ShoppingBag} accent="success" />
          <KpiCard label="Low / out of stock" value={String(products.filter(p=>p.status!=="active").length)} icon={Package} accent="warning" />
        </div>
        <Surface padded={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px] min-w-[720px]">
              <thead className="bg-surface-muted text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
                <tr><th className="px-4 py-3 text-left">SKU</th><th className="px-4 py-3 text-left">Product</th><th className="px-4 py-3 text-left">Category</th><th className="px-4 py-3 text-right">Price</th><th className="px-4 py-3 text-right">Stock</th><th className="px-4 py-3 text-right">Sold</th><th className="px-4 py-3 text-right">Status</th></tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.sku} className="border-t border-border hover:bg-surface-muted/60">
                    <td className="px-4 py-3 font-mono font-bold">{p.sku}</td>
                    <td className="px-4 py-3 font-bold">{p.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.category}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-bold">AED {p.price}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{p.stock}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{p.sold}</td>
                    <td className="px-4 py-3 text-right"><StatusChip tone={p.status === "active" ? "success" : p.status === "low-stock" ? "warning" : "danger"}>{p.status}</StatusChip></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Surface>
      </div>

      <CreateProductDialog
        open={open}
        onOpenChange={setOpen}
        onCreate={async (p)=>{
          try {
            await api.createEcommerceProduct(p as any);
            void queryClient.invalidateQueries({ queryKey: queryKeys.ecommerceProducts });
            toast.success("Product created", { description: `${p.name} · ${p.sku}` });
          } catch (e: any) {
            toast.error(e.message || "Failed to create product");
          }
        }}
        exists={(sku)=>products.some(p=>p.sku===sku)}
      />
    </>
  );
}

function CreateProductDialog({ open, onOpenChange, onCreate, exists }: { open: boolean; onOpenChange: (o:boolean)=>void; onCreate: (p: Product)=>void; exists: (sku: string)=>boolean }) {
  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [price, setPrice] = useState("0");
  const [stock, setStock] = useState("0");
  const [desc, setDesc] = useState("");

  const reset = () => { setSku(""); setName(""); setCategory(CATEGORIES[0]); setPrice("0"); setStock("0"); setDesc(""); };

  const submit = () => {
    const s = sku.trim().toUpperCase();
    if (!s) return toast.error("SKU is required");
    if (exists(s)) return toast.error("A product with that SKU already exists");
    if (!name.trim()) return toast.error("Product name is required");
    const stk = parseInt(stock) || 0;
    const status = stk === 0 ? "out-of-stock" : stk < 10 ? "low-stock" : "active";
    const p: Product = { sku: s, name: name.trim(), category, price: parseFloat(price) || 0, stock: stk, sold: 0, status };
    onCreate(p);
    reset(); onOpenChange(false);
  };

  return (
    <FormDialog open={open} onOpenChange={(o)=>{ onOpenChange(o); if (!o) reset(); }}
      title="Create new product" description="Add a new SKU to the ecommerce catalogue."
      size="lg"
      footer={<><SecondaryBtn onClick={()=>{ reset(); onOpenChange(false); }}>Cancel</SecondaryBtn><PrimaryBtn onClick={submit}><Plus className="h-3.5 w-3.5"/> Create product</PrimaryBtn></>}
    >
      <FieldGrid>
        <Field label="SKU" hint="Unique product identifier (uppercase)."><Input value={sku} onChange={(e)=>setSku(e.target.value.toUpperCase())} placeholder="PG-WAX-22" className="font-mono" /></Field>
        <Field label="Category">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger><SelectValue/></SelectTrigger>
            <SelectContent>{CATEGORIES.map(c=> <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
      </FieldGrid>
      <Field label="Product name"><Input value={name} onChange={(e)=>setName(e.target.value)} placeholder="e.g. Progloss Polish Compound 250ml" /></Field>
      <FieldGrid>
        <Field label="Price (AED)"><Input type="number" min={0} step="0.01" value={price} onChange={(e)=>setPrice(e.target.value)} /></Field>
        <Field label="Initial stock"><Input type="number" min={0} value={stock} onChange={(e)=>setStock(e.target.value)} /></Field>
      </FieldGrid>
      <Field label="Description (optional)"><Textarea rows={3} value={desc} onChange={(e)=>setDesc(e.target.value)} placeholder="Short product description" /></Field>
    </FormDialog>
  );
}

