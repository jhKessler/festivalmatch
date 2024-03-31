"use client";
import React from "react";
import {
  Accordion,
  AccordionHeader,
  AccordionBody,
} from "@material-tailwind/react";
import { useTranslations } from "next-intl";

function Icon({ id, open }: { id: number; open: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="white"
      className={`${open ? "rotate-180" : ""} h-5 w-5 transition-transform`}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  );
}
function FAQAccordion({
  number,
  open,
  handleOpen,
}: {
  number: number;
  open: boolean[];
  handleOpen: (number: number) => void;
}) {
  const t = useTranslations("FAQ");
  // @ts-ignore
  return <Accordion open={open[number-1]} icon={<Icon id={number} open={open[number-1]}/>}>
{    // @ts-ignore
}    <AccordionHeader onClick={() => handleOpen(number)} className="border-b-purple border-b-2">
      <h2 className="text-white font-medium text-xl sm:text-2xl hover:text-purple transition-colors duration-300">
        {t(`Question${number}`)}
      </h2>
    </AccordionHeader>
    <AccordionBody>
      <p className="text-md font-light sm:font-normal">
        {t(`Answer${number}`)}
      </p>
    </AccordionBody>
  </Accordion>;
}

export default function FAQSection() {
  const [open, setOpen] = React.useState([false, false, false]);
  const handleOpen = (number: number) => {
    setOpen((prev) => {
      return prev.map((isOpen, index) => (index === (number-1) ? !isOpen : isOpen));
    });
  };
  return (
    <>
    <FAQAccordion
      number={1}
      open={open}
      handleOpen={handleOpen}
    />
    <FAQAccordion
      number={2}
      open={open}
      handleOpen={handleOpen}
    />
    <FAQAccordion
      number={3}
      open={open}
      handleOpen={handleOpen}
    />
    </>
  );
}
