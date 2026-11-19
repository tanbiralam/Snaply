import type { Metadata } from "next";
import { toolMetadata, toolJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import QrCodeEditor from "./QrCodeEditor";

export const metadata: Metadata = toolMetadata("create", "qr-code");

export default function QrCodePage() {
  return (
    <>
      <JsonLd data={toolJsonLd("create", "qr-code")} />
      <QrCodeEditor />
    </>
  );
}
