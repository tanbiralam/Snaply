import type { Metadata } from "next";
import { toolMetadata, toolJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import QuoteEditor from "./QuoteEditor";

export const metadata: Metadata = toolMetadata("create", "quote");

export default function QuotePage() {
  return (
    <>
      <JsonLd data={toolJsonLd("create", "quote")} />
      <QuoteEditor />
    </>
  );
}
