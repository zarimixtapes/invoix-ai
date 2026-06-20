"use client";

import { useParams } from "next/navigation";
import { InvoiceEditor } from "@/components/InvoiceEditor";

export default function InvoiceDetailPage() {
  const params = useParams<{ id: string }>();
  return <InvoiceEditor invoiceId={params.id} />;
}
