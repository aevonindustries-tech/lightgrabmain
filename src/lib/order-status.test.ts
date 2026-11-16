import { describe, expect, it } from "vitest";
import { allowedFor, canTransition, quoteTotal, CUSTOMER_CANCELLABLE } from "./order-status";

describe("order lifecycle", () => {
  it("allows submitted → quoted but not submitted → delivered", () => {
    expect(canTransition("submitted", "quoted")).toBe(true);
    expect(canTransition("submitted", "delivered")).toBe(false);
  });
  it("delivered and cancelled are terminal", () => {
    expect(canTransition("delivered", "issue")).toBe(false);
    expect(canTransition("cancelled", "submitted")).toBe(false);
  });
  it("customers can only cancel before confirmation", () => {
    expect(CUSTOMER_CANCELLABLE).toEqual(["submitted", "quoted"]);
  });
});

describe("role boundaries", () => {
  it("runner cannot dispatch or deliver", () => {
    expect(allowedFor("runner", "ready")).toEqual([]);
    expect(allowedFor("runner", "sourcing")).toEqual(["ready", "issue"]);
  });
  it("courier only acts from ready onward", () => {
    expect(allowedFor("courier", "sourcing")).toEqual([]);
    expect(allowedFor("courier", "out_for_delivery")).toContain("delivered");
  });
  it("operations cannot accept a quote for the customer or mark delivered", () => {
    expect(allowedFor("operations", "quoted")).not.toContain("confirmed");
    expect(allowedFor("operations", "out_for_delivery")).not.toContain("delivered");
  });
});

describe("quote total", () => {
  it("sums subtotal, service and delivery fees", () => {
    expect(quoteTotal({ items_subtotal: 12000, service_fee: 500, delivery_fee: 1500 })).toBe(14000);
  });
  it("is null until quoted", () => {
    expect(quoteTotal({ items_subtotal: null, service_fee: null, delivery_fee: null })).toBeNull();
  });
});
