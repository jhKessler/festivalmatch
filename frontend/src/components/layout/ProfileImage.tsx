"use client";
import { useSession, signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useState } from "react";

export default function ProfileImage() {
  const [isOpen, setIsOpen] = useState(false);
  const toggleDropdown = () => setIsOpen(!isOpen);
  const { data: session } = useSession();
  const t = useTranslations("Navbar");
  return (
    <div className={"relative p-2 rounded-md mr-2"}>
      <div className="w-[40px] h-[40px] rounded-full mr-2 cursor-pointer overflow-hidden">
        {/* Profile image */}
        {session?.user?.image ? (
          <img
            className="w-full h-full object-cover object-center"
            src={session.user.image}
            alt="Profile"
            onClick={toggleDropdown}
          />
        ) : (
          <div></div>
        )}
      </div>

      {/* Dropdown menu */}
      {isOpen && session && (
        <div className="hidden sm:block absolute right-0 mt-2 py-2 w-48 bg-black rounded-b-md rounded-md shadow-xl">
          <div className="text-center py-2 border-b mx-2 text-white">
            {t("Current")} <br />{" "}
            <span className="text-purple">{session?.user?.name}</span>
          </div>
          <button
            className="w-full text-left px-4 py-2 mt-2 text-sm text-white hover:bg-purple"
            onClick={() => {
              signOut({
                callbackUrl: `/`,
              });
            }}
          >
            {t("SignOut")}
          </button>
        </div>
      )}
    </div>
  );
}
