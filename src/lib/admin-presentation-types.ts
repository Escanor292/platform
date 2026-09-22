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

export type LivePeriod = {
  label: string;
  fromIso: string;
  projects: number;
  campaigns: number;
  campaignsReward: number;
  campaignsDonation: number;
  campaignsWithTx: number;
  donationPledges: number;
  donationBackers: number;
  donationAmount: number;
  donationTip: number;
  rewardPledges: number;
  rewardBackers: number;
  rewardAmount: number;
  platformFee: number;
  certificates: number;
  usersNew: number;
};

export type PresentationLiveStats = {
  generatedAt: string;
  quarterLabel: string;
  snapshot: {
    users: number;
    projects: number;
    campaignsActive: number;
    campaignsRewardActive: number;
    campaignsDonationActive: number;
  };
  quarter: LivePeriod;
  year: LivePeriod;
  all: LivePeriod;
};
