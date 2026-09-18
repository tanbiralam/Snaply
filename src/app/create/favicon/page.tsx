import type { Metadata } from "next";
import { getTool, toolPath } from "@/lib/registry/tools";
import FaviconEditor from "./FaviconEditor";

const tool = getTool("create", "favicon");

export const metadata: Metadata = {
  title: tool?.name,
  description: tool?.description,
  alternates: { canonical: tool ? toolPath(tool) : undefined },
};

export default function FaviconPage() {
  return <FaviconEditor />;
}
