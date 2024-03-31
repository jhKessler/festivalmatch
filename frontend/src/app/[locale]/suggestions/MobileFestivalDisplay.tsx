import { FestivalSuggestion } from "@/app/interfaces";
import { SmallFestivalCard } from "@/components/FestivalCards";

export default function MobileFestivalDisplay({
  suggestions,
}: {
  suggestions: FestivalSuggestion[];
}) {
  return (
    <div className="flex flex-col gap-10">
      {suggestions.map((suggestion: FestivalSuggestion, index: number) => {
        return <SmallFestivalCard suggestion={suggestion} key={index} />;
      })}
    </div>
  );
}
