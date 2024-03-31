import { Artist, FestivalSuggestion } from "@/app/interfaces";
import React from "react";

interface ColorUserLikesProps {
  userLikes: string[] | undefined;
  artists: Artist[];
}

const ColorUserLikes: React.FC<ColorUserLikesProps> = ({
  userLikes,
  artists,
}) => {
  if (!userLikes) {
    userLikes = [];
  }
  return (
    <>
      {artists.map((artist, index) => (
        <React.Fragment key={index}>
          <span
            className={
              userLikes?.includes(artist.id)
                ? "font-bold underline decoration-purple whitespace-nowrap text-white"
                : "underline decoration-transparent whitespace-nowrap text-white"
            }
          >
            {artist.name}
          </span>
          {index !== artists.length - 1 && <span>, </span>}
        </React.Fragment>
      ))}
    </>
  );
};

export function LargeFestivalCard({
  suggestion,
  userLikes,
}: {
  suggestion: FestivalSuggestion;
  userLikes?: string[] | undefined;
}) {
  return (
    <div className="w-[450px] h-[570px] backdrop-blur-md bg-black/70 rounded-md flex flex-col items-center animate-fadeInBlurfulls">
      <div className="flex items-center">
        <a className="mt-6 text-3xl text-purple font-bold text-center">
          {suggestion.name}
        </a>
      </div>
      <h2 className="font-semibold text-white text-xl">
        {suggestion.date_str}
      </h2>
      <h3 className="text-white mt-1 text-md font-light">
        {suggestion.location}
      </h3>
      <div className="w-[150px] h-[150px] overflow-hidden relative mt-2 rounded-md">
        <img
          src={suggestion.headliner_img_url}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
      <div className="flex flex-col items-center h-[80px]">
        <p className="mt-6 text-3xl">
          <ColorUserLikes
            userLikes={userLikes}
            artists={suggestion.lineup.slice(0, 1)}
          />
        </p>
      </div>
      <div className="flex flex-col items-center h-[50px]">
        <p className="text-lg font-light text-center">
          <ColorUserLikes
            userLikes={userLikes}
            artists={suggestion.lineup.slice(1, 4)}
          />
        </p>
      </div>
      <div className="flex flex-col items-center h-[70px] w-[300px]">
        <p className="mt-2 text-xs text-center px-4">
          <ColorUserLikes
            userLikes={userLikes}
            artists={suggestion.lineup.slice(4)}
          />
        </p>
      </div>
      <div className="flex flex-col justify-center items-center w-full">
        <div>
          <span className="text-white font-semibold">Powered by</span>
        </div>
        <div className="flex flex-row justify-between items-center mt-2 w-full px-24">
          <img src="/SpotifyLogoWhite.png" className="w-[100px]" />
          <div>
            <span className="font-bold text-white text-sm">festivalmatch</span>
            <span className="text-purple font-bold">.app</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SmallFestivalCard({
  suggestion,
  userLikes,
}: {
  suggestion: FestivalSuggestion;
  userLikes?: string[] | undefined;
}) {
  return (
    <div
      className={`w-[330px] md:w-[450px] h-[270px] backdrop-blur-md bg-black/70 rounded-md flex flex-col items-center animate-fadeInBlurfulls`}
    >
      <div className="flex flex-col items-center">
        <div className="mt-3 flex">
          <a className="text-purple font-bold text-xl">{suggestion.name}</a>
        </div>
        <div>
          <span className="font-semibold text-sm text-white">
            {suggestion.date_str}
          </span>
        </div>
        <div>
          <span className="font-light text-sm  text-white">
            {suggestion.location}
          </span>
        </div>
      </div>
      <div className="flex flex-row w-full h-full items-center justify-between px-4 sm:px-7">
        <div className="w-[100px] h-[100px] sm:w-[125px] sm:h-[125px] overflow-hidden relative rounded-md">
          <img
            src={suggestion.headliner_img_url}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
        <div className="w-40 sm:w-60">
          <div className="flex flex-col items-center h-[60px]">
            <p className="mt-6 text-lg sm:text-xl">
              <ColorUserLikes
                userLikes={userLikes}
                artists={suggestion.lineup.slice(0, 1)}
              />
            </p>
          </div>
          <div className="flex flex-col items-center h-[50px]">
            <p className="text-sm sm:text-md font-light text-center">
              <ColorUserLikes
                userLikes={userLikes}
                artists={suggestion.lineup.slice(1, 4)}
              />
            </p>
          </div>
          <div className="flex flex-col items-center h-[70px]">
            <p className="mt-2 text-[0.6rem] sm:text-xs font-light text-center px-4">
              <ColorUserLikes
                userLikes={userLikes}
                artists={suggestion.lineup.slice(4, 10)}
              />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
