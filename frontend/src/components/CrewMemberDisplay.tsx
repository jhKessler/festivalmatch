import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { Member, FestivalSuggestionData } from "@/app/interfaces";
import { prepareBackendUrl } from "@/app/utils";
import { useTranslations } from "next-intl";

function CrewnameInputField({
  defaultValue,
  nCrewMembers,
  crewId,
  isMobile,
  isCreator,
}: {
  defaultValue: string;
  nCrewMembers: number;
  crewId: string;
  isMobile: boolean;
  isCreator: boolean;
}) {
  const t = useTranslations("Crew");
  const [inputValue, setInputValue] = useState(defaultValue);
  const [isEditing, setIsEditing] = useState(false);
  const [changesMade, setChangesMade] = useState(false);
  const { data: session } = useSession();
  // Function to handle input changes
  const handleChange = (event: any) => {
    if (
      event.target.value.length > 25 &&
      event.target.value.length > inputValue.length
    ) {
      return;
    }
    setInputValue(event.target.value);
    setChangesMade(true);
  };

  const inputWidth = Math.max(
    (inputValue.length + 2) * (isMobile ? 12 : 18),
    140
  );
  return (
    <div
      className={
        isMobile
          ? "w-[300px] flex flex-col sm:hidden"
          : "w-[500px] hidden sm:flex sm:flex-col"
      }
    >
      <div className="flex flex-row items-end">
        <input
          disabled={!isEditing || !isCreator}
          type="text"
          value={inputValue}
          onChange={handleChange}
          className={
            `bg-transparent ${
              isMobile ? "text-xl" : "text-3xl"
            } font-bold border-b-2 ` +
            (isEditing ? "border-purple" : "border-transparent")
          }
          style={{ width: `${inputWidth}px`, transition: "width 0.2s ease" }}
        />
        {isCreator && (
          <button
            disabled={isEditing && inputValue.length === 0}
            onClick={async () => {
              if (isEditing && changesMade) {
                const response = await fetch(
                  prepareBackendUrl("/api/crews/edit/"),
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      name: inputValue,
                      crew_id: crewId,
                      access_token: session?.access_token,
                    }),
                  }
                );
                setChangesMade(false);
                if (!response.ok) {
                  console.error("Failed to update crew name", response);
                  return;
                }
              }
              setIsEditing(!isEditing);
            }}
          >
            {isEditing ? (
              <svg
                className="fill-purple hover:fill-purple-dimmed ml-2"
                xmlns="http://www.w3.org/2000/svg"
                height="50"
                viewBox="0 0 24 24"
                width="50"
              >
                <path d="M0 0h24v24H0z" fill="none" />
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            ) : (
              <svg
                className="fill-purple ml-2 hover:fill-purple-dimmed"
                xmlns="http://www.w3.org/2000/svg"
                height="50"
                viewBox="0 0 24 24"
                width="50"
              >
                <path d="M0 0h24v24H0z" fill="none" />
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
              </svg>
            )}
          </button>
        )}
      </div>
      <div className="text-sm">
        {nCrewMembers === 1
          ? t("MemberSingular")
          : nCrewMembers + t("MemberPlural")}
      </div>
    </div>
  );
}

function MemberCard({
  member,
  selectedMember,
  setSelectedMember,
}: {
  member: Member;
  selectedMember: string;
  setSelectedMember: (userId: string) => void;
}) {
  const isSelected = selectedMember === member.id;
  return (
    <button
      className={
        "flex flex-row backdrop-blur-md bg-black/70 rounded-md items-center w-[330px] sm:w-[400px] h-[75px] hover:outline hover:outline-2 hover:outline-purple-dimmed " +
        (isSelected && "outline outline-2 outline-purple")
      }
      onClick={() => {
        setSelectedMember(member.id);
      }}
    >
      <div className="h-[75px] w-[75px] rounded-l-md overflow-hidden">
        <img
          src={member.picture_url}
          className="h-full w-full object-cover object-center"
        />
      </div>
      <div className="flex flex-col ml-2 text-left">
        <h1 className="text-lg font-bold">{member.name}</h1>
        <h2 className="text-xs sm:text-sm">{member.top_artists}</h2>
      </div>
    </button>
  );
}

