"use client";

import { Crew } from "@/app/interfaces";
import { prepareBackendUrl } from "@/app/utils";
import CrewModal from "@/components/CrewModal";
import { AnimatePresence, motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { AddCrewCard, CrewCard } from "@/components/CrewCards";
import { useTranslations } from "next-intl";

export default function Crews() {
  const { data: session, status: status } = useSession();
  const [crews, setCrews] = useState<Crew[]>([]);
  const [httpCode, setHttpCode] = useState<number | undefined>(undefined);
  const [showCrewModal, setShowCrewModal] = useState<boolean>(false);
  const [crewDeletedFlag, setCrewDeletedFlag] = useState<boolean>(false);
  const t = useTranslations("UserCrews");

  useEffect(() => {
    const fetchCrews = async () => {
      if (!session?.access_token) {
        return
      }
      const response = await fetch(
        prepareBackendUrl(
          "/api/preview/crews/",
          {},
          true
        ),
        {
          method: "GET",
          headers: {
            Authorization: session?.access_token,
          }
        }
      );
      setHttpCode(response.status);
      if (response.status === 200) {
        const data = await response.json();
        setCrews(data);
      }
    };
    if (session?.user_id && session?.access_token) {
      fetchCrews();
    }
  }, [status, session, crewDeletedFlag]);

  if (status === "loading" || !httpCode) {
    return <></>;
  }

  if (crews.length === 0) {
    // user has no crew yet
    return (
      <div className="flex flex-col w-[80%] items-center gap-4 animate-fadeIn">
        <h1 className="font-bold text-lg text-center">{t("Headline")}</h1>
        <p className="text-center">
          {t("SubHeadline1")}
          <br /> {t("SubHeadline2")}
        </p>
        <button
          className="flex flex-row bg-purple hover:bg-purple-dimmed transition-colors duration-300 rounded-md items-center p-2 justify-around w-40"
          onClick={() => setShowCrewModal(true)}
        >
          <span>{t("CreateCrew")}</span>
          <ChevronRightIcon />
        </button>
        {showCrewModal && <CrewModal setShowCrewModal={setShowCrewModal} />}
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2 w-full items-center">
      <AnimatePresence>
        <motion.div
          key={"add-crew-card-1"}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-bold text-lg text-center" key={"add-crew-card-1"}>
            {t("Headline")}
          </h1>
          <p className="text-center">
            {t("SubHeadline1")}
            <br /> {t("SubHeadline2")}
          </p>
        </motion.div>
      </AnimatePresence>
      <AnimatePresence>
        <motion.div
          key="add-crew-card"
          initial={{ opacity: 0, x: -50, backdropFilter: "blur(0px)" }}
          animate={{ opacity: 1, x: 0, backdropFilter: "blur(12px)" }}
          exit={{ opacity: 0, x: 50, backdropFilter: "blur(0px)" }}
          transition={{ duration: 0.5 }}
        >
          <AddCrewCard
            key="add-crew-card"
            openModal={() => {
              setShowCrewModal(true);
            }}
          />
        </motion.div>
        {crews.map((crew) => {
          return (
            <motion.div
              key={crew.id}
              initial={{ opacity: 0, x: -50, backdropFilter: "blur(0px)" }}
              animate={{ opacity: 1, x: 0, backdropFilter: "blur(12px)" }}
              exit={{ opacity: 0, x: 50, backdropFilter: "blur(0px)" }}
              transition={{ duration: 0.5 }}
            >
              {" "}
              <CrewCard
                key={crew.id}
                crew={crew}
                onDelete={async () => {
                  const response = await fetch(
                    prepareBackendUrl("/api/crew/delete/", {crew_id: crew.id}, true),
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: session?.access_token!
                      },
                      body: JSON.stringify({}),
                    }
                  );
                  setCrews(crews.filter((c) => c.id !== crew.id));
                  setCrewDeletedFlag(!crewDeletedFlag);
                }}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>

      {showCrewModal && <CrewModal setShowCrewModal={setShowCrewModal} />}
    </div>
  );
}
