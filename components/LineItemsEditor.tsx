"use client";

import { LineItem, ProductService } from "@/lib/types";
import { lineItemAmount } from "@/lib/calculations";
import { formatCurrency } from "@/lib/format";
import { newId } from "@/lib/format";
import { Plus, Trash2 } from "lucide-react";
import { Button, Input, Select } from "./ui/primitives";

export function LineItemsEditor({
  items,
  onChange,
  products,
}: {
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
  products: ProductService[];
}) {
  function update(id: string, patch: Partial<LineItem>) {
    onChange(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }

  function remove(id: string) {
    onChange(items.filter((i) => i.id !== id));
  }

  function add() {
    onChange([...items, { id: newId("li"), description: "", quantity: 1, unitPrice: 0, taxRate: 10 }]);
  }

  function applyProduct(id: string, productId: string) {
    const product = products.find((p) => p.id === productId);
    if (!product) {
      update(id, { productId: null });
      return;
    }
    update(id, {
      productId: product.id,
      description: product.name,
      unitPrice: product.unitPrice,
      taxRate: product.taxRate,
    });
  }

  return (
    <div>
      <div className="hidden grid-cols-[1fr_auto_auto_auto_auto_auto] gap-2 px-1 pb-2 text-xs font-medium text-ink-600/70 sm:grid">
        <span>Description</span>
        <span className="w-20 text-right">Qty</span>
        <span className="w-28 text-right">Unit price</span>
        <span className="w-20 text-right">Tax %</span>
        <span className="w-24 text-right">Amount</span>
        <span className="w-8" />
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-2 gap-2 rounded-lg border border-ink-200/60 p-2.5 sm:grid-cols-[1fr_auto_auto_auto_auto_auto] sm:items-center sm:border-0 sm:p-0"
          >
            <div className="col-span-2 sm:col-span-1">
              {products.length > 0 ? (
                <div className="space-y-1.5">
                  <Select
                    value={item.productId || ""}
                    onChange={(e) => applyProduct(item.id, e.target.value)}
                    className="text-xs"
                  >
                    <option value="">Custom line item…</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </Select>
                  <Input
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => update(item.id, { description: e.target.value })}
                  />
                </div>
              ) : (
                <Input
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => update(item.id, { description: e.target.value })}
                />
              )}
            </div>

            <div>
              <span className="mb-1 block text-xs text-ink-600/70 sm:hidden">Qty</span>
              <Input
                type="number"
                min={0}
                step="0.01"
                className="w-full text-right sm:w-20"
                value={item.quantity}
                onChange={(e) => update(item.id, { quantity: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div>
              <span className="mb-1 block text-xs text-ink-600/70 sm:hidden">Unit price</span>
              <Input
                type="number"
                min={0}
                step="0.01"
                className="w-full text-right sm:w-28"
                value={item.unitPrice}
                onChange={(e) => update(item.id, { unitPrice: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div>
              <span className="mb-1 block text-xs text-ink-600/70 sm:hidden">Tax %</span>
              <Input
                type="number"
                min={0}
                step="0.01"
                className="w-full text-right sm:w-20"
                value={item.taxRate}
                onChange={(e) => update(item.id, { taxRate: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="flex items-center justify-between sm:w-24 sm:justify-end">
              <span className="text-xs text-ink-600/70 sm:hidden">Amount</span>
              <span className="text-sm font-medium text-ink-900">{formatCurrency(lineItemAmount(item))}</span>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => remove(item.id)}
                aria-label="Remove line item"
                className="rounded-lg p-1.5 text-ink-400 hover:bg-coral-50 hover:text-coral-500"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Button type="button" variant="outline" size="sm" className="mt-3" icon={<Plus size={15} />} onClick={add}>
        Add line item
      </Button>
    </div>
  );
}
