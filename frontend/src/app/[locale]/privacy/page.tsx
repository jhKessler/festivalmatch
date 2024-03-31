import { useTranslations } from "next-intl";
import Link from "next/link";

export default function Privacy() {
  const t = useTranslations("Privacy");
  return (
    <div className="flex flex-col justify-center items-center h-full animate-fadeIn">
      <h1 className="text-center text-3xl">Privacy Policy</h1>
      <div className="text-center text-xs lg:text-xl pt-12 px-4">
        <span className="py-1 block">{t("Introduction")} </span>
        <span className="py-1 block">{t("LoginRequest")}</span>
        <span className="py-1 block">{t("DataUsage")}</span>
        <span className="py-1 block">{t("DataStorage")}</span>
        <span className="py-1 block">{t("DataSharing")} </span>
        <span className="py-1 block">{t("CookiesPolicy")}</span>
        <span className="py-1 block">{t("PolicyAgreement")} </span>
        <span className="py-1 block">
          {t("SpotifyPermissionRemoval")}{" "}
          <a
            href="https://support.spotify.com/us/article/spotify-on-other-apps/"
            target="_blank"
            className="text-white font-bold hover:text-purple"
          >
            {t("SpotifyPermissionRemovalLink")}
          </a>
        </span>
        <span className="py-1 block">{t("UserRights")}</span>
        <span className="py-1 block">{t("ConsentWithdrawal")}</span>
      </div>
      <div className="text-xs lg:text-xl">
        {t("Contact")}{" "}
        <Link
          className="text-purple font-bold hover:text-purple-dimmed"
          href="/contact"
        >
          {t("ContactLink")}
        </Link>
        .
      </div>
    </div>
  );
}
