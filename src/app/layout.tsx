import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/features/auth/AuthContext";
import { QueryProvider } from "@/lib/query-provider";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "InternMatch — Discover Internships & Hackathons Tailored to You",
  description:
    "AI-powered internship and hackathon discovery platform. Upload your resume, get personalized match scores, and find the best opportunities for your skills.",
  keywords: [
    "internship",
    "hackathon",
    "discovery",
    "match",
    "resume",
    "skills",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
        >
          <QueryProvider>
            <AuthProvider>
              <TooltipProvider delayDuration={200}>
                <div className="relative min-h-screen bg-gradient-mesh">
                  {children}
                </div>
                <Toaster
                  theme="dark"
                  position="bottom-right"
                  toastOptions={{
                    style: {
                      background: "hsl(222 47% 8%)",
                      border: "1px solid hsl(217 33% 17%)",
                      color: "hsl(210 40% 98%)",
                    },
                  }}
                />
              </TooltipProvider>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
