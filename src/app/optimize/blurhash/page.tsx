import type { Metadata } from "next";
import { getTool, toolPath } from "@/lib/registry/tools";
import BlurhashEditor from "./BlurhashEditor";

const tool = getTool("optimize", "blurhash");

export const metadata: Metadata = {
  title: tool?.name,
  description: tool?.description,
  alternates: { canonical: tool ? toolPath(tool) : undefined },
};

export default function BlurhashPage() {
  return <BlurhashEditor />;
}
