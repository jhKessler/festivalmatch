"use client";

import { useParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Crew } from "@/app/interfaces";
import { useRouter } from "next/navigation";
import { prepareBackendUrl } from "@/app/utils";
import { useTranslations } from "next-intl";

export default function JoinPromptPage() {
  const { crewId } = useParams<{ crewId: string }>();
  const { data: session, status } = useSession();
  const [userAlreadyMember, setUserAlreadyMember] = useState<boolean>(false);
  const crewName = useSearchParams().get("grp");
  const userName = useSearchParams().get("usr");
  const redirected = useSearchParams().get("redirected");
  const chosenSpecifiedName = useSearchParams().get("chosenSpecifiedName");
  const router = useRouter();
  const [specifiedName, setSpecifiedName] = useState("");
  const t = useTranslations("JoinCrew");
  useEffect(() => {
    if (!session) {
      return;
    }
    setSpecifiedName(session?.user?.name!);
    const fetchUserCrews = async () => {
      const response = await fetch(
        prepareBackendUrl(
          "/api/crews/all/",
          { access_token: session?.access_token },
          true
        )
      );
      if (response.status === 200) {
        const data = await response.json();
        data.forEach((crew: Crew) => {
          if (crew.id === crewId) {
            setUserAlreadyMember(true);
          }
        });
      }
    };
    fetchUserCrews();
  }, [session, status]);

  useEffect(() => {
    if (redirected !== "1" || !chosenSpecifiedName) {
      return;
    }
    const login = async () => {
      const response = await fetch(
        prepareBackendUrl("/api/crews/join/", {}, true),
        {
          method: "POST",
          body: JSON.stringify({
            crew_id: crewId,
            access_token: session?.access_token,
            specified_name: chosenSpecifiedName,
          }),
        }
      );
      if (response.status === 200 || true) {
        router.push(`/crews/${crewId}`);
      }
    };
    login();
  }, [session, status]);
  if (userAlreadyMember) {
    router.replace(`/crews/${crewId}`);
    return <></>;
  }

  return (
    <div className="flex flex-col gap-2 mx-4 sm:mx-0">
      <div className="font-bold text-2xl">{t("Headline")}</div>
      <div>
        {t("InvitedBy1")}{" "}
        <span className="text-purple font-bold">{userName}</span>{" "}
        {t("InvitedBy2")} "{crewName}" {t("InvitedBy3")}! <br />
        {t("InvitedBy4")}
      </div>
      <input
        type="text"
        value={session?.user?.name!}
        placeholder={t("YourName")}
        className={
          "backdrop-blur-md bg-black/70 rounded-md text-lg h-[40px] px-2"
        }
        onChange={(e) => setSpecifiedName(e.target.value)}
      />
      {session && (
        <button
          className="bg-purple p-2 rounded-md hover:bg-purple-dimmed transition-colors duration-300 text-white px-4"
          disabled={specifiedName === ""}
          onClick={async () => {
            const response = await fetch(
              prepareBackendUrl("/api/crews/join/", {}, true),
              {
                method: "POST",
                body: JSON.stringify({
                  crew_id: crewId,
                  access_token: session?.access_token,
                  specified_name: specifiedName,
                }),
              }
            );
            if (response.status === 200 || true) {
              router.push(`/crews/${crewId}`);
            } else {
            }
          }}
        >
          {t("Join")}
        </button>
      )}
      {!session && (
        <button
          className="bg-spotify-green p-2 rounded-md hover:bg-spotify-green/50 flex flex-row items-center justify-center text-white px-4"
          onClick={() =>
            signIn("spotify", {
              callbackUrl: `/crews/join/${encodeURIComponent(
                crewId
              )}?redirected=1&chosenSpecifiedName=${encodeURIComponent(
                specifiedName
              )}`,
            })
          }
        >
          <img src="/SpotifyWhite.png" className="w-[40px] mr-5" />
          {t("JoinSpotify")}
        </button>
      )}
    </div>
  );
}
