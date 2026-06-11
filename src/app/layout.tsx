import type { Metadata } from "next";
import "../index.css";
import { Providers } from "./providers";

const siteUrl = "https://snaply.app";
const ogImage =
  "/images/86f576610d0cd0d6a2e2b54a08a391238ac75434-1200x630.webp";
const title = "Snaply — Turn flat screenshots into share-ready visuals";
const description =
  "Snaply turns flat screenshots into polished, share-ready images — gradients, device frames, shadows, and export. Free, no login, right in your browser.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  authors: [{ name: "Snaply" }],
  icons: { icon: "/favicon.ico" },
  alternates: { canonical: "/" },
  openGraph: {
    title,
    description,
    type: "website",
    url: "/",
    siteName: "Snaply",
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: "Snaply — Screenshot Stylizer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [ogImage],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
