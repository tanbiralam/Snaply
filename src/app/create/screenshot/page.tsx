import type { Metadata } from "next";
import { getTool, toolPath } from "@/lib/registry/tools";
import ScreenshotEditor from "./ScreenshotEditor";

const tool = getTool("create", "screenshot");

export const metadata: Metadata = {
  title: tool ? `${tool.name} — Snaply` : "Snaply",
  description: tool?.description,
  alternates: { canonical: tool ? toolPath(tool) : undefined },
};

export default function ScreenshotPage() {
  return <ScreenshotEditor />;
}
