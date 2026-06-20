"use client";

import { useMemo, useState } from "react";
import { Search, Plus, Pencil, Trash2, Users, Mail, Phone } from "lucide-react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { useToastStore } from "@/lib/toast-store";
import { Customer } from "@/lib/types";
import { Button, Card, ConfirmDialog, EmptyState, Input } from "@/components/ui/primitives";
import { CustomerFormModal } from "@/components/CustomerFormModal";
import { initials } from "@/lib/format";

export default function CustomersPage() {
  const customers = useStore((s) => s.customers);
  const invoices = useStore((s) => s.invoices);
  const deleteCustomer = useStore((s) => s.deleteCustomer);
  const push = useToastStore((s) => s.push);

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return customers.filter(
      (c) =>
        !q ||
        c.name.toLowerCase().includes(q) ||
        (c.businessName || "").toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
    );
  }, [customers, search]);

  function invoiceCount(customerId: string) {
    return invoices.filter((i) => i.customerId === customerId).length;
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold text-ink-900">Customers</h1>
        <Button
          icon={<Plus size={15} />}
          onClick={() => {
            setEditing(null);
            setShowModal(true);
          }}
        >
          Add customer
        </Button>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
        <Input placeholder="Search customers…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Users size={28} />}
          title={customers.length === 0 ? "No customers yet" : "No customers match your search"}
          description="Add a customer to start creating invoices and quotes for them."
          action={
            <Button size="sm" onClick={() => { setEditing(null); setShowModal(true); }}>
              Add customer
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <Card key={c.id} className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 text-sm font-semibold text-teal-700">
                    {initials(c.businessName || c.name)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink-900">{c.businessName || c.name}</p>
                    {c.businessName && <p className="text-xs text-ink-500">{c.name}</p>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => { setEditing(c); setShowModal(true); }}
                    className="rounded-lg p-1.5 text-ink-400 hover:bg-paper-200 hover:text-ink-900"
                    title="Edit"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteId(c.id)}
                    className="rounded-lg p-1.5 text-ink-400 hover:bg-coral-50 hover:text-coral-500"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="mt-4 space-y-1.5 text-sm text-ink-600">
                {c.email && (
                  <p className="flex items-center gap-1.5">
                    <Mail size={13} /> {c.email}
                  </p>
                )}
                {c.phone && (
                  <p className="flex items-center gap-1.5">
                    <Phone size={13} /> {c.phone}
                  </p>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-ink-100 pt-3">
                <span className="text-xs text-ink-500">{invoiceCount(c.id)} invoice(s)</span>
                <Link
                  href={`/invoices/new`}
                  className="text-xs font-medium text-teal-700 hover:underline"
                >
                  New invoice
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      <CustomerFormModal open={showModal} onClose={() => setShowModal(false)} customer={editing} />

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete this customer?"
        description="Existing invoices and quotes for this customer will keep their saved details, but you won't be able to select them for new ones."
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) {
            deleteCustomer(deleteId);
            push("Customer deleted.");
          }
          setDeleteId(null);
        }}
      />
    </div>
  );
}
