export type DeviceMockup =
  | "none"
  | "browser"
  | "macos"
  | "iphone"
  | "iphone-landscape"
  | "android"
  | "android-landscape"
  | "ipad";

export interface DeviceMockupOption {
  value: DeviceMockup;
  label: string;
}

export const deviceMockupOptions: DeviceMockupOption[] = [
  { value: "none", label: "None" },
  { value: "browser", label: "Browser" },
  { value: "macos", label: "macOS" },
  { value: "iphone", label: "iPhone" },
  { value: "iphone-landscape", label: "iPhone (landscape)" },
  { value: "android", label: "Android" },
  { value: "android-landscape", label: "Android (landscape)" },
  { value: "ipad", label: "iPad" },
];
