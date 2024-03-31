import Link from "next/link";

export default function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col w-full sm:w-[400px] h-[150px] items-start">
      <div className="flex flex-row items-end">
        {icon}
        <span className="font-bold text-xl ml-1">{title}</span>
      </div>
      <div className="ml-1">{description}</div>
    </div>
  );
}
