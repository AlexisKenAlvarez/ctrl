import "@/styles/globals.css";

import { Poppins } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";
import { createClient } from "supabase/supabaseServer";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

const poppins = Poppins({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "CTRL",
  description: "Cavite Testing Registered Lab",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`font-sans ${poppins.variable}`}>
        <TRPCReactProvider>
          <div className="flex min-h-screen flex-col ">
            <div className="flex flex-1 flex-col">{children}</div>
          </div>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
