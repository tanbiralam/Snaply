import type { Metadata } from "next";
import { getTool, toolPath } from "@/lib/registry/tools";
import CodeSnippetEditor from "./CodeSnippetEditor";

const tool = getTool("create", "code-snippet");

export const metadata: Metadata = {
  title: tool?.name,
  description: tool?.description,
  alternates: { canonical: tool ? toolPath(tool) : undefined },
};

export default function CodeSnippetPage() {
  return <CodeSnippetEditor />;
}
