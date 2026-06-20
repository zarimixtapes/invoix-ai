"use client";

import { FormEvent, useEffect, useState } from "react";
import { ProductCategory, ProductService } from "@/lib/types";
import { useStore } from "@/lib/store";
import { useToastStore } from "@/lib/toast-store";
import { Button, Field, Input, Modal, Select, Textarea } from "./ui/primitives";

const CATEGORIES: ProductCategory[] = ["Labour", "Parts", "Materials", "Service", "Product", "Other"];

const EMPTY = {
  name: "",
  description: "",
  unitPrice: 0,
  taxRate: 10,
  category: "Service" as ProductCategory,
};

export function ProductFormModal({
  open,
  onClose,
  product,
}: {
  open: boolean;
  onClose: () => void;
  product?: ProductService | null;
}) {
  const addProduct = useStore((s) => s.addProduct);
  const updateProduct = useStore((s) => s.updateProduct);
  const push = useToastStore((s) => s.push);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setForm(
        product
          ? {
              name: product.name,
              description: product.description || "",
              unitPrice: product.unitPrice,
              taxRate: product.taxRate,
              category: product.category,
            }
          : EMPTY
      );
      setError("");
    }
  }, [open, product]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }
    if (product) {
      updateProduct(product.id, form);
      push("Product updated.");
    } else {
      addProduct(form);
      push("Product added.");
    }
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={product ? "Edit product / service" : "Add product / service"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="rounded-lg bg-coral-50 px-3 py-2 text-sm text-coral-600">{error}</p>}
        <Field label="Name" required>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus />
        </Field>
        <Field label="Description">
          <Textarea
            rows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </Field>
        <div className="grid grid-cols-3 gap-4">
          <Field label="Unit price">
            <Input
              type="number"
              min={0}
              step="0.01"
              value={form.unitPrice}
              onChange={(e) => setForm({ ...form, unitPrice: parseFloat(e.target.value) || 0 })}
            />
          </Field>
          <Field label="Tax rate (%)">
            <Input
              type="number"
              min={0}
              step="0.01"
              value={form.taxRate}
              onChange={(e) => setForm({ ...form, taxRate: parseFloat(e.target.value) || 0 })}
            />
          </Field>
          <Field label="Category">
            <Select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as ProductCategory })}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">{product ? "Save changes" : "Add product"}</Button>
        </div>
      </form>
    </Modal>
  );
}
