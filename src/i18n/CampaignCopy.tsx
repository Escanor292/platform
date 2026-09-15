"use client";

import UgcText from "@/i18n/UgcText";

export function CampaignCopy({
  title,
  description,
}: {
  title: string;
  description?: string | null;
}) {
  return (
    <>
      <UgcText
        as="h3"
        text={title}
        className="font-display font-bold text-dblue text-lg mb-2 line-clamp-2 group-hover:text-pgreen transition"
      />
      {description ? (
        <UgcText
          as="p"
          text={description}
          className="text-gray-500 text-sm mb-4 line-clamp-2"
        />
      ) : null}
    </>
  );
}
