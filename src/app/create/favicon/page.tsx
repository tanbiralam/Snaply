import type { Metadata } from "next";
import { toolMetadata, toolJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import FaviconEditor from "./FaviconEditor";

export const metadata: Metadata = toolMetadata("create", "favicon");

export default function FaviconPage() {
  return (
    <>
      <JsonLd data={toolJsonLd("create", "favicon")} />
      <FaviconEditor />
    </>
  );
}
