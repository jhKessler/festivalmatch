import AddIcon from "@mui/icons-material/Add";
import Link from "next/link";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import { useState } from "react";
import { Crew } from "@/app/interfaces";
import { useTranslations } from "next-intl";

export function AddCrewCard({ openModal }: { openModal: () => void }) {
  const t = useTranslations("UserCrews");
  return (
    <button
      className="flex flex-row backdrop-blur-md bg-black/70 rounded-md w-[300px] h-[50px] items-center hover:outline hover:outline-2 hover:outline-white justify-between px-4"
      onClick={openModal}
    >
      <AddIcon />
      <div className="">{t("CreateCrew")}</div>
      <div></div>
    </button>
  );
}

export function CrewCard({
  crew,
  onDelete,
}: {
  crew: Crew;
  onDelete: () => void;
}) {
  const [deleteButtonHovered, setDeleteButtonHovered] = useState(false);
  return (
    <Link
      className="flex flex-row backdrop-blur-md bg-black/70 rounded-md w-[300px] h-[50px] items-center justify-between px-4 hover:outline hover:outline-2 hover:outline-white"
      href={`/crews/${crew.id}`}
    >
      <div className="flex flex-row">
        {crew.profile_pictures.map((pictureUrl: string, index: number) => {
          return (
            <div
              className={
                "w-[30px] h-[30px] rounded-full overflow-hidden " +
                (index < crew.profile_pictures.length - 1 && "mr-[-16px]")
              }
            >
              <img
                src={pictureUrl}
                className="w-full h-full object-cover object-center"
              />
            </div>
          );
        })}
      </div>
      <div className="whitespace-nowrap text-xs">{crew.name}</div>
      <button
        className="h-[50px] w-[50px]"
        onMouseEnter={() => setDeleteButtonHovered(true)}
        onMouseLeave={() => setDeleteButtonHovered(false)}
        onClick={(e) => {
          e.preventDefault();
          onDelete();
        }}
      >
        <RemoveCircleOutlineIcon
          className={deleteButtonHovered ? "text-purple" : "text-white"}
        />
      </button>
    </Link>
  );
}
