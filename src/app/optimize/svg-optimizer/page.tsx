import type { Metadata } from "next";
import { toolMetadata, toolJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import SvgOptimizerEditor from "./SvgOptimizerEditor";

export const metadata: Metadata = toolMetadata("optimize", "svg-optimizer");

export default function SvgOptimizerPage() {
  return (
    <>
      <JsonLd data={toolJsonLd("optimize", "svg-optimizer")} />
      <SvgOptimizerEditor />
    </>
  );
}
