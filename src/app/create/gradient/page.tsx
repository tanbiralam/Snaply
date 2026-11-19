import type { Metadata } from "next";
import { toolMetadata, toolJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import GradientEditor from "./GradientEditor";

export const metadata: Metadata = toolMetadata("create", "gradient");

export default function GradientPage() {
  return (
    <>
      <JsonLd data={toolJsonLd("create", "gradient")} />
      <GradientEditor />
    </>
  );
}
