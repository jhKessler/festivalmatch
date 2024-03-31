"use client";
import { Carousel } from "flowbite-react";

export default function PopularFestivalsDisplay({
  popularFestivals,
}: {
  popularFestivals: { img: string }[];
}) {
  return (
    <div className="h-[500px] sm:mt-14 w-full sm:w-[400px]">
      <Carousel
        slideInterval={4000}
        indicators={false}
        leftControl
        rightControl
        draggable={false}
      >
        {popularFestivals.map((festival, index) => {
          return (
            <div
              key={index}
              className="flex flex-col items-center overflow-hidden rounded-md w-[300px] h-[420px]"
            >
              <img
                src={festival.img}
                className="object-cover object-center w-[400px] h-[500px]"
              />
            </div>
          );
        })}
      </Carousel>
    </div>
  );
}
