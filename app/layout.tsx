import type { Metadata } from "next";
import "./globals.css";
import "./visual-theme.css";
import { AppShell } from "@/components/app-shell";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: {
    default: "Campus DAO",
    template: "%s · Campus DAO",
  },
  description:
    "Transparent, verifiable college club governance on Ethereum Sepolia.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
