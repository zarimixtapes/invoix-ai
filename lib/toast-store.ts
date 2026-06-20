"use client";

import { create } from "zustand";
import { ToastMessage } from "./types";
import { newId } from "./format";

interface ToastState {
  toasts: ToastMessage[];
  push: (message: string, tone?: ToastMessage["tone"]) => void;
  dismiss: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (message, tone = "success") => {
    const toast: ToastMessage = { id: newId("toast"), message, tone };
    set((s) => ({ toasts: [...s.toasts, toast] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== toast.id) }));
    }, 3500);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
