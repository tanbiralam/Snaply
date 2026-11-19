import type { Metadata } from "next";
import { toolMetadata, toolJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import ScreenshotEditor from "./ScreenshotEditor";

export const metadata: Metadata = toolMetadata("create", "screenshot");

export default function ScreenshotPage() {
  return (
    <>
      <JsonLd data={toolJsonLd("create", "screenshot")} />
      <ScreenshotEditor />
    </>
  );
}
