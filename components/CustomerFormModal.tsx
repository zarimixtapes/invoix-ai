"use client";

import { FormEvent, useEffect, useState } from "react";
import { Customer } from "@/lib/types";
import { useStore } from "@/lib/store";
import { useToastStore } from "@/lib/toast-store";
import { Button, Field, Input, Modal, Textarea } from "./ui/primitives";

const EMPTY = {
  name: "",
  businessName: "",
  email: "",
  phone: "",
  address: "",
  abn: "",
  notes: "",
};

export function CustomerFormModal({
  open,
  onClose,
  customer,
}: {
  open: boolean;
  onClose: () => void;
  customer?: Customer | null;
}) {
  const addCustomer = useStore((s) => s.addCustomer);
  const updateCustomer = useStore((s) => s.updateCustomer);
  const push = useToastStore((s) => s.push);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setForm(
        customer
          ? {
              name: customer.name,
              businessName: customer.businessName || "",
              email: customer.email,
              phone: customer.phone || "",
              address: customer.address || "",
              abn: customer.abn || "",
              notes: customer.notes || "",
            }
          : EMPTY
      );
      setError("");
    }
  }, [open, customer]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Customer name is required.");
      return;
    }
    if (customer) {
      updateCustomer(customer.id, form);
      push("Customer updated.");
    } else {
      addCustomer(form);
      push("Customer added.");
    }
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={customer ? "Edit customer" : "Add customer"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="rounded-lg bg-coral-50 px-3 py-2 text-sm text-coral-600">{error}</p>}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Full name" required>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus />
          </Field>
          <Field label="Business name">
            <Input
              value={form.businessName}
              onChange={(e) => setForm({ ...form, businessName: e.target.value })}
            />
          </Field>
          <Field label="Email">
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </Field>
          <Field label="Phone">
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </Field>
          <Field label="ABN / business number" hint="Optional">
            <Input value={form.abn} onChange={(e) => setForm({ ...form, abn: e.target.value })} />
          </Field>
        </div>
        <Field label="Address">
          <Textarea
            rows={2}
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
        </Field>
        <Field label="Notes">
          <Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">{customer ? "Save changes" : "Add customer"}</Button>
        </div>
      </form>
    </Modal>
  );
}
