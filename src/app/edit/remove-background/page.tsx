import type { Metadata } from "next";
import { toolMetadata, toolJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import RemoveBackgroundEditor from "./RemoveBackgroundEditor";

export const metadata: Metadata = toolMetadata("edit", "remove-background");

export default function RemoveBackgroundPage() {
  return (
    <>
      <JsonLd data={toolJsonLd("edit", "remove-background")} />
      <RemoveBackgroundEditor />
    </>
  );
}
