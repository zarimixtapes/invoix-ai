"use client";

import { ChangeEvent, useRef, useState } from "react";
import { Lock, Upload, Palette } from "lucide-react";
import { useStore } from "@/lib/store";
import { useToastStore } from "@/lib/toast-store";
import { Button, Card, Field, Input } from "@/components/ui/primitives";
import { DocumentPreview } from "@/components/DocumentPreview";
import { DEMO_INVOICES } from "@/lib/demo-data";

const COLORS = ["#0F9D87", "#D97706", "#D6543F", "#2563EB", "#7C3AED", "#11172A"];

export default function TemplatesPage() {
  const business = useStore((s) => s.business);
  const updateBusiness = useStore((s) => s.updateBusiness);
  const canUseBranding = useStore((s) => s.canUseBranding);
  const push = useToastStore((s) => s.push);
  const fileRef = useRef<HTMLInputElement>(null);
  const [logoError, setLogoError] = useState("");

  const brandingLocked = !canUseBranding();

  function handleLogoUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      setLogoError("Logo must be under 1MB.");
      return;
    }
    setLogoError("");
    const reader = new FileReader();
    reader.onload = () => {
      updateBusiness({ logoDataUrl: reader.result as string });
      push("Logo updated.");
    };
    reader.readAsDataURL(file);
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink-900">Templates &amp; Branding</h1>
      <p className="mt-1 text-sm text-ink-600">
        This appears on every invoice and quote you send. Logo and brand colour are Pro features.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <div className="space-y-5 lg:col-span-3">
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-ink-900">Business details</h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <Field label="Business name">
                <Input value={business.name} onChange={(e) => updateBusiness({ name: e.target.value })} />
              </Field>
              <Field label="ABN / business number">
                <Input value={business.abn} onChange={(e) => updateBusiness({ abn: e.target.value })} />
              </Field>
              <Field label="Email">
                <Input value={business.email} onChange={(e) => updateBusiness({ email: e.target.value })} />
              </Field>
              <Field label="Phone">
                <Input value={business.phone} onChange={(e) => updateBusiness({ phone: e.target.value })} />
              </Field>
            </div>
            <Field label="Address" >
              <Input className="mt-3" value={business.address} onChange={(e) => updateBusiness({ address: e.target.value })} />
            </Field>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-ink-900">Logo</h2>
              {brandingLocked && (
                <span className="flex items-center gap-1 text-xs font-medium text-amber-600">
                  <Lock size={12} /> Pro feature
                </span>
              )}
            </div>
            <div className="mt-3 flex items-center gap-4">
              {business.logoDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={business.logoDataUrl} alt="Logo" className="h-14 w-14 rounded-lg border border-ink-200 object-contain" />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-dashed border-ink-200 text-ink-400">
                  <Upload size={18} />
                </div>
              )}
              <div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={brandingLocked} />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={brandingLocked}
                  onClick={() => fileRef.current?.click()}
                >
                  Upload logo
                </Button>
                {logoError && <p className="mt-1 text-xs text-coral-600">{logoError}</p>}
                {brandingLocked && (
                  <p className="mt-1 text-xs text-ink-500">
                    <a href="/billing" className="text-teal-700 underline">Upgrade to Pro</a> to add a custom logo.
                  </p>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-1.5 text-sm font-semibold text-ink-900">
                <Palette size={15} /> Brand colour
              </h2>
              {brandingLocked && (
                <span className="flex items-center gap-1 text-xs font-medium text-amber-600">
                  <Lock size={12} /> Pro feature
                </span>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  disabled={brandingLocked}
                  onClick={() => updateBusiness({ brandColor: c })}
                  className={`h-8 w-8 rounded-full border-2 disabled:opacity-40 ${
                    business.brandColor === c ? "border-ink-900" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Use colour ${c}`}
                />
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-sm font-semibold text-ink-900">Invoice defaults</h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-3">
              <Field label="Invoice prefix">
                <Input value={business.invoicePrefix} onChange={(e) => updateBusiness({ invoicePrefix: e.target.value.toUpperCase() })} />
              </Field>
              <Field label="Default tax rate (%)">
                <Input
                  type="number"
                  value={business.defaultTaxRate}
                  onChange={(e) => updateBusiness({ defaultTaxRate: parseFloat(e.target.value) || 0 })}
                />
              </Field>
            </div>
            <Field label="Default payment terms">
              <Input className="mt-3" value={business.defaultPaymentTerms} onChange={(e) => updateBusiness({ defaultPaymentTerms: e.target.value })} />
            </Field>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <h2 className="mb-2 text-sm font-semibold text-ink-900">Live preview</h2>
          <div className="origin-top scale-[0.8] rounded-xl2 border border-ink-200/60 bg-paper-50 p-3">
            <DocumentPreview kind="invoice" doc={DEMO_INVOICES[0]} business={business} />
          </div>
        </div>
      </div>
    </div>
  );
}
