import type { Metadata } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Display: Fraunces with its SOFT axis up. Still a serif, so it reads calm and trustworthy for a
// privacy product, but the rounded terminals echo the duck and the speech-bubble mark.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz", "SOFT", "WONK"],
});

// Body: invisible and readable.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Numbers and codes are the product, so they get a precise mono with tabular figures.
const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Quackr: Get the code. Keep your number.",
  description:
    "Disposable phone numbers for SMS verification in 30+ countries. Codes arrive in seconds, and your real number stays private.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} ${jetbrains.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
