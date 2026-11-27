import type { Metadata, Viewport } from "next";
import { Geist, Newsreader } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import TabBar from "@/components/tabbar";
import { store } from "@/lib/store";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
const newsreader = Newsreader({ subsets: ["latin"], variable: "--font-newsreader", display: "swap" });

export const metadata: Metadata = {
  title: "Synesis",
  description: "Understanding, from bringing together.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Synesis" },
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f3" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [courses, cookieStore] = await Promise.all([store.listCourses(), cookies()]);
  // Black is the house look. Light stays available in Settings.
  const dark = cookieStore.get("theme")?.value !== "light";

  return (
    <html lang="en" className={`${geist.variable} ${newsreader.variable}${dark ? " dark" : ""}`}>
      <body>
        <div className="mx-auto min-h-dvh w-full max-w-[520px] px-5 pb-32">{children}</div>
        <TabBar courses={courses.map((c) => ({ id: c.id, name: c.name }))} />
      </body>
    </html>
  );
}
