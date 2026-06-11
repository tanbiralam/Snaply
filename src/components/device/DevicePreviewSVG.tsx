import { DeviceMockup } from "@/types";

/**
 * Mini SVG thumbnail for each device type, used inside DeviceCard.
 * Active state changes stroke, fill, and bar-fill colours to primary purple.
 */
export const DevicePreviewSVG = ({
  device,
  active,
}: {
  device: DeviceMockup;
  active: boolean;
}) => {
  const stroke  = active ? "#6c5ce7" : "currentColor";
  const fill    = active ? "rgba(108,92,231,0.08)" : "transparent";
  const barFill = active ? "rgba(108,92,231,0.12)" : "rgba(0,0,0,0.04)";

  switch (device) {
    case "browser":
      return (
        <svg width="52" height="38" viewBox="0 0 52 38" fill="none">
          <rect x="1" y="1" width="50" height="36" rx="4" stroke={stroke} strokeWidth="1.2" fill={fill} />
          <rect x="1" y="1" width="50" height="10" rx="4" stroke={stroke} strokeWidth="1.2" fill={barFill} />
          <rect x="1" y="7" width="50" height="4" fill={barFill} />
          <circle cx="8"  cy="6" r="1.5" fill="#ff5f57" />
          <circle cx="13" cy="6" r="1.5" fill="#febc2e" />
          <circle cx="18" cy="6" r="1.5" fill="#28c840" />
          <rect x="22" y="3.5" width="22" height="5" rx="2.5" stroke={stroke} strokeWidth="0.8" fill="white" fillOpacity="0.5" />
          <rect x="5" y="16" width="42" height="3" rx="1" fill={stroke} fillOpacity="0.15" />
          <rect x="5" y="22" width="34" height="3" rx="1" fill={stroke} fillOpacity="0.10" />
          <rect x="5" y="28" width="38" height="3" rx="1" fill={stroke} fillOpacity="0.10" />
        </svg>
      );

    case "macos":
      return (
        <svg width="52" height="38" viewBox="0 0 52 38" fill="none">
          <rect x="1" y="1" width="50" height="36" rx="4" stroke={stroke} strokeWidth="1.2" fill={fill} />
          <rect x="1" y="1" width="50" height="9" rx="4" stroke={stroke} strokeWidth="1.2" fill={barFill} />
          <rect x="1" y="6" width="50" height="4" fill={barFill} />
          <circle cx="8"  cy="5.5" r="1.5" fill="#ff5f57" />
          <circle cx="13" cy="5.5" r="1.5" fill="#febc2e" />
          <circle cx="18" cy="5.5" r="1.5" fill="#28c840" />
          <rect x="5" y="15" width="42" height="3" rx="1" fill={stroke} fillOpacity="0.15" />
          <rect x="5" y="21" width="34" height="3" rx="1" fill={stroke} fillOpacity="0.10" />
          <rect x="5" y="27" width="38" height="3" rx="1" fill={stroke} fillOpacity="0.10" />
        </svg>
      );

    case "ipad":
      return (
        <svg width="52" height="38" viewBox="0 0 52 38" fill="none">
          <rect x="1" y="1" width="46" height="36" rx="4" stroke={stroke} strokeWidth="1.2" fill={fill} />
          <rect x="4" y="4" width="40" height="30" rx="2" fill={stroke} fillOpacity="0.06" />
          <circle cx="49.5" cy="19" r="2.5" stroke={stroke} strokeWidth="0.8" />
          <rect x="6" y="8"  width="36" height="2" rx="1" fill={stroke} fillOpacity="0.15" />
          <rect x="6" y="13" width="28" height="2" rx="1" fill={stroke} fillOpacity="0.10" />
          <rect x="6" y="18" width="32" height="2" rx="1" fill={stroke} fillOpacity="0.10" />
          <rect x="6" y="23" width="24" height="2" rx="1" fill={stroke} fillOpacity="0.10" />
        </svg>
      );

    case "iphone":
      return (
        <svg width="30" height="52" viewBox="0 0 30 52" fill="none">
          <rect x="1" y="1" width="28" height="50" rx="6" stroke={stroke} strokeWidth="1.2" fill={fill} />
          <rect x="10" y="2.5" width="10" height="4" rx="2" fill={stroke} fillOpacity="0.4" />
          <rect x="3"  y="10" width="24" height="30" rx="1" fill={stroke} fillOpacity="0.08" />
          <rect x="5"  y="13" width="18" height="2" rx="1" fill={stroke} fillOpacity="0.20" />
          <rect x="5"  y="17" width="14" height="2" rx="1" fill={stroke} fillOpacity="0.15" />
          <rect x="5"  y="21" width="16" height="2" rx="1" fill={stroke} fillOpacity="0.15" />
          <rect x="11" y="46" width="8"  height="3" rx="1.5" fill={stroke} fillOpacity="0.30" />
        </svg>
      );

    case "android":
      return (
        <svg width="30" height="52" viewBox="0 0 30 52" fill="none">
          <rect x="1" y="1" width="28" height="50" rx="4" stroke={stroke} strokeWidth="1.2" fill={fill} />
          <circle cx="15" cy="5" r="1.5" fill={stroke} fillOpacity="0.5" />
          <rect x="3" y="10" width="24" height="30" rx="1" fill={stroke} fillOpacity="0.08" />
          <rect x="5" y="13" width="18" height="2" rx="1" fill={stroke} fillOpacity="0.20" />
          <rect x="5" y="17" width="14" height="2" rx="1" fill={stroke} fillOpacity="0.15" />
          <rect x="5" y="21" width="16" height="2" rx="1" fill={stroke} fillOpacity="0.15" />
          <rect x="9"  y="44" width="4" height="4" rx="1"   fill={stroke} fillOpacity="0.20" />
          <circle cx="15" cy="46" r="2" stroke={stroke} strokeWidth="0.8" />
          <rect x="17" y="44" width="4" height="4" rx="1"   fill={stroke} fillOpacity="0.20" />
        </svg>
      );

    case "none":
    default:
      return (
        <svg width="52" height="38" viewBox="0 0 52 38" fill="none">
          <rect x="1" y="1" width="50" height="36" rx="4" stroke={stroke} strokeWidth="1.2" strokeDasharray="4 3" fill={fill} />
          <rect x="5" y="8"  width="42" height="22" rx="2" fill={stroke} fillOpacity="0.06" />
          <rect x="8" y="12" width="36" height="2.5" rx="1" fill={stroke} fillOpacity="0.20" />
          <rect x="8" y="17" width="28" height="2.5" rx="1" fill={stroke} fillOpacity="0.12" />
          <rect x="8" y="22" width="32" height="2.5" rx="1" fill={stroke} fillOpacity="0.12" />
        </svg>
      );
  }
};
