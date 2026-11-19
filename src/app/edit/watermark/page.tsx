import type { Metadata } from "next";
import { toolMetadata, toolJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import WatermarkEditor from "./WatermarkEditor";

export const metadata: Metadata = toolMetadata("edit", "watermark");

export default function WatermarkPage() {
  return (
    <>
      <JsonLd data={toolJsonLd("edit", "watermark")} />
      <WatermarkEditor />
    </>
  );
}
