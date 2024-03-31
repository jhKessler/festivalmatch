"use client";

import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";

export default function SpotifySignInButton() {
  const t = useTranslations("SignupPage");
  return (
    <button
      className="flex flex-row items-center justify-center bg-spotify-green text-white rounded-md py-4 sm:py-1 
              hover:bg-spotify-green-dimmed transition-colors duration-300 
              text-2xl sm:text-sm h-[50px] w-[80%] sm:w-auto sm:px-4"
      onClick={() => signIn("spotify", { callbackUrl: "/" })}
    >
      <span className="lg:text-md">{t("SignInWSpotify")}</span>
    </button>
  );
}
