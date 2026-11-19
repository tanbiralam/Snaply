import type { Metadata } from "next";
import { toolMetadata, toolJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import RedactEditor from "./RedactEditor";

export const metadata: Metadata = toolMetadata("edit", "redact");

export default function RedactPage() {
  return (
    <>
      <JsonLd data={toolJsonLd("edit", "redact")} />
      <RedactEditor />
    </>
  );
}
