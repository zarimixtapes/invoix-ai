"use client";

import { useParams } from "next/navigation";
import { QuoteEditor } from "@/components/QuoteEditor";

export default function QuoteDetailPage() {
  const params = useParams<{ id: string }>();
  return <QuoteEditor quoteId={params.id} />;
}
