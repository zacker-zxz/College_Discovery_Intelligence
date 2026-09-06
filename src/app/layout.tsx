import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FloatingChatBot } from "@/components/chat/FloatingChatBot";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

export const metadata: Metadata = {
  title: "CampusLens — Production College Discovery & Decision Intelligence",
  description:
    "A data-driven platform that helps students discover, compare, and evaluate colleges based on academics, fees, placements, location, and entrance cutoffs.",
  openGraph: {
    title: "CampusLens — College Discovery & Decision Intelligence",
    description:
      "Explore verified higher education data, compare institutions side-by-side, and predict admission chances.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)] font-sans antialiased relative selection:bg-blue-600 selection:text-white">
        <ThemeProvider>
          <Navbar />
          <main className="flex-1 relative">{children}</main>
          <Footer />
          <FloatingChatBot />
        </ThemeProvider>
      </body>
    </html>
  );
}

