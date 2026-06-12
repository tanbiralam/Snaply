import {
  ArrowRightLeft,
  Code,
  Crop,
  Eraser,
  EyeOff,
  Image,
  LayoutTemplate,
  Minimize2,
  Quote,
  Stamp,
  type LucideIcon,
} from "lucide-react";

/* Resolves a registry entry's Lucide icon name to its component.
   Add an import here when a registry entry uses a new icon. */
const icons: Record<string, LucideIcon> = {
  ArrowRightLeft,
  Code,
  Crop,
  Eraser,
  EyeOff,
  Image,
  LayoutTemplate,
  Minimize2,
  Quote,
  Stamp,
};

export function ToolIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = icons[name];
  if (!Icon) return null;
  return <Icon className={className} strokeWidth={1.5} aria-hidden="true" />;
}
