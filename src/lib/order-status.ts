import type { Database } from "@/integrations/supabase/types";

export type OrderStatus = Database["public"]["Enums"]["order_status"];
export type Category = Database["public"]["Enums"]["business_category"];
export type AppRole = Database["public"]["Enums"]["app_role"];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  submitted: "Submitted",
  quoted: "Quote ready",
  confirmed: "Confirmed",
  sourcing: "Sourcing",
  ready: "Ready for pickup",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  issue: "Needs attention",
};

export const STATUS_HELP: Record<OrderStatus, string> = {
  submitted: "Operations is reviewing your list and pricing it with market partners.",
  quoted: "Your quote is ready. Accept it to start buying, or decline.",
  confirmed: "Confirmed. A runner will begin buying your items shortly.",
  sourcing: "A runner is buying and preparing your items in the market.",
  ready: "Items are packed and waiting for the courier.",
  out_for_delivery: "Your courier is on the way. Share your delivery code only on arrival.",
  delivered: "Delivered and confirmed with your delivery code.",
  cancelled: "This request was cancelled.",
  issue: "Something needs attention. Operations will contact you.",
};

/** Main path shown to customers as a progress line. */
export const PROGRESS: OrderStatus[] = ["submitted", "quoted", "confirmed", "sourcing", "ready", "out_for_delivery", "delivered"];

/** Mirrors public.order_transition_allowed in the database (the database is authoritative). */
export const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  submitted: ["quoted", "cancelled", "issue"],
  quoted: ["confirmed", "cancelled", "submitted", "issue"],
  confirmed: ["sourcing", "cancelled", "issue"],
  sourcing: ["ready", "issue", "cancelled"],
  ready: ["out_for_delivery", "issue"],
  out_for_delivery: ["delivered", "issue"],
  delivered: [],
  cancelled: [],
  issue: ["submitted", "confirmed", "sourcing", "ready", "out_for_delivery", "cancelled"],
};

export function canTransition(from: OrderStatus, to: OrderStatus) {
  return TRANSITIONS[from].includes(to);
}

export const CUSTOMER_CANCELLABLE: OrderStatus[] = ["submitted", "quoted"];
export const isClosed = (s: OrderStatus) => s === "delivered" || s === "cancelled";

/** Status changes each role may request (the database enforces the same rules). */
export function allowedFor(role: "operations" | "runner" | "courier", from: OrderStatus): OrderStatus[] {
  if (role === "runner") {
    if (from === "confirmed") return ["sourcing", "issue"];
    if (from === "sourcing") return ["ready", "issue"];
    return [];
  }
  if (role === "courier") {
    if (from === "ready") return ["out_for_delivery", "issue"];
    if (from === "out_for_delivery") return ["delivered", "issue"];
    return [];
  }
  // operations: cannot quote via transition, cannot accept for customer, cannot mark delivered
  return TRANSITIONS[from].filter((t) => t !== "quoted" && t !== "delivered" && !(t === "confirmed" && from !== "issue"));
}

export const CATEGORY_LABEL: Record<Category, string> = {
  market: "Market goods",
  restaurant: "Restaurant",
  bakery: "Bakery",
  factory: "Factory & wholesale",
  other: "Other local business",
};

export const ROLE_LABEL: Record<AppRole, string> = {
  customer: "Customer",
  seller: "Seller",
  runner: "Runner",
  courier: "Courier",
  operations: "Operations",
  admin: "Admin",
  super_admin: "Super Admin",
};

export function quoteTotal(o: { items_subtotal: number | null; service_fee: number | null; delivery_fee: number | null }) {
  if (o.items_subtotal == null) return null;
  return Number(o.items_subtotal) + Number(o.service_fee ?? 0) + Number(o.delivery_fee ?? 0);
}

export function naira(n: number | null | undefined) {
  if (n == null) return "—";
  return "₦" + Number(n).toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}
