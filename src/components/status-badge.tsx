import { cn } from "@/lib/utils";
import { STATUS_LABEL, type OrderStatus } from "@/lib/order-status";

const tone: Record<OrderStatus, string> = {
  submitted: "border-border text-foreground",
  quoted: "border-signal bg-signal/15 text-foreground",
  confirmed: "border-primary text-primary",
  sourcing: "border-primary bg-primary/10 text-primary",
  ready: "border-primary bg-primary text-primary-foreground",
  out_for_delivery: "border-signal bg-signal text-signal-foreground",
  delivered: "border-success text-success",
  cancelled: "border-border text-muted-foreground line-through",
  issue: "border-destructive bg-destructive/10 text-destructive",
};

export function StatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  return (
    <span className={cn("inline-flex items-center whitespace-nowrap rounded-sm border px-2 py-0.5 font-mono text-[11px] uppercase tracking-wider", tone[status], className)}>
      {STATUS_LABEL[status]}
    </span>
  );
}
