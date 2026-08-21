export const SUMMARY_SOURCE_TYPES = [
  "profile",
  "product",
  "blog",
  "project",
  "campaign",
] as const;

export type SummarySourceType = (typeof SUMMARY_SOURCE_TYPES)[number];

export type SummaryMetric = {
  label: string;
  value: string;
};

export type SummaryResult = {
  sourceType: SummarySourceType;
  sourceId: string;
  title: string;
  headline: string;
  overview: string;
  keyPoints: string[];
  strengths: string[];
  risks: string[];
  recommendations: string[];
  metrics: SummaryMetric[];
  keywords: string[];
  provider: "llm" | "extractive";
  model?: string;
  generatedAt: string;
};

export type SummaryDocument = {
  sourceType: SummarySourceType;
  sourceId: string;
  title: string;
  text: string;
  facts: string[];
  metrics: SummaryMetric[];
  keywords: string[];
};
