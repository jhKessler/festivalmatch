import { Inter } from "next/font/google";
import "./globals.css";
import SessionProviderWrapper from "@/components/layout/SessionProviderWrapper";
import Image from "next/image";
import PageWrapper from "@/components/layout/PageWrapper";
import { getTranslations } from "next-intl/server";
import { GoogleAnalytics } from "@next/third-parties/google";

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return {
    title: t("Title"),
    description: t("Description"),
  };
}

export default function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return (
    <SessionProviderWrapper>
      <html>
        <body className={inter.className}>
          <div className="w-full fixed h-full -z-10">
            <Image
              src="/background_img.avif"
              layout="fill"
              objectFit="cover"
              quality={100}
              alt=""
              priority={true}
            />
          </div>
          <PageWrapper>{children}</PageWrapper>
        </body>
        <GoogleAnalytics gaId="G-6CKFP06KM8" />
      </html>
    </SessionProviderWrapper>
  );
}
