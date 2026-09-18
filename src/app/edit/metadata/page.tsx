import type { Metadata } from "next";
import { getTool, toolPath } from "@/lib/registry/tools";
import MetadataEditor from "./MetadataEditor";

const tool = getTool("edit", "metadata");

export const metadata: Metadata = {
  title: tool?.name,
  description: tool?.description,
  alternates: { canonical: tool ? toolPath(tool) : undefined },
};

export default function MetadataPage() {
  return <MetadataEditor />;
}
