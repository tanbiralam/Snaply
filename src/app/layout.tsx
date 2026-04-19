import type { Metadata } from 'next';
import '../index.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Snaply - Screenshot Beautifier - Transform Your Screenshots',
  description: 'Free online tool to beautify screenshots with gradients, shadows, and rounded corners. No login required.',
  authors: [{ name: 'Snaply' }],
  openGraph: {
    title: 'Snaply - Screenshot Beautifier - Transform Your Screenshots',
    description: 'Free online tool to beautify screenshots with gradients, shadows, and rounded corners. No login required.',
    type: 'website',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
