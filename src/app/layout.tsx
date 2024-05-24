import "@/styles/globals.css";

import { Poppins } from "next/font/google";

import SelectRole from "@/components/SelectRole";
import { TRPCReactProvider } from "@/trpc/react";
import { api } from "@/trpc/server";
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
  const session = await api.auth.getSession();

  return (
    <html lang="en">
      <body className={`font-sans ${poppins.variable}`}>
        <TRPCReactProvider>
          <div className="flex min-h-screen flex-col ">
            <Nav
              isLoggedIn={session.user ? true : false}
              role={
                session.user?.user_metadata.role as
                  | "user"
                  | "testing_center"
                  | "admin"
              }
            />
            <div className="flex-1 flex flex-col">
              {session.user && !session.user.user_metadata.role ? (
                <SelectRole userId={session.user.id} />
              ) : (
                <div className="flex flex-1 flex-col">{children}</div>
              )}
            </div>

            <Footer />
          </div>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
