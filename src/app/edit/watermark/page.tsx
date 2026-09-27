import type { Metadata } from "next";
import { getTool, toolPath } from "@/lib/registry/tools";
import WatermarkEditor from "./WatermarkEditor";

const tool = getTool("edit", "watermark");

export const metadata: Metadata = {
  title: tool?.name,
  description: tool?.description,
  alternates: { canonical: tool ? toolPath(tool) : undefined },
};

export default function WatermarkPage() {
  return <WatermarkEditor />;
}
