"use client";

import { prepareBackendUrl } from "@/app/utils";
import CloseIcon from "@mui/icons-material/Close";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CrewModal({
  setShowCrewModal,
}: {
  setShowCrewModal: (value: boolean) => void;
}) {
  const [specifiedCrewName, setSpecifiedCrewName] = useState("");
  const [specifiedUsername, setSpecifiedUsername] = useState("");
  const { data: session } = useSession();
  const router = useRouter();
  const t = useTranslations("CreateCrew");

  useEffect(() => {
    setSpecifiedUsername(session?.user?.name || "");
  }, [session]);

  const buttonDisabled =
    specifiedUsername === "" ||
    specifiedCrewName === "" ||
    specifiedCrewName.length > 30 ||
    specifiedUsername.length > 30;
  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
      <div className="animate-fadeInBlurhalfs backdrop-blur-md bg-black rounded-md w-80 h-80 flex flex-col justify-between py-2 px-4">
        <CloseIcon
          className="absolute top-3 right-3 cursor-pointer text-white hover:text-purple text-3xl"
          onClick={() => setShowCrewModal(false)}
        />
        <div>
          <h1 className="font-bold text-lg">{t("h1")}</h1>
          <h2 className="text-xs pt-1">{t("h2")}</h2>
        </div>
        <div className="flex flex-col pb-4">
          <h2 className="text-xs mb-2">{t("h3")}</h2>
          <input
            className="rounded-md p-1 bg-gray mb-4 text-sm"
            placeholder={t("CrewName")}
            onChange={(e) => {
              setSpecifiedCrewName(e.target.value);
            }}
          />
          <h2 className="text-xs mb-2">{t("h4")}</h2>
          <input
            className="rounded-md p-1 bg-gray mb-4 text-sm"
            placeholder={t("YourName")}
            defaultValue={specifiedUsername}
            onChange={(e) => {
              setSpecifiedUsername(e.target.value);
            }}
          />
          <div className="flex flex-row justify-between">
            <button
              className="text-white hover:text-purple text-sm"
              onClick={() => setShowCrewModal(false)}
            >
              {t("Cancel")}
            </button>
            <button
              className={
                buttonDisabled
                  ? "text-gray rounded-md py-1 px-2"
                  : "bg-purple hover:bg-purple-dimmed rounded-md py-1 px-2 transition-colors duration-300"
              }
              disabled={buttonDisabled}
              onClick={async () => {
                setShowCrewModal(false);
                const response = await fetch(
                  prepareBackendUrl("/api/crews/", {}, true),
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      access_token: session?.access_token,
                      crew_name: specifiedCrewName,
                      specified_name: specifiedUsername,
                    }),
                  }
                );
                const body = await response.json();
                if (response.status === 200) {
                  router.push(`/crews/${body.id}`);
                } else {
                  router.push(`/error`);
                }
              }}
            >
              {t("Create")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
