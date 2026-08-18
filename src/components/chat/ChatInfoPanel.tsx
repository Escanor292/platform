"use client";

import { useSession } from "next-auth/react";
import { UserAvatar } from "./UserAvatar";
import { useEffect, useState } from "react";

interface ChatInfoPanelProps {
  conversationId: string;
  otherUserId?: string;
  otherUserName?: string;
  otherUserAvatar?: string;
  otherUserRole?: string;
  campaign?: {
    campaignId: string;
    title: string;
    coverImage?: string;
    currentAmount: number;
    goalAmount: number;
  };
}

export function ChatInfoPanel({
  conversationId,
  otherUserId,
  otherUserName,
  otherUserAvatar,
  otherUserRole,
  campaign,
}: ChatInfoPanelProps) {
  const { data: session } = useSession();
  const [sharedMedia, setSharedMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Load shared media (placeholder for now)
  useEffect(() => {
    // TODO: Implement loading shared media from messages with attachments
    setSharedMedia([]);
  }, [conversationId]);

  if (!otherUserId) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <p>Chọn cuộc trò chuyện để xem thông tin</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white border-l border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Thông tin</h2>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* User info */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-col items-center text-center">
            <UserAvatar
              src={otherUserAvatar}
              name={otherUserName || "Người dùng"}
              size="lg"
              userId={otherUserId}
              clickable={true}
            />
            <h3 className="mt-3 font-semibold text-gray-900">
              {otherUserName}
            </h3>
            <p className="text-sm text-gray-500 capitalize">
              {otherUserRole || "Người dùng"}
            </p>
          </div>
        </div>

        {/* Campaign info */}
        {campaign && (
          <div className="p-4 border-b border-gray-100">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">
              Chiến dịch
            </h4>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="font-medium text-gray-900 text-sm truncate">
                {campaign.title}
              </p>
              <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{
                    width: `${(campaign.currentAmount / campaign.goalAmount) * 100}%`,
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {((campaign.currentAmount / campaign.goalAmount) * 100).toFixed(0)}% đạt được
              </p>
            </div>
          </div>
        )}

        {/* Shared media */}
        <div className="p-4 border-b border-gray-100">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">
            Media chia sẻ
          </h4>
          {sharedMedia.length === 0 ? (
            <p className="text-sm text-gray-500">Chưa có media nào</p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {sharedMedia.map((media, index) => (
                <div
                  key={index}
                  className="aspect-square bg-gray-100 rounded-lg overflow-hidden"
                >
                  {/* TODO: Render media preview */}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">
            Tùy chọn
          </h4>
          <div className="space-y-2">
            <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              Tìm kiếm trong cuộc trò chuyện
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              Báo cáo cuộc trò chuyện
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              Chặn người dùng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
