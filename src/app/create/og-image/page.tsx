import type { Metadata } from "next";
import { getTool, toolPath } from "@/lib/registry/tools";
import OgImageEditor from "./OgImageEditor";

const tool = getTool("create", "og-image");

export const metadata: Metadata = {
  title: tool?.name,
  description: tool?.description,
  alternates: { canonical: tool ? toolPath(tool) : undefined },
};

export default function OgImagePage() {
  return <OgImageEditor />;
}
