export type DeviceMockup =
  | "none"
  | "browser"
  | "macos"
  | "iphone"
  | "android"
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
  { value: "android", label: "Android" },
  { value: "ipad", label: "iPad" },
];
