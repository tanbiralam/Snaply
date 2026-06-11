import {
  Download,
  Loader2,
  CheckCircle2,
  FileImage,
  ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ExportButtonProps {
  onExport: (format: "png" | "jpeg" | "webp") => string | null;
  disabled?: boolean;
}

type ExportFormat = "png" | "jpeg" | "webp";

interface FormatOption {
  value: ExportFormat;
  label: string;
  description: string;
  extension: string;
}

const formatOptions: FormatOption[] = [
  {
    value: "png",
    label: "PNG",
    description: "Lossless, best quality",
    extension: "png",
  },
  {
    value: "jpeg",
    label: "JPEG",
    description: "Smaller file size",
    extension: "jpg",
  },
  {
    value: "webp",
    label: "WebP",
    description: "Modern, balanced",
    extension: "webp",
  },
];

export const ExportButton = ({ onExport, disabled }: ExportButtonProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("png");
  const [lastExported, setLastExported] = useState<ExportFormat | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleExport = async (format: ExportFormat) => {
    if (disabled) {
      toast.error("Please upload an image first", {
        description: "You need to upload a screenshot before downloading",
      });
      return;
    }

    setIsExporting(true);
    setDropdownOpen(false);

    // Yield one frame so the spinner paints before the synchronous canvas export.
    await new Promise((resolve) => setTimeout(resolve, 50));

    const dataUrl = onExport(format);
    if (!dataUrl) {
      toast.error("Failed to export image", {
        description: "Something went wrong while generating the image",
      });
      setIsExporting(false);
      return;
    }

    const link = document.createElement("a");
    const formatOption = formatOptions.find((f) => f.value === format);
    link.download = `snaply-${Date.now()}.${formatOption?.extension || "png"}`;
    link.href = dataUrl;
    link.click();

    setLastExported(format);
    setSelectedFormat(format);

    toast.success("Image downloaded successfully!", {
      description: `Saved as ${formatOption?.label} format`,
      icon: <CheckCircle2 className="w-4 h-4" />,
    });

    setIsExporting(false);

    setTimeout(() => setLastExported(null), 3000);
  };

  const selectedFormatOption = formatOptions.find(
    (f) => f.value === selectedFormat
  );

  return (
    <div className="flex gap-1.5">
      {/* Primary download button — matches landing CTA style */}
      <button
        type="button"
        onClick={() => handleExport(selectedFormat)}
        disabled={disabled || isExporting}
        className={cn(
          "inline-flex items-center gap-2 h-9 px-5 rounded-lg bg-foreground text-background text-sm font-medium",
          "hover:opacity-90 transition-opacity",
          "disabled:opacity-40 disabled:cursor-not-allowed"
        )}
      >
        {isExporting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Exporting...
          </>
        ) : lastExported === selectedFormat ? (
          <>
            <CheckCircle2 className="w-4 h-4" />
            Downloaded!
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            Download {selectedFormatOption?.label}
          </>
        )}
      </button>

      {/* Format picker dropdown */}
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            disabled={disabled || isExporting}
            className={cn(
              "inline-flex items-center justify-center h-9 w-9 rounded-lg border hairline",
              "text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors",
              dropdownOpen && "bg-secondary text-foreground",
              "disabled:opacity-40 disabled:cursor-not-allowed"
            )}
          >
            <ChevronDown
              className={cn(
                "w-4 h-4 transition-transform duration-200",
                dropdownOpen && "rotate-180"
              )}
            />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 font-sans" sideOffset={8}>
          <DropdownMenuLabel className="flex items-center gap-2 text-xs text-muted-foreground font-medium px-2 py-2">
            <FileImage className="w-3.5 h-3.5 shrink-0" />
            Export format
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {formatOptions.map((format) => (
            <DropdownMenuItem
              key={format.value}
              onClick={() => handleExport(format.value)}
              className={cn(
                "cursor-pointer flex items-center gap-3 px-2 py-2 rounded-md transition-colors duration-150",
                selectedFormat === format.value && "bg-secondary"
              )}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-tight">{format.label}</p>
                <p className="text-xs text-muted-foreground leading-tight mt-0.5">{format.description}</p>
              </div>
              {selectedFormat === format.value && (
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
