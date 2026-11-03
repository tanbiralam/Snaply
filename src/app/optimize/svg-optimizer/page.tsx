import type { Metadata } from "next";
import { getTool, toolPath } from "@/lib/registry/tools";
import SvgOptimizerEditor from "./SvgOptimizerEditor";

const tool = getTool("optimize", "svg-optimizer");

export const metadata: Metadata = {
  title: tool?.name,
  description: tool?.description,
  alternates: { canonical: tool ? toolPath(tool) : undefined },
};

export default function SvgOptimizerPage() {
  return <SvgOptimizerEditor />;
}
