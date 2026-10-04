import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "True Oath | Australia",
  description: "A source-grounded ledger of political promises and what happened next.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
