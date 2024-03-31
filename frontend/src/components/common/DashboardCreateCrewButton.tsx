"use client";
import { HomePreviewData } from "@/app/interfaces";
import { useState } from "react";
import CrewModal from "../CrewModal";

export default function DashboardCreateCrewButton({
  previewData,
}: {
  previewData: HomePreviewData;
}) {
  const [showCrewModal, setShowCrewModal] = useState(false);

  return (
    <>
      <button
        className={
          "rounded-md border-2 border-purple w-full sm:w-[350px] flex flex-row items-center px-4 justify-between h-[100px] bg-gray hover:bg-gray-dimmed transition-colors duration-300" +
          (!!previewData?.crew && " hidden sm:flex")
        }
        onClick={() => setShowCrewModal(true)}
      >
        <div className="flex flex-col gap-y-1">
          <span className="font-bold text-lg text-purple text-left">
            Create a Crew
          </span>
          <span className="text-md text-left">Invite your friends!</span>
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
      {showCrewModal && <CrewModal setShowCrewModal={setShowCrewModal} />}
    </>
  );
}