export default function CrewMemberDisplay({
  suggestions,
  selectedMember,
  setSelectedMember,
  whoami,
}: {
  suggestions: FestivalSuggestionData;
  selectedMember: string;
  setSelectedMember: (member: string) => void;
  whoami: string;
}) {
  const t = useTranslations("Crew");

  const currentUser = suggestions.members.filter(
    (member) => member.id === whoami
  )[0].name;
  const isCreator = whoami === suggestions.creator;
  const inviteUrl = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/crews/join/${
    suggestions.id
  }?grp=${encodeURIComponent(suggestions.name)}&usr=${encodeURIComponent(
    currentUser
  )}`;
  const inviteText = `Hi! Join my crew on festivalmatch and let's find some festivals together! ${inviteUrl}`;
  const encodedMessage = encodeURIComponent(inviteText);
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex flex-col">
      <CrewnameInputField
        defaultValue={suggestions.name}
        nCrewMembers={suggestions.members.length}
        crewId={suggestions.id}
        isMobile={true}
        isCreator={isCreator}
      />
      <CrewnameInputField
        defaultValue={suggestions.name}
        nCrewMembers={suggestions.members.length}
        crewId={suggestions.id}
        isMobile={false}
        isCreator={isCreator}
      />
      <div className="flex flex-col mt-4 sm:mt-12 gap-4">
        {suggestions.members.map((member: Member) => {
          return (
            <AnimatePresence key={member.id}>
              <motion.div
                key={member.id}
                initial={{ opacity: 0, x: -50, backdropFilter: "blur(0px)" }}
                animate={{ opacity: 1, x: 0, backdropFilter: "blur(12px)" }}
                exit={{ opacity: 0, x: 50, backdropFilter: "blur(0px)" }}
                transition={{ duration: 0.5 }}
                className="w-[330px] sm:w-[400px] rounded-md"
              >
                <MemberCard
                  key={member.id}
                  member={member}
                  selectedMember={selectedMember}
                  setSelectedMember={setSelectedMember}
                />
              </motion.div>
            </AnimatePresence>
          );
        })}
      </div>
      <AnimatePresence>
        <motion.div
          key=""
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col mt-2 sm:mt-8">
            <div className="font-light text-lg">{t("InviteFriends")}</div>
            <div className="flex flex-row gap-2">
              <div className="flex flex-row mt-1">
                <a
                  className="w-[50px]"
                  href={`https://wa.me/?text=${encodedMessage}`}
                  target="_blank"
                >
                  <img src="/WhatsApp.svg" alt="Whatsapp icon" />
                </a>
              </div>
              <div className="flex flex-row mt-1">
                <a
                  className="w-[50px]"
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                    inviteUrl
                  )}`}
                  target="_blank"
                >
                  <img src="/Facebook.svg" alt="Facebook icon" />
                </a>
              </div>
              <div className="flex flex-row mt-1">
                <a
                  className="w-[50px]"
                  href={`https://t.me/share/url?url=${inviteUrl}&text=${encodedMessage}`}
                  target="_blank"
                >
                  <img src="/Telegram.svg" alt="Telegram icon" />
                </a>
              </div>
              <div className="flex flex-row mt-1">
                <button
                  className="w-[50px]"
                  title="Copy Link"
                  onClick={() => {
                    navigator.clipboard.writeText(inviteUrl);
                    setCopied(true);
                    setTimeout(() => {
                      setCopied(false);
                    }, 5000);
                  }}
                >
                  <svg
                    className="fill-white sm:hover:fill-purple transition-colors duration-300"
                    xmlns="http://www.w3.org/2000/svg"
                    height="50"
                    viewBox="0 0 24 24"
                    width="50"
                  >
                    <path d="M0 0h24v24H0z" fill="none" />
                    <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.5 }}
            className="absolute sm:fixed bottom-0 left-0 mb-4 ml-4 px-4 py-2 bg-black text-white rounded z-50"
          >
            Copied Link to Clipboard
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
