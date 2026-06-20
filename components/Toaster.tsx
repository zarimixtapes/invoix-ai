"use client";

import { useToastStore } from "@/lib/toast-store";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

const ICONS = {
  success: <CheckCircle2 size={18} className="text-teal-600" />,
  error: <XCircle size={18} className="text-coral-500" />,
  info: <Info size={18} className="text-blue-600" />,
};

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  if (!toasts.length) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2 sm:bottom-6 sm:right-6">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex items-start gap-2.5 rounded-xl border border-ink-200/60 bg-white px-4 py-3 shadow-pop"
        >
          {ICONS[t.tone]}
          <p className="flex-1 text-sm text-ink-800">{t.message}</p>
          <button
            onClick={() => dismiss(t.id)}
            className="text-ink-400 hover:text-ink-700"
            aria-label="Dismiss"
          >
            <X size={15} />
          </button>
        </div>
      ))}
    </div>
  );
}
