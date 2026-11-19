import type { Metadata } from "next";
import { toolMetadata, toolJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import BlurhashEditor from "./BlurhashEditor";

export const metadata: Metadata = toolMetadata("optimize", "blurhash");

export default function BlurhashPage() {
  return (
    <>
      <JsonLd data={toolJsonLd("optimize", "blurhash")} />
      <BlurhashEditor />
    </>
  );
}
