import type { Metadata } from "next";
import { toolMetadata, toolJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import CompressEditor from "./CompressEditor";

export const metadata: Metadata = toolMetadata("optimize", "compress");

export default function CompressPage() {
  return (
    <>
      <JsonLd data={toolJsonLd("optimize", "compress")} />
      <CompressEditor />
    </>
  );
}
