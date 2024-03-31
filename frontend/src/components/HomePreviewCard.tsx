import React from "react";

interface HomePreviewCardProps {
  label?: React.ReactNode;
  items?: React.ReactNode;
  button?: React.ReactNode;
}

export default function HomePreviewCard({
  label,
  items,
  button,
}: HomePreviewCardProps) {
  return (
    <div className="flex flex-col justify-between animate-fadeInBlurhalfs backdrop-blur-md bg-black/70 rounded-md w-[90%] sm:w-[800px] h-[250px] py-4">
      {label}
      {items}
      {button}
    </div>
  );
}
