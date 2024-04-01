"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { FestivalSuggestionData } from "@/app/interfaces";
import { prepareBackendUrl, prepareUrl } from "@/app/utils";
import CrewFestivalsDisplay from "@/components/CrewFestivalsDisplay";
import CrewMemberDisplay from "@/components/CrewMemberDisplay";

async function fetchCrewSuggestions(
  crewId: string,
  access_token: string,
  setSuggestions: (suggestions: FestivalSuggestionData) => void
) {
  const url = prepareBackendUrl(
    "/api/crew/",
    { crew_id: crewId },
    true
  );
  const response = await fetch(
    url,
    {
      headers: {
        Authorization: access_token
      }
    }
  );
  if (response.status !== 200) {
    console.error("Failed to fetch crew suggestions", response);
    return;
  }
  const data = await response.json();
  setSuggestions(data);
}

export default function Page() {
  const { crewId } = useParams<{ crewId: string }>();
  const { data: session, status } = useSession();
  const [suggestions, setSuggestions] = useState<FestivalSuggestionData | null>(
    null
  );
  const [selectedMember, setSelectedMember] = useState<string>();

  useEffect(() => {
    // WebSocket connection setup
    const ws = new WebSocket(
      prepareUrl(process.env.NEXT_PUBLIC_WS_URL!, "/api/crew/updates/", {
        crew_id: crewId,
        token: session?.access_token,
      })
    );

    ws.onmessage = (event) => {
      if (event.data === "update") {
        fetchCrewSuggestions(crewId, session?.access_token!, setSuggestions);
      }
    };
    // Cleanup function to close WebSocket connection
    return () => {
      ws.close();
    };
  }, [session, crewId]);

  useEffect(() => {
    if (session?.access_token) {
      fetchCrewSuggestions(crewId, session.access_token, setSuggestions);
    }
  }, [session]);

  useEffect(() => {
    setSelectedMember(suggestions?.members[0].id);
  }, [suggestions]);

  if (status === "loading" || !session || !suggestions) {
    return <></>;
  }

  return (
    <div className="flex flex-col mx-[10%] lg:flex-row mt-4 sm:mt-12 sm:relative sm:h-full">
      <div className="sm:sticky sm:top-0 sm:h-[100vh]">
        <CrewMemberDisplay
          suggestions={suggestions}
          selectedMember={selectedMember!}
          setSelectedMember={setSelectedMember}
          whoami={session.user_id!}
        />
      </div>
      <CrewFestivalsDisplay
        suggestions={suggestions!}
        selectedMember={selectedMember!}
      />
    </div>
  );
}
