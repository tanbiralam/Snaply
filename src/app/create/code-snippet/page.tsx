import type { Metadata } from "next";
import { toolMetadata, toolJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import CodeSnippetEditor from "./CodeSnippetEditor";

export const metadata: Metadata = toolMetadata("create", "code-snippet");

export default function CodeSnippetPage() {
  return (
    <>
      <JsonLd data={toolJsonLd("create", "code-snippet")} />
      <CodeSnippetEditor />
    </>
  );
}
