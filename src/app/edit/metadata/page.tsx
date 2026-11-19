import type { Metadata } from "next";
import { toolMetadata, toolJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import MetadataEditor from "./MetadataEditor";

export const metadata: Metadata = toolMetadata("edit", "metadata");

export default function MetadataPage() {
  return (
    <>
      <JsonLd data={toolJsonLd("edit", "metadata")} />
      <MetadataEditor />
    </>
  );
}
