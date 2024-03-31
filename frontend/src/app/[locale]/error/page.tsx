import { useTranslations } from "next-intl";
import Link from "next/link";

export default function ErrorPage() {
  const t = useTranslations("ErrorPage");
  return (
    <div className="flex flex-col justify-center items-center min-h-screen animate-fadeIn">
      <h1 className="text-3xl font-bold">{t("Title")}</h1>
      <p className="text-xl">{t("Message")}</p>
      <Link href="/" className="bg-purple rounded-md p-3 mt-2">
        {t("Button")}
      </Link>
    </div>
  );
}
