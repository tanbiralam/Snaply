import type { Metadata } from "next";
import { getTool, toolPath } from "@/lib/registry/tools";
import ResizeEditor from "./ResizeEditor";

const tool = getTool("edit", "resize");

export const metadata: Metadata = {
  title: tool?.name,
  description: tool?.description,
  alternates: { canonical: tool ? toolPath(tool) : undefined },
};

export default function ResizePage() {
  return <ResizeEditor />;
}
