import type { Metadata } from "next";
import { toolMetadata, toolJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import OgImageEditor from "./OgImageEditor";

export const metadata: Metadata = toolMetadata("create", "og-image");

export default function OgImagePage() {
  return (
    <>
      <JsonLd data={toolJsonLd("create", "og-image")} />
      <OgImageEditor />
    </>
  );
}
