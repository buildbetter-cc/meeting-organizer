import type { Metadata } from "next";
import { Inter, Noto_Sans_Thai, Space_Grotesk } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});
const notoThai = Noto_Sans_Thai({
  variable: "--font-noto-thai",
  subsets: ["thai"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "BetterMeet",
  description: "Find a meeting time that works for everyone. Suggest times, share one link, see who can make it.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${notoThai.variable}`}>
        <SiteHeader />
        <main className="mx-auto w-full max-w-page px-6 py-16 md:px-8 md:py-24">{children}</main>
      </body>
    </html>
  );
}
