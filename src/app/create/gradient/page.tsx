import type { Metadata } from "next";
import { getTool, toolPath } from "@/lib/registry/tools";
import GradientEditor from "./GradientEditor";

const tool = getTool("create", "gradient");

export const metadata: Metadata = {
  title: tool?.name,
  description: tool?.description,
  alternates: { canonical: tool ? toolPath(tool) : undefined },
};

export default function GradientPage() {
  return <GradientEditor />;
}
