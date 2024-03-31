import { ReactNode } from "react";
import Navbar from "./Navbar";
import { NextIntlClientProvider, useMessages } from "next-intl";

export default function PageWrapper({ children }: { children: ReactNode }) {
  return (
    <NextIntlClientProvider messages={useMessages()}>
      <div className="flex flex-col min-h-screen text-white mb-8">
        <Navbar />
        <div className="flex-1 flex justify-center items-center w-full h-full">
          {children}
        </div>
      </div>
    </NextIntlClientProvider>
  );
}
