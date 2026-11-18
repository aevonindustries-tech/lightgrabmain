import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, PageTitle } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORY_LABEL, type Category } from "@/lib/order-status";
import { errMsg } from "@/lib/session";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { settingsQuery } from "@/lib/settings";

export const Route = createFileRoute("/_authenticated/requests/new")({
  head: () => ({ meta: [
    { title: "New shopping list — LightGrab" },
    { name: "description", content: "Send LightGrab your shopping list and delivery details for an itemised quote in Oron." },
    { property: "og:title", content: "New shopping list — LightGrab" },
    { property: "og:description", content: "Send your items and delivery details to request a LightGrab quote." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: NewRequest,
});

type ItemDraft = { name: string; quantity: string; unit: string; targetPrice: string; notes: string };
const emptyItem = (): ItemDraft => ({ name: "", quantity: "1", unit: "", targetPrice: "", notes: "" });
const categories: Category[] = ["market", "restaurant", "bakery", "factory", "other"];

function NewRequest() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const settings = useQuery(settingsQuery);
  const [category, setCategory] = useState<Category>("market");
  const [items, setItems] = useState<ItemDraft[]>([emptyItem()]);
  const [busy, setBusy] = useState(false);

  function updateItem(index: number, field: keyof ItemDraft, value: string) {
    setItems((current) => current.map((item, i) => i === index ? { ...item, [field]: value } : item));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const cleanedItems = items.map((item) => ({
      name: item.name.trim(),
      quantity: Number(item.quantity),
      unit: item.unit.trim(),
      target_price: item.targetPrice.trim() ? Number(item.targetPrice) : null,
      notes: item.notes.trim(),
    }));

    if (cleanedItems.some((item) => !item.name || !Number.isFinite(item.quantity) || item.quantity <= 0 || (item.target_price !== null && (!Number.isFinite(item.target_price) || item.target_price < 0)))) {
      toast.error("Check each item name, quantity and target price.");
      return;
    }
    if (cleanedItems.length > 60) {
      toast.error("A request can include up to 60 items.");
      return;
    }

    const delivery = {
      recipient_name: String(form.get("recipient_name") ?? "").trim(),
      recipient_phone: String(form.get("recipient_phone") ?? "").trim(),
      area: String(form.get("area") ?? "").trim(),
      address: String(form.get("address") ?? "").trim(),
      landmark: String(form.get("landmark") ?? "").trim(),
      instructions: String(form.get("instructions") ?? "").trim(),
      is_alternate: form.get("is_alternate") === "on",
    };
    if (!delivery.recipient_name || !delivery.recipient_phone || !delivery.area || !delivery.address) {
      toast.error("Add the recipient, phone number, area and delivery address.");
      return;
    }

    setBusy(true);
    const { data, error } = await supabase.rpc("create_order", {
      _category: category,
      _note: String(form.get("customer_note") ?? "").trim(),
      _window: String(form.get("preferred_window") ?? "").trim(),
      _delivery: delivery,
      _items: cleanedItems,
    });
    setBusy(false);
    if (error) {
      toast.error(errMsg(error));
      return;
    }

    await queryClient.invalidateQueries({ queryKey: ["my-orders"] });
    toast.success("Shopping request sent");
    navigate({ to: "/requests" });
    void data;
  }

  const accepting = settings.data?.accepting_requests === true;

  return (
    <AppShell portal="New request" nav={[{ to: "/requests", label: "My requests" }, { to: "/requests/new", label: "New request" }, { to: "/account", label: "Account" }]}>
      <PageTitle eyebrow="Customer · Oron" title="Write your shopping list" />
      {!settings.isLoading && !accepting && (
        <p role="status" className="mb-6 border-l-2 border-signal bg-muted/40 px-4 py-3 text-sm">LightGrab is not accepting requests yet. Your list can be prepared, but it cannot be submitted until requests open.</p>
      )}
      {settings.error && <p role="alert" className="mb-6 text-sm text-destructive">We couldn’t check whether requests are open. Please try again.</p>}
      <form onSubmit={submit} className="max-w-3xl space-y-10">
        <section className="rule-top pt-5">
          <h2 className="text-xl font-semibold">What do you need?</h2>
          <div className="mt-4 max-w-sm space-y-2">
            <Label>Request type</Label>
            <Select value={category} onValueChange={(value) => setCategory(value as Category)}>
              <SelectTrigger aria-label="Request type"><SelectValue /></SelectTrigger>
              <SelectContent>{categories.map((value) => <SelectItem key={value} value={value}>{CATEGORY_LABEL[value]}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="mt-6 space-y-5">
            {items.map((item, index) => (
              <fieldset key={index} className="ledger-row grid gap-3 py-5 md:grid-cols-[minmax(0,1fr)_8rem_9rem_auto]">
                <legend className="sr-only">Item {index + 1}</legend>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor={`item-${index}-name`}>Item {index + 1}</Label>
                  <Input id={`item-${index}-name`} value={item.name} onChange={(e) => updateItem(index, "name", e.target.value)} placeholder="e.g. Fresh tomatoes" maxLength={160} required />
                </div>
                <div className="grid grid-cols-2 gap-3 md:col-span-2 md:grid-cols-[8rem_9rem_auto]">
                  <div className="space-y-2"><Label htmlFor={`item-${index}-quantity`}>Quantity</Label><Input id={`item-${index}-quantity`} value={item.quantity} onChange={(e) => updateItem(index, "quantity", e.target.value)} type="number" min="0.01" step="any" required /></div>
                  <div className="space-y-2"><Label htmlFor={`item-${index}-unit`}>Unit</Label><Input id={`item-${index}-unit`} value={item.unit} onChange={(e) => updateItem(index, "unit", e.target.value)} placeholder="mudu, bunch" maxLength={40} /></div>
                  <div className="flex items-end"><Button type="button" variant="ghost" size="icon" aria-label={`Remove item ${index + 1}`} title="Remove item" disabled={items.length === 1} onClick={() => setItems((current) => current.filter((_, i) => i !== index))}><Trash2 aria-hidden="true" /></Button></div>
                </div>
                <div className="space-y-2 md:col-span-2"><Label htmlFor={`item-${index}-price`}>Target price (optional, ₦)</Label><Input id={`item-${index}-price`} value={item.targetPrice} onChange={(e) => updateItem(index, "targetPrice", e.target.value)} type="number" min="0" step="0.01" /></div>
                <div className="space-y-2 md:col-span-2"><Label htmlFor={`item-${index}-notes`}>Item note (optional)</Label><Input id={`item-${index}-notes`} value={item.notes} onChange={(e) => updateItem(index, "notes", e.target.value)} maxLength={240} placeholder="Size, ripeness or other detail" /></div>
              </fieldset>
            ))}
          </div>
          <Button type="button" variant="ink" className="mt-4" disabled={items.length >= 60} onClick={() => setItems((current) => [...current, emptyItem()])}><Plus aria-hidden="true" /> Add another item</Button>
          <div className="mt-6 max-w-xl space-y-2"><Label htmlFor="customer_note">Notes for the team (optional)</Label><Textarea id="customer_note" name="customer_note" maxLength={1000} placeholder="Anything else we should know about this request?" /></div>
        </section>

        <section className="rule-top pt-5">
          <h2 className="text-xl font-semibold">Where should we deliver?</h2>
          <p className="mt-2 text-sm text-muted-foreground">Your delivery details are shared only with the courier and authorised operations staff.</p>
          <label className="mt-4 flex items-center gap-2 text-sm"><input type="checkbox" name="is_alternate" className="size-4 accent-primary" /> This delivery is for someone else</label>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="recipient_name">Recipient name</Label><Input id="recipient_name" name="recipient_name" autoComplete="name" maxLength={120} required /></div>
            <div className="space-y-2"><Label htmlFor="recipient_phone">Recipient phone</Label><Input id="recipient_phone" name="recipient_phone" type="tel" autoComplete="tel" maxLength={30} required /></div>
            <div className="space-y-2"><Label htmlFor="area">Area in Oron</Label><Input id="area" name="area" maxLength={120} required /></div>
            <div className="space-y-2"><Label htmlFor="address">Delivery address</Label><Input id="address" name="address" autoComplete="street-address" maxLength={500} required /></div>
            <div className="space-y-2 sm:col-span-2"><Label htmlFor="landmark">Nearby landmark (optional)</Label><Input id="landmark" name="landmark" maxLength={240} /></div>
            <div className="space-y-2 sm:col-span-2"><Label htmlFor="instructions">Delivery instructions (optional)</Label><Textarea id="instructions" name="instructions" maxLength={1000} /></div>
            <div className="space-y-2 sm:col-span-2"><Label htmlFor="preferred_window">Preferred delivery time (optional)</Label><Input id="preferred_window" name="preferred_window" maxLength={120} placeholder="e.g. Afternoon" /></div>
          </div>
        </section>

        <div className="rule-top flex flex-wrap items-center justify-between gap-4 pt-5">
          <p className="max-w-lg text-sm text-muted-foreground">We’ll send an itemised quote before buying anything. Payment is on delivery.</p>
          <Button type="submit" variant="signal" disabled={busy || settings.isLoading || !accepting}>{busy ? "Sending request…" : "Submit shopping list"}</Button>
        </div>
      </form>
    </AppShell>
  );
}