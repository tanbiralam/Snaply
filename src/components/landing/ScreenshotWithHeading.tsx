import MockScreenshot from "./MockScreenshot";

/**
 * A wrapper component that renders a MockScreenshot with a heading above it.
 * This ensures proper sizing constraints and prevents the screenshot from taking full view.
 */
const ScreenshotWithHeading = ({
  title = "How does this look?",
  variant,
  framed = false,
}: {
  title?: string;
  variant?: "light" | "dark";
  framed?: boolean;
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-foreground">{title}</h3>
      <div className="w-full max-w-[78%] aspect-[16/10] rounded-xl overflow-hidden bg-white shadow-frame border border-black/5">
        <MockScreenshot variant={variant} framed={framed} />
      </div>
    </div>
  );
};

export default ScreenshotWithHeading;
