import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/app/TopBar";
import { Surface, SectionTitle } from "@/components/app/Surface";
import { KpiCard } from "@/components/app/KpiCard";
import { StatusChip } from "@/components/app/StatusChip";
import { Bell, Plus, Send } from "lucide-react";
import { useNotificationTemplates, useCustomers, queryKeys } from "@/lib/hooks/api";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { FormDialog, Field, FieldGrid, PrimaryBtn, SecondaryBtn } from "@/components/app/FormDialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api";

export const Route = createFileRoute("/_app/notifications/push")({ component: Page });

function Page() {
  const queryClient = useQueryClient();
  const { data: allTemplates = [] } = useNotificationTemplates();
  const { data: customers = [] } = useCustomers();
  const templates = allTemplates.filter(t => t.type === "push");

  const [open, setOpen] = useState(false);

  const totalSent24h = templates.reduce((sum, t) => sum + (t.sent24h || t.sent || 0), 0);
  const avgOpen = templates.length ? templates.reduce((sum, t) => sum + (t.open || 0), 0) / templates.length : 0;
  const subscribedDevices = customers.filter(c => c.status !== "cancelled").length * 2 || 14;

  return (
    <>
      <TopBar title="Push Notifications" subtitle="Mobile + web push · template library" actions={
        <PrimaryBtn onClick={() => setOpen(true)}><Plus className="h-3.5 w-3.5"/> New template</PrimaryBtn>
      }/>
      <div className="px-4 py-4 sm:px-6 sm:py-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <KpiCard label="Sent (24h)" value={String(totalSent24h)} icon={Send} accent="primary" />
          <KpiCard label="Open rate" value={`${avgOpen.toFixed(1)}%`} icon={Bell} accent="success" />
          <KpiCard label="Subscribed devices" value={String(subscribedDevices)} icon={Bell} accent="primary" />
          <KpiCard label="Templates" value={String(templates.length)} icon={Bell} accent="primary" />
        </div>
        <Surface padded={false}>
          <div className="px-5 py-4 border-b border-border"><SectionTitle title="Push templates" /></div>
          <div className="divide-y divide-border">
            {templates.map(t => (
              <div key={t.id} className="flex flex-col gap-2 px-5 py-3.5 md:flex-row md:items-center md:gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2"><span className="text-[13px] font-black">{t.name}</span><StatusChip tone={t.status==="active"?"success":"neutral"}>{t.status}</StatusChip></div>
                  <div className="mt-0.5 text-[11.5px] text-muted-foreground font-mono">{t.trigger}</div>
                  <div className="mt-1 text-[12px] text-foreground/80">{t.body ?? t.subject}</div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-[11.5px] md:w-44">
                  <div><div className="text-muted-foreground">Sent 24h</div><div className="font-bold tabular-nums">{t.sent24h ?? t.sent}</div></div>
                  <div><div className="text-muted-foreground">Open</div><div className="font-bold tabular-nums">{t.open}%</div></div>
                </div>
              </div>
            ))}
          </div>
        </Surface>
      </div>

      <CreatePushTemplateDialog
        open={open}
        onOpenChange={setOpen}
        onCreate={async (template) => {
          try {
            await api.createNotificationTemplate(template);
            void queryClient.invalidateQueries({ queryKey: queryKeys.notificationTemplates });
            toast.success("Push template created", { description: `${template.id} · ${template.name}` });
          } catch (e: any) {
            toast.error(e.message || "Failed to create push template");
          }
        }}
        exists={(id) => allTemplates.some(t => t.id === id)}
      />
    </>
  );
}

function CreatePushTemplateDialog({
  open,
  onOpenChange,
  onCreate,
  exists,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onCreate: (template: any) => Promise<void>;
  exists: (id: string) => boolean;
}) {
  const [idSuffix, setIdSuffix] = useState("");
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [trigger, setTrigger] = useState("manual");
  const [status, setStatus] = useState("active");

  const reset = () => {
    setIdSuffix("");
    setName("");
    setBody("");
    setTrigger("manual");
    setStatus("active");
  };

  const submit = async () => {
    const suffix = idSuffix.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "");
    if (!suffix) return toast.error("Template ID is required");
    const fullId = `PUSH-${suffix}`;
    if (exists(fullId)) return toast.error("A template with that ID already exists");
    if (!name.trim()) return toast.error("Template name is required");
    if (!body.trim()) return toast.error("Push message body is required");

    await onCreate({
      id: fullId,
      type: "push",
      name: name.trim(),
      body: body.trim(),
      trigger: trigger.trim(),
      status,
      sent: 0,
      sent24h: 0,
      open: 0,
      click: 0,
      delivered: 100,
    });
    reset();
    onOpenChange(false);
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) reset();
      }}
      title="Create Push Template"
      description="Create a new Push notification template for mobile or web devices."
      size="lg"
      footer={
        <>
          <SecondaryBtn onClick={() => { reset(); onOpenChange(false); }}>Cancel</SecondaryBtn>
          <PrimaryBtn onClick={submit}><Plus className="h-3.5 w-3.5"/> Create template</PrimaryBtn>
        </>
      }
    >
      <FieldGrid>
        <Field label="Template ID" hint="Unique ID. E.g. REMINDER -> PUSH-REMINDER">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground font-mono font-bold">PUSH-</span>
            <Input
              value={idSuffix}
              onChange={(e) => setIdSuffix(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ""))}
              placeholder="REMINDER"
              className="font-mono tracking-wider"
            />
          </div>
        </Field>
        <Field label="Template Name">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Renewal reminder alert" />
        </Field>
      </FieldGrid>

      <FieldGrid>
        <Field label="Event Trigger" hint="System event">
          <Input value={trigger} onChange={(e) => setTrigger(e.target.value)} placeholder="subscription.renewal" />
        </Field>
        <Field label="Status">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger><SelectValue/></SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </FieldGrid>

      <Field label="Push Notification Body">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Your plan renews in {{days}} days."
          className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </Field>
    </FormDialog>
  );
}

