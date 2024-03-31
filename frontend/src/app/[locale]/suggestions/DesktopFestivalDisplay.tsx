import { FestivalSuggestion } from "@/app/interfaces";
import {
  LargeFestivalCard,
  SmallFestivalCard,
} from "@/components/FestivalCards";

export default function DesktopFestivalDisplay({
  suggestions,
}: {
  suggestions: FestivalSuggestion[];
}) {
  return (
    <div className="flex justify-center items-center">
      <div className="grid grid-cols-2 2xl:grid-cols-3 gap-[30px] ml-[30px]">
        <div className="col-span-1 row-span-2">
          <LargeFestivalCard suggestion={suggestions[0]} />
        </div>
        {suggestions
          .slice(1, suggestions.length)
          .map((suggestion: FestivalSuggestion, index: number) => {
            return (
              <div className="col-span-1 row-span-1" key={index}>
                <SmallFestivalCard suggestion={suggestion} />
              </div>
            );
          })}
      </div>
    </div>
  );
}
