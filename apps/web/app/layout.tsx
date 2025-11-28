import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "BandhuBol",
  description:
    "An empathetic, multilingual AI companionship and emotional guidance platform."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

