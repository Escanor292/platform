export type PresentationFigure = {
  key: string;
  alt: string;
  caption: string;
};

export type PresentationCard = {
  title: string;
  body: string;
  tone?: "rose" | "emerald" | "default";
};

export type PresentationBlock = {
  heading?: string;
  headingTone?: "rose" | "emerald" | "navy";
  body?: string;
  bullets?: string[];
  figures?: PresentationFigure[];
  cards?: PresentationCard[];
};

export type PresentationSlide = {
  variant?: "hero" | "default" | "close";
  kicker?: string;
  title: string;
  titleAccent?: string;
  body?: string;
  paragraphs?: { lead?: string; text: string }[];
  note?: string;
  cards?: PresentationCard[];
  table?: { headers: string[]; rows: string[][] };
  steps?: { n: string; t: string; d: string }[];
  bullets?: string[];
  blocks?: PresentationBlock[];
  figures?: PresentationFigure[];
};

export type PresentationDeck = {
  brand: string;
  title: string;
  slides: PresentationSlide[];
};
