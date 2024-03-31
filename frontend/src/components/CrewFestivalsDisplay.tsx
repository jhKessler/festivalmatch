import { FestivalSuggestionData, FestivalSuggestion } from "@/app/interfaces";
import { SmallFestivalCard, LargeFestivalCard } from "./FestivalCards";

export default function CrewFestivalsDisplay({
  suggestions,
  selectedMember,
}: {
  suggestions: FestivalSuggestionData;
  selectedMember: string;
}) {
  return (
    <>
      <div className="flex items-start">
        <div className="lg:hidden grid grid-cols-1 2xl:grid-cols-2 2xl:grid-rows-4 gap-[30px] lg:ml-[30px] mt-8 z-2">
          {suggestions.suggestions.map(
            (suggestion: FestivalSuggestion, index: number) => {
              return (
                <div className="col-span-1 row-span-1" key={index}>
                  <SmallFestivalCard
                    suggestion={suggestion}
                    key={index}
                    userLikes={
                      suggestion.user_likings?.filter(
                        (likes) => likes.user_id === selectedMember
                      )[0]?.artist_ids
                    }
                  />
                </div>
              );
            }
          )}
        </div>
        <div className="hidden lg:grid grid-cols-1 2xl:grid-cols-2 gap-[30px] ml-[30px]">
          <div className="col-span-1 row-span-2">
            <LargeFestivalCard
              suggestion={suggestions.suggestions[0]}
              key={"large"}
              userLikes={
                suggestions.suggestions[0].user_likings?.filter(
                  (likes) => likes.user_id === selectedMember
                )[0]?.artist_ids
              }
            />
          </div>
          {suggestions.suggestions
            .slice(1)
            .map((suggestion: FestivalSuggestion, index: number) => {
              return (
                <div className="col-span-1 row-span-1" key={index}>
                  <SmallFestivalCard
                    suggestion={suggestion}
                    key={index}
                    userLikes={
                      suggestion.user_likings?.filter(
                        (likes) => likes.user_id === selectedMember
                      )[0]?.artist_ids
                    }
                  />
                </div>
              );
            })}
        </div>
      </div>
    </>
  );
}
