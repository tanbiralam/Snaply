import type { Metadata } from "next";
import { toolMetadata, toolJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import ResizeEditor from "./ResizeEditor";

export const metadata: Metadata = toolMetadata("edit", "resize");

export default function ResizePage() {
  return (
    <>
      <JsonLd data={toolJsonLd("edit", "resize")} />
      <ResizeEditor />
    </>
  );
}
