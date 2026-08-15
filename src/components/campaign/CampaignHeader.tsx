"use client";

import { useState } from "react";
import { Tag, Layers } from "lucide-react";
import { getCampaignTypeLabel } from "@/lib/campaign-helpers";
import { CampaignType } from "@/types/campaign";

interface CampaignHeaderProps {
    title: string;
    description: string;
    campaignCode: string;
}

export default function CampaignHeader({ title, description, campaignCode }: CampaignHeaderProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(campaignCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="mb-6">
            <div className="flex items-center gap-3 mb-3 flex-wrap">
                <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                    {title}
                </h1>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-xs font-mono border border-gray-200">
                    <span className="font-semibold text-gray-400">Mã:</span>
                    <span className="font-bold">{campaignCode}</span>
                    <button
                        onClick={handleCopy}
                        className="ml-1 p-1 hover:bg-gray-200 rounded transition-colors relative"
                        title={copied ? "Đã copy!" : "Copy mã dự án"}
                    >
                        {copied ? (
                            <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>
            <CampaignSubtitle description={description} />
        </div>
    );
}

/**
 * Renders a short subtitle from the description.
 * - If it's TipTap JSON → extract the first plain-text paragraph as subtitle
 * - If it's plain text / HTML → render directly
 */
function CampaignSubtitle({ description }: { description: string }) {
    if (!description) return null;

    // Detect TipTap JSON
    try {
        const parsed = JSON.parse(description);
        if (parsed?.type === "doc" && Array.isArray(parsed.content)) {
            // Extract first paragraph text as subtitle
            const firstPara = parsed.content.find(
                (node: any) => node.type === "paragraph" && node.content?.length > 0
            );
            if (firstPara) {
                const text = firstPara.content
                    .map((n: any) => n.text || "")
                    .join("");
                if (text) {
                    return (
                        <p className="text-lg text-gray-600 leading-relaxed line-clamp-3">
                            {text}
                        </p>
                    );
                }
            }
            return null;
        }
    } catch {
        // Not JSON, fall through to plain text
    }

    return (
        <p className="text-lg text-gray-600 leading-relaxed line-clamp-3">
            {description}
        </p>
    );
}
