import type { Metadata } from "next";
import { getTool, toolPath } from "@/lib/registry/tools";
import QrCodeEditor from "./QrCodeEditor";

const tool = getTool("create", "qr-code");

export const metadata: Metadata = {
  title: tool?.name,
  description: tool?.description,
  alternates: { canonical: tool ? toolPath(tool) : undefined },
};

export default function QrCodePage() {
  return <QrCodeEditor />;
}
