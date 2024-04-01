import { FestivalSuggestion, FestivalSuggestionData } from "@/app/interfaces";
import { prepareBackendUrl } from "@/app/utils";
import { getServerSession } from "next-auth/next";
import DesktopFestivalDisplay from "./DesktopFestivalDisplay";
import MobileFestivalDisplay from "./MobileFestivalDisplay";
import { getTranslations } from "next-intl/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

async function getSuggestions({
  accessToken,
}: {
  accessToken: string | undefined;
}): Promise<FestivalSuggestion[]> {
  if (!accessToken) {
    return []
  }
  const response = await fetch(
    prepareBackendUrl("/api/user/suggestions/", {}, true),
    {
      method: "GET",
      headers: {
        "Authorization": accessToken
      },
      cache: "no-store",
    }
  );
  return await response.json();
}

export default async function Suggestions({
  params,
}: {
  params: { locale: string };
}) {
  const session = await getServerSession(authOptions);
  const suggestions = await getSuggestions({
    accessToken: session?.access_token,
  });
  const t = await getTranslations("Suggestions");
  return (
    <div>
      <div className="lg:hidden flex flex-col items-center mb-4">
        <h2 className="text-xl mt-8 mb-6">
          {t("For")} {session?.username || "You"}
        </h2>
        <MobileFestivalDisplay suggestions={suggestions} />
      </div>
      <div className="hidden lg:flex flex-col items-center">
        <h2 className="text-xl mt-8 mb-6 text-white">
          {t("For")} {session?.username || "You"}
        </h2>
        <div>
          <DesktopFestivalDisplay suggestions={suggestions} />
        </div>
      </div>
    </div>
  );
}
