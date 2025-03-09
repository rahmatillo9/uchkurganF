import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/theme-provider";
import { SidebarProvider } from "@/context/SidebarContext";
import { Toaster } from "@/components/ui/toaster";
import Footer from "@/components/mobilNavigation";
import Navbar from "@/components/Navbar";
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
    icon: '/Logo.webp'
  }
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
            <Navbar/>
            <main className="flex-grow pt-[50px] pb-[60px]">{children}</main>
            <Footer/>
            <Toaster richColors position="top-right" />
          </SidebarProvider>
            
        </ThemeProvider>
      </body>
    </html>
  );
}

