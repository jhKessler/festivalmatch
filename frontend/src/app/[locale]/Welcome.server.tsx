import FAQSection from "@/components/FAQSection";
import FeatureCard from "@/components/FeatureCard";
import PopularFestivalsDisplay from "@/components/PopularFestivalsDisplay";
import GetStartedButton from "@/components/common/GetStartedButton";
import SpotifySignInButton from "@/components/common/SpotifySignInButton";
import { useTranslations } from "next-intl";

export default function WelcomePage() {
  const t = useTranslations("WelcomePage");

  return (
    <div className="flex flex-col sm:items-start w-full sm:w-auto mx-4">
      <div className="flex flex-col xl:flex-row items-center w-full">
        <div className="flex flex-col animate-fadeIn mt-12 justify-between items-center xl:items-start w-full">
          <div className="flex flex-col items-center xl:items-start text-center xl:text-start">
            <span className="font-extrabold text-4xl xl:text-4xl text-white w-[70%]">
              {t("Headline")}
            </span>
            <span className="text-md xl:text-md text-white w-[70%] mt-2">
              {t("SubHeadline")}
            </span>
            <div className="mt-6 w-full flex justify-center xl:justify-start">
              <SpotifySignInButton />
            </div>
          </div>
          <div className="flex flex-col xl:flex-row gap-x-4 mt-12 xl:mt-24 justify-center">
            <FeatureCard
              icon={
                <svg
                  className="fill-white"
                  xmlns="http://www.w3.org/2000/svg"
                  height="40"
                  viewBox="0 0 24 24"
                  width="40"
                >
                  <path d="M0 0h24v24H0z" fill="none" />
                  <path d="M10 20h4V4h-4v16zm-6 0h4v-8H4v8zM16 9v11h4V9h-4z" />
                </svg>
              }
              title={t("Feature1Title")}
              description={t("Feature1Description")}
            />
            <FeatureCard
              icon={
                <svg
                  className="fill-white"
                  xmlns="http://www.w3.org/2000/svg"
                  height="40"
                  viewBox="0 0 24 24"
                  width="40"
                >
                  <path d="M0 0h24v24H0z" fill="none" />
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                </svg>
              }
              title={t("Feature2Title")}
              description={t("Feature2Description")}
            />
          </div>
        </div>
      </div>
      <div className="w-full flex flex-col xl:flex-row">
        <div className="w-full xl:w-[800px] px-8 xl:px-0 xl:mt-12">
          <FAQSection />
        </div>
      </div>
    </div>
  );
}
