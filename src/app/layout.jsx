import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/theme-provider";
import { SidebarProvider } from "@/context/SidebarContext";
import { Toaster } from "@/components/ui/toaster";
import Footer from "@/components/mobilNavigation";
import Navbar from "@/components/Navbar";
import PwaInstallButton from "@/components/PwaInstallButton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Tasvirchi",
  description: "Barchaga o`z qizish rasimini ulashish uchun",
  icons: {
    icon: [
      { url: "/web-app-manifest-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "web-app-manifest-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  openGraph: {
    title: "Tasvirchi",
    description: "Tasvirchi haqida batafsil ma'lumot oling!",
    url: "https://tasvirchi.butcher4.uz",
    siteName: "Tasvirchi",
    images: [
      {
        url: "/banner.png", // 1200x630px rasm qo‘shing
        width: 1200,
        height: 630,
        alt: "Tasvirchi banner",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tasvirchi",
    description: "Tasvirchi haqida batafsil ma'lumot oling!",
    images: ["/banner.png"],
  },
  manifest: "/manifest.json",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider>
            <Navbar />
            <main className="flex-grow pt-[50px] pb-[60px]">{children}</main>
            <Footer />
            <Toaster richColors position="top-right" />
            {/* PwaInstallButton ni Navbar yoki Footer ga ko‘chirishni tavsiya qilaman */}
            <div className="p-4 fixed bottom-4 right-4">
              <PwaInstallButton />
            </div>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}