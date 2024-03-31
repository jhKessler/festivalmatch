import { useTranslations } from "next-intl";

export default function Contact() {
  const t = useTranslations("Contact");
  return (
    <div className="flex flex-col justify-center items-center animate-fadeIn gap-y-4 w-full">
      <div className="text-lg">{t("Responsible")}</div>
      <img src="/contact.png" alt="" className="rounded-md w-[300px]" />
    </div>
  );
}
