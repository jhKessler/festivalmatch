"use client";

import Dropdown from "./Dropdown";
import ProfileImage from "./ProfileImage";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

export default function Navbar() {
  const { status: status } = useSession();
  const pathname = usePathname();
  const t = useTranslations("Navbar");

  return (
    <div className="w-full h-16 sm:h-12 flex flex-row justify-evenly items-center opacity-100 sm:justify-between sm:pt-4 z-50">
      <Dropdown />
      <Link className="flex justify-center sm:pl-4" href="/">
        <span className="font-extrabold text-white text-2xl">
          festivalmatch
        </span>
        <span className="font-extrabold text-purple text-2xl">.app</span>
      </Link>
      <div className="sm:hidden absolute right-0">
        <ProfileImage />
      </div>
      <div className="hidden sm:flex w-50 flex-row items-center mt">
        <Link
          href="/"
          className={`hover:text-purple transition-colors duration-300 mx-6 text-white text-opacity-70 ${
            pathname === "/" && "underline"
          }`}
        >
          {t("Home")}
        </Link>
        {status === "authenticated" && (
          <Link
            href="/suggestions"
            className={`transition-colors duration-300 hover:text-purple mx-6 text-white text-opacity-70 ${
              pathname === "/suggestions" && "underline"
            }`}
          >
            {t("Festivals")}
          </Link>
        )}
        {status === "authenticated" && (
          <Link
            href="/crews"
            className={` transition-colors duration-300 hover:text-purple mx-6 text-white text-opacity-70 ${
              pathname.startsWith("/crews") && "underline"
            }`}
          >
            {t("Crews")}
          </Link>
        )}
        <Link
          href="/privacy"
          className={`transition-colors duration-300 hover:text-purple mx-6 text-white text-opacity-70 ${
            pathname === "/privacy" && "underline"
          }`}
        >
          {t("Privacy")}
        </Link>
        <Link
          href="/contact"
          className={`transition-colors duration-300 hover:text-purple mx-6 text-white text-opacity-70 ${
            pathname === "/contact" && "underline"
          }`}
        >
          {t("Contact")}
        </Link>
        <div className="hidden sm:block">
          <ProfileImage />
        </div>
      </div>
    </div>
  );
}
