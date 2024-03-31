"use client";

import { useTranslations } from "next-intl";

export default function AppleSignInButton() {
  const t = useTranslations("SignupPage");
  return (
    <button
      className="flex flex-row items-center justify-center bg-pink-800 hover:bg-pink-1000 text-white rounded-md p-4 sm:py-1 
              transition-colors duration-300 
              text-2xl sm:text-sm w-[400px] h-[50px]"
      disabled={true}
    >
      <span className="mr-2 lg:text-sm">{t("SignInWApple")}</span>
    </button>
  );
}
