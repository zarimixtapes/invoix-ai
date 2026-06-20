"use client";

import { useMemo, useState } from "react";
import { Search, Plus, Pencil, Trash2, Package } from "lucide-react";
import { useStore } from "@/lib/store";
import { useToastStore } from "@/lib/toast-store";
import { ProductService } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { Button, ConfirmDialog, EmptyState, Input } from "@/components/ui/primitives";
import { ProductFormModal } from "@/components/ProductFormModal";

export default function ProductsPage() {
  const products = useStore((s) => s.products);
  const deleteProduct = useStore((s) => s.deleteProduct);
  const push = useToastStore((s) => s.push);

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ProductService | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter((p) => !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  }, [products, search]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold text-ink-900">Products &amp; Services</h1>
        <Button icon={<Plus size={15} />} onClick={() => { setEditing(null); setShowModal(true); }}>
          Add item
        </Button>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
        <Input placeholder="Search products & services…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Package size={28} />}
          title={products.length === 0 ? "No products or services yet" : "Nothing matches your search"}
          description="Save your price list once and reuse it on every invoice and quote."
          action={
            <Button size="sm" onClick={() => { setEditing(null); setShowModal(true); }}>
              Add item
            </Button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl2 border border-ink-200/60 bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-ink-200/60 text-xs uppercase tracking-wide text-ink-500">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 text-right font-medium">Unit price</th>
                <th className="px-5 py-3 text-right font-medium">Tax rate</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-ink-100 last:border-0 hover:bg-paper-50">
                  <td className="px-5 py-3">
                    <p className="font-medium text-ink-900">{p.name}</p>
                    {p.description && <p className="text-xs text-ink-500">{p.description}</p>}
                  </td>
                  <td className="px-5 py-3 text-ink-600">{p.category}</td>
                  <td className="px-5 py-3 text-right text-ink-900">{formatCurrency(p.unitPrice)}</td>
                  <td className="px-5 py-3 text-right text-ink-600">{p.taxRate}%</td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => { setEditing(p); setShowModal(true); }}
                        className="rounded-lg p-1.5 text-ink-400 hover:bg-paper-200 hover:text-ink-900"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteId(p.id)}
                        className="rounded-lg p-1.5 text-ink-400 hover:bg-coral-50 hover:text-coral-500"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ProductFormModal open={showModal} onClose={() => setShowModal(false)} product={editing} />

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete this item?"
        description="This won't affect invoices or quotes that already use it."
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) {
            deleteProduct(deleteId);
            push("Product deleted.");
          }
          setDeleteId(null);
        }}
      />
    </div>
  );
}
