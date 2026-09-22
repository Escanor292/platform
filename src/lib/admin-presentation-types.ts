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

export type PresentationLane = {
  title: string;
  tone?: "rose" | "emerald" | "navy" | "default";
  steps: string[];
};

export type PresentationSchemaGroup = {
  title: string;
  items: string[];
};

export type PresentationTreeNode = {
  path: string;
  note: string;
};

export type PresentationSlide = {
  variant?: "hero" | "default" | "close" | "pnl";
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
  lanes?: PresentationLane[];
  schema?: PresentationSchemaGroup[];
  tree?: PresentationTreeNode[];
};

export type PresentationDeck = {
  brand: string;
  title: string;
  version?: number;
  slides: PresentationSlide[];
};
