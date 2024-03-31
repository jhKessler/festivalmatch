"use client";

import CrewModal from "@/components/CrewModal";
import HomePreviewCard from "@/components/HomePreviewCard";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { HomePreviewData } from "../interfaces";
import { prepareBackendUrl } from "../utils";
import { useTranslations } from "next-intl";

export default function UserDashboard() {
  const { data: session, status } = useSession();
  const [previewData, setPreviewData] = useState<HomePreviewData | null>(null);
  const [showCrewModal, setShowCrewModal] = useState<boolean>(false);
  const t = useTranslations("UserDashboard");

  useEffect(() => {
    const fetchPreviewData = async () => {
      const response = await fetch(
        prepareBackendUrl(
          "/api/home/",
          { access_token: session?.access_token },
          true
        ),
        {
          method: "GET",
        }
      );
      const data = await response.json();
      if (response.status !== 200) {
        return;
      }
      setPreviewData(data);
    };
    fetchPreviewData();
  }, [session, status]);

  if (status === "loading") {
    return <></>;
  }

  return (
    <>
      <div className="flex flex-col gap-y-6 w-full sm:w-auto items-center sm:items-start">
        <div className="w-[90%] sm:w-auto">
          <h1 className="font-bold text-xl sm:text-3xl">
            Hi, {session!.user?.name}!
          </h1>
          <p className="text-md sm:text-lg">{t("Greeting")}</p>
        </div>
        <HomePreviewCard
          label={
            <Link
              href="/suggestions"
              className="flex flex-row items-end ml-4 w-[260px]"
            >
              <svg
                className="fill-white"
                xmlns="http://www.w3.org/2000/svg"
                height="40"
                viewBox="0 0 24 24"
                width="40"
              >
                <path d="M0 0h24v24H0z" fill="none" />
                <path d="M10 20h4V4h-4v16zm-6 0h4v-8H4v8zM16 9v11h4V9h-4z" />
              </svg>
              <span className="font-bold text-2xl ml-2">{t("Individual")}</span>
            </Link>
          }
          items={
            <div className="flex flex-row justify-between px-4">
              {previewData?.individual.map((festival, index) => {
                return (
                  <div
                    key={index}
                    className={
                      "flex flex-row items-center" +
                      (index > 0 && " hidden sm:flex")
                    }
                  >
                    <div className="overflow-hidden w-[100px] rounded-md">
                      <img src={festival.img} alt="" />
                    </div>
                    <div className="flex flex-col ml-4">
                      <span className="font-bold text-md sm:text-lg text-purple">
                        {festival.name}
                      </span>
                      <span className="text-sm sm:text-md">
                        {festival.date}
                      </span>
                      <span className="text-sm sm:text-md">
                        {festival.location}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          }
          button={
            <div className="w-full px-4">
              <Link href="/suggestions">
                <div className="w-full bg-gray h-[40px] rounded-md hover:bg-gray-dimmed transition-colors duration-300 flex justify-center items-center">
                  <div className="text-light-gray">{t("ShowAll")}</div>
                </div>
              </Link>
            </div>
          }
        />
        <HomePreviewCard
          label={
            <Link
              href="/crews"
              className="flex flex-row items-end ml-4 w-[200px]"
            >
              <svg
                className="fill-white"
                xmlns="http://www.w3.org/2000/svg"
                height="40"
                viewBox="0 0 24 24"
                width="40"
              >
                <path d="M0 0h24v24H0z" fill="none" />
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
              </svg>{" "}
              <span className="font-bold text-2xl ml-2">{t("Crews")}</span>
            </Link>
          }
          items={
            <div className="sm:flex sm:flex-row sm:justify-between px-4 w-full sm:w-auto">
              {previewData?.crew && (
                <Link href={`/crews/${previewData.crew.id}`}>
                  <div className="flex flex-row gap-x-2 p-4 items-center justify-between rounded-md border-2 border-purple w-full sm:w-[350px] h-[100px] bg-gray hover:bg-gray-dimmed transition-colors duration-300">
                    <div className="flex flex-col gap-y-1">
                      <span className="font-bold text-lg text-purple">
                        {previewData.crew.name}
                      </span>
                      <span className="text-md">
                        {previewData.crew.member_pictures.length == 1
                          ? t("MemberSingular")
                          : `${previewData.crew.member_pictures.length} ${t(
                              "MemberPlural"
                            )}`}
                      </span>
                    </div>
                    {previewData.crew.member_pictures.map((picture, index) => {
                      return (
                        <div
                          key={index}
                          className="overflow-hidden w-[40px] h-[40px] rounded-full"
                        >
                          <img
                            src={picture}
                            alt=""
                            className="w-full h-full object-cover object-center"
                          />
                        </div>
                      );
                    })}
                  </div>
                </Link>
              )}
              <button
                className={
                  "rounded-md border-2 border-purple w-full sm:w-[350px] flex flex-row items-center px-4 justify-between h-[100px] bg-gray hover:bg-gray-dimmed transition-colors duration-300" +
                  (!!previewData?.crew && " hidden sm:flex")
                }
                onClick={() => setShowCrewModal(true)}
              >
                <div className="flex flex-col gap-y-1">
                  <span className="font-bold text-lg text-purple text-left">
                    {t("CreateCrew")}
                  </span>
                  <span className="text-md text-left">
                    {t("InviteFriends")}
                  </span>
                </div>
                <svg
                  className="fill-purple"
                  xmlns="http://www.w3.org/2000/svg"
                  height="80"
                  viewBox="0 0 24 24"
                  width="80"
                >
                  <path d="M0 0h24v24H0z" fill="none" />
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                </svg>
              </button>
            </div>
          }
          button={
            <div className="w-full px-4">
              <Link href="/crews">
                <div className="w-full bg-gray h-[40px] rounded-md hover:bg-gray-dimmed flex justify-center items-center transition-colors duration-300">
                  <div className="text-light-gray">{t("ShowAll")}</div>
                </div>
              </Link>
            </div>
          }
        />
        {showCrewModal && <CrewModal setShowCrewModal={setShowCrewModal} />}
      </div>
    </>
  );
}
