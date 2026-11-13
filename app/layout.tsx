import type { Metadata } from "next";
import { ThemeProvider } from "./components/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Weather Dashboard | City Weather",
  description:
    "Search current weather conditions by city, including temperature, humidity, and wind speed.",
  applicationName: "Weather Dashboard",
  openGraph: {
    title: "Weather Dashboard",
    description: "Current weather conditions by city.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
