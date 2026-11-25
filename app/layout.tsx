import type { Metadata, Viewport } from "next";
import { Geist, Newsreader } from "next/font/google";
import "./globals.css";
import TabBar from "@/components/tabbar";
import { store } from "@/lib/store";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
const newsreader = Newsreader({ subsets: ["latin"], variable: "--font-newsreader", display: "swap" });

export const metadata: Metadata = {
  title: "Triage",
  description: "Study what the paper actually asks.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Triage" },
};

export const viewport: Viewport = {
  themeColor: "#faf8f3",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const courses = await store.listCourses();

  return (
    <html lang="en" className={`${geist.variable} ${newsreader.variable}`}>
      <body>
        <div className="mx-auto min-h-dvh w-full max-w-[520px] px-4 pb-28">{children}</div>
        <TabBar courses={courses.map((c) => ({ id: c.id, name: c.name }))} />
      </body>
    </html>
  );
}
