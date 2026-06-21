import type { Metadata } from "next";
import { getTool, toolPath } from "@/lib/registry/tools";
import RedactEditor from "./RedactEditor";

const tool = getTool("edit", "redact");

export const metadata: Metadata = {
  title: tool?.name,
  description: tool?.description,
  alternates: { canonical: tool ? toolPath(tool) : undefined },
};

export default function RedactPage() {
  return <RedactEditor />;
}
