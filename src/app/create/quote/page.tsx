import type { Metadata } from "next";
import { getTool, toolPath } from "@/lib/registry/tools";
import QuoteEditor from "./QuoteEditor";

const tool = getTool("create", "quote");

export const metadata: Metadata = {
  title: tool?.name,
  description: tool?.description,
  alternates: { canonical: tool ? toolPath(tool) : undefined },
};

export default function QuotePage() {
  return <QuoteEditor />;
}
