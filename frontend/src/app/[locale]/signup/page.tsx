import SpotifySignInButton from "@/components/common/SpotifySignInButton";
import { getTranslations } from "next-intl/server";

export default async function SignupPage() {
  const t = await getTranslations("SignupPage");
  return (
    <div className="flex flex-col items-center gap-y-2">
      <div className="font-bold text-xl">{t("Headline")}</div>
      <div className="text-md">{t("SubHeadline")}</div>
      <SpotifySignInButton />
    </div>
  );
}
