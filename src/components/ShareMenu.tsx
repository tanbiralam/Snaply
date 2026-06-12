import { useState, useCallback } from "react";
import { Share2, Check, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn, dataUrlToBlob, copyImageToClipboard } from "@/lib/utils";
import { site } from "@/lib/site";
import { XIcon, LinkedInIcon, InstagramIcon } from "@/lib/icons";


interface ShareTarget {
  id: "x" | "linkedin" | "instagram";
  label: string;
  icon: React.ReactNode;
  hoverColor: string;
  description: string;
  composeUrl: string;
}

const shareTargets: ShareTarget[] = [
  {
    id: "x",
    label: "Share on X",
    icon: <XIcon className="w-4 h-4" />,
    hoverColor: "hover:bg-foreground/10",
    description: "Post to X (Twitter)",
    composeUrl: "https://x.com/intent/post?text=",
  },
  {
    id: "linkedin",
    label: "Share on LinkedIn",
    icon: <LinkedInIcon className="w-4 h-4" />,
    hoverColor: "hover:bg-[hsl(210,80%,50%)]/10",
    description: "Share to LinkedIn feed",
    composeUrl: "https://www.linkedin.com/feed/?shareActive=true",
  },
  {
    id: "instagram",
    label: "Share on Instagram",
    icon: <InstagramIcon className="w-4 h-4" />,
    hoverColor: "hover:bg-[hsl(330,70%,55%)]/10",
    description: "Paste into Instagram",
    composeUrl: "https://www.instagram.com/",
  },
];


interface ShareMenuProps {
  onExport: (format: "png" | "jpeg" | "webp") => string | null;
  disabled?: boolean;
}

export const ShareMenu = ({ onExport, disabled }: ShareMenuProps) => {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const handleShare = useCallback(
    async (target: ShareTarget) => {
      if (disabled) {
        toast.error("Upload a screenshot first");
        return;
      }

      setBusy(target.id);
      // Yield one frame so the spinner paints before the synchronous canvas export.
      await new Promise((r) => setTimeout(r, 50));

      // Generate PNG export
      const dataUrl = onExport("png");
      if (!dataUrl) {
        toast.error("Failed to generate image");
        setBusy(null);
        return;
      }

      try {
        const blob = dataUrlToBlob(dataUrl);
        const copied = await copyImageToClipboard(blob);

        const url =
          target.id === "x"
            ? `${target.composeUrl}${encodeURIComponent(`Check out my styled screenshot, made with ${site.name} ✨`)}`
            : target.composeUrl;

        window.open(url, "_blank", "noopener,noreferrer");

        if (copied) {
          toast.success("Image copied — paste it into your post!", {
            description: `${target.label.replace("Share on ", "")} opened in a new tab`,
          });
        } else {
          toast.info("Couldn't copy image automatically", {
            description: "Save the image first, then upload it manually",
          });
        }

        setDone(target.id);
        setTimeout(() => setDone(null), 2500);
      } catch {
        toast.error("Something went wrong");
      } finally {
        setBusy(null);
        setOpen(false);
      }
    },
    [disabled, onExport]
  );

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "inline-flex items-center justify-center h-9 w-9 rounded-lg border hairline",
            "text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors",
            open && "bg-secondary text-foreground",
            "disabled:opacity-40 disabled:cursor-not-allowed"
          )}
          title="Share"
        >
          {done ? (
            <Check className="w-4 h-4 text-primary" />
          ) : (
            <Share2 className="w-4 h-4" />
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-60 font-sans" sideOffset={8}>
        <DropdownMenuLabel className="flex items-center gap-2 text-xs text-muted-foreground font-medium px-2 py-2">
          <Share2 className="w-3.5 h-3.5 shrink-0" />
          Share your creation
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {shareTargets.map((target) => (
          <DropdownMenuItem
            key={target.id}
            onClick={() => handleShare(target)}
            disabled={busy !== null}
            className={cn(
              "cursor-pointer flex items-center gap-3 px-2 py-2.5 rounded-md transition-colors duration-150",
              target.hoverColor
            )}
          >
            <span className="flex items-center justify-center w-7 h-7 rounded-md bg-secondary/80 shrink-0">
              {busy === target.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : done === target.id ? (
                <Check className="w-4 h-4 text-primary" />
              ) : (
                target.icon
              )}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium leading-tight">{target.label}</p>
              <p className="text-xs text-muted-foreground leading-tight mt-0.5">
                {target.description}
              </p>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
