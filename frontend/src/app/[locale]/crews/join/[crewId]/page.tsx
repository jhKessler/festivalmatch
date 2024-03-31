import type { Metadata, ResolvingMetadata } from "next";
import JoinPromptPage from "./prompt";
import { getTranslations } from "next-intl/server";

type Props = {
  params: { crewId: string; locale: string };
  searchParams: {
    grp: string;
    usr: string;
    redirected: string;
    chosenSpecifiedName: string;
  };
};

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const t = await getTranslations("Metadata");
  return {
    title: t("CrewInviteTitle", { usr: searchParams.usr }),
    description: t("CrewInviteDescription", {
      usr: searchParams.usr,
      grp: searchParams.grp,
    }),
  };
}

export default function Page() {
  return <JoinPromptPage />;
}
