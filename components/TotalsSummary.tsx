"use client";

import { DiscountType, InvoiceTotals } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { Field, Input, Select } from "./ui/primitives";

export function TotalsEditor({
  discountType,
  discountValue,
  shipping,
  onChange,
}: {
  discountType: DiscountType;
  discountValue: number;
  shipping: number;
  onChange: (patch: { discountType?: DiscountType; discountValue?: number; shipping?: number }) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <Field label="Discount type">
        <Select
          value={discountType}
          onChange={(e) => onChange({ discountType: e.target.value as DiscountType })}
        >
          <option value="flat">Flat amount ($)</option>
          <option value="percent">Percent (%)</option>
        </Select>
      </Field>
      <Field label="Discount value">
        <Input
          type="number"
          min={0}
          step="0.01"
          value={discountValue}
          onChange={(e) => onChange({ discountValue: parseFloat(e.target.value) || 0 })}
        />
      </Field>
      <Field label="Shipping / postage">
        <Input
          type="number"
          min={0}
          step="0.01"
          value={shipping}
          onChange={(e) => onChange({ shipping: parseFloat(e.target.value) || 0 })}
        />
      </Field>
    </div>
  );
}

export function TotalsSummary({ totals, amountPaid }: { totals: InvoiceTotals; amountPaid?: number }) {
  const rows: [string, number, boolean?][] = [
    ["Subtotal", totals.subtotal],
    ...(totals.discountAmount > 0 ? ([["Discount", -totals.discountAmount]] as [string, number][]) : []),
    ["Tax / GST", totals.taxTotal],
    ...(totals.shipping > 0 ? ([["Shipping", totals.shipping]] as [string, number][]) : []),
  ];

  return (
    <div className="space-y-1.5 text-sm">
      {rows.map(([label, value]) => (
        <div key={label} className="flex justify-between text-ink-600">
          <span>{label}</span>
          <span>{value < 0 ? `-${formatCurrency(Math.abs(value))}` : formatCurrency(value)}</span>
        </div>
      ))}
      <div className="flex justify-between border-t border-ink-200/60 pt-1.5 text-base font-semibold text-ink-900">
        <span>Total</span>
        <span>{formatCurrency(totals.total)}</span>
      </div>
      {amountPaid !== undefined && amountPaid > 0 && (
        <>
          <div className="flex justify-between text-ink-600">
            <span>Amount paid</span>
            <span>{formatCurrency(amountPaid)}</span>
          </div>
          <div className="flex justify-between font-semibold text-teal-700">
            <span>Balance due</span>
            <span>{formatCurrency(totals.balanceDue)}</span>
          </div>
        </>
      )}
    </div>
  );
}
