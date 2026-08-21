"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Search, X, Loader2, Users, Check } from "lucide-react";
import { UserAvatar } from "./UserAvatar";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  displayName?: string;
  email: string;
  avatar?: string;
  role: string;
}

interface NewMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewMessageDialog({ open, onOpenChange }: NewMessageDialogProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [groupName, setGroupName] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentLoading, setRecentLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Load people from the user's most recently updated conversations.
  // The conversations API already enriches deleted participants, so they can
  // be filtered here without exposing deleted accounts in the group picker.
  const loadRecentUsers = async () => {
    setRecentLoading(true);

    try {
      const response = await fetch("/api/chat/conversations");
      if (!response.ok) return;

      const data = await response.json();
      const currentUserId = session?.user?.id;
      const seenUserIds = new Set<string>();
      const contacts: User[] = [];

      for (const conversation of data.conversations || []) {
        for (const participant of conversation.participants || []) {
          const participantId = participant.userId?.toString();
          if (
            !participantId ||
            participantId === currentUserId ||
            participant.deleted ||
            seenUserIds.has(participantId)
          ) {
            continue;
          }

          seenUserIds.add(participantId);
          contacts.push({
            id: participantId,
            name: participant.name || "Người dùng",
            displayName: participant.name || "Người dùng",
            email: participant.email || "",
            avatar: participant.avatarUrl,
            role: participant.role || "user",
          });
        }
      }

      setRecentUsers(contacts);
    } catch (err) {
      console.error("Failed to load recent chat users:", err);
      setRecentUsers([]);
    } finally {
      setRecentLoading(false);
    }
  };

  // Search users
  const searchUsers = async (query: string) => {
    if (query.trim().length < 2) {
      setUsers([]);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/chat/users/search?query=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Không thể tìm kiếm người dùng");
      }
    } catch (err) {
      setError("Có lỗi xảy ra khi tìm kiếm");
    } finally {
      setLoading(false);
    }
  };

  // Load recent contacts whenever the dialog opens.
  useEffect(() => {
    if (open) {
      loadRecentUsers();
    }
  }, [open, session?.user?.id]);

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const toggleSelectUser = (user: User) => {
    if (selectedUsers.some((u) => u.id === user.id)) {
      setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const removeSelectedUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter((u) => u.id !== userId));
  };

  // Start conversation or create group
  const handleCreateChat = async () => {
    if (selectedUsers.length === 0) {
      setError("Vui lòng chọn ít nhất 1 thành viên");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response = await fetch("/api/chat/conversations/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          targetUserId: selectedUsers[0].id,
          targetUserIds: selectedUsers.map((u) => u.id),
          groupName: groupName.trim() || undefined,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const conversationId = data.conversation._id?.toString() || data.conversation._id;
        onOpenChange(false);
        router.push(`/chat/${conversationId}`);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Không thể tạo cuộc trò chuyện");
      }
    } catch (err) {
      setError("Có lỗi xảy ra khi tạo cuộc trò chuyện");
    } finally {
      setSubmitting(false);
    }
  };

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setGroupName("");
      setUsers([]);
      setRecentUsers([]);
      setSelectedUsers([]);
      setError("");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <DialogTitle>Tạo nhóm chat</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Selected users chips */}
          {selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-1.5 p-2 bg-gray-50 rounded-lg border border-gray-100 max-h-24 overflow-y-auto">
              {selectedUsers.map((u) => (
                <span
                  key={u.id}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
                >
                  {u.displayName || u.name}
                  <button
                    type="button"
                    onClick={() => removeSelectedUser(u.id)}
                    className="hover:text-primary/70"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Group name input if multiple users selected */}
          {selectedUsers.length > 1 && (
            <div>
              <Input
                type="text"
                placeholder="Tên nhóm chat (tùy chọn)..."
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full"
              />
            </div>
          )}

          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Tìm kiếm thành viên thêm vào nhóm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Error message */}
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          {/* User list */}
          <ScrollArea className="h-[240px]">
            {loading || (searchQuery.length < 2 && recentLoading) ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : searchQuery.length < 2 ? (
              recentUsers.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  Chưa có tài khoản nào bạn đã trò chuyện gần đây
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="px-2 pb-1 text-xs font-medium uppercase tracking-wide text-gray-400">
                    Đã trò chuyện gần đây
                  </p>
                  {recentUsers.map((user) => {
                    const isSelected = selectedUsers.some((u) => u.id === user.id);
                    return (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => toggleSelectUser(user)}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-colors text-left ${
                          isSelected ? "bg-primary/5 border border-primary/20" : "hover:bg-gray-100"
                        }`}
                      >
                        <UserAvatar
                          src={user.avatar || undefined}
                          name={user.displayName || user.name}
                          size="md"
                          userId={user.id}
                          clickable={false}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 truncate">
                            {user.displayName || user.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                        <div
                          className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                            isSelected ? "bg-primary border-primary text-white" : "border-gray-300"
                          }`}
                        >
                          {isSelected && <Check className="h-3.5 w-3.5" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                Không tìm thấy người dùng nào
              </div>
            ) : (
              <div className="space-y-1">
                {users.map((user) => {
                  const isSelected = selectedUsers.some((u) => u.id === user.id);
                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => toggleSelectUser(user)}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-colors text-left ${
                        isSelected ? "bg-primary/5 border border-primary/20" : "hover:bg-gray-100"
                      }`}
                    >
                      <UserAvatar
                        src={user.avatar || undefined}
                        name={user.displayName || user.name}
                        size="md"
                        userId={user.id}
                        clickable={false}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 truncate">
                          {user.displayName || user.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <div
                        className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? "bg-primary border-primary text-white"
                            : "border-gray-300"
                        }`}
                      >
                        {isSelected && <Check className="h-3.5 w-3.5" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between gap-2 pt-2">
          <span className="text-xs text-gray-500">
            {selectedUsers.length > 0 ? `Đã chọn ${selectedUsers.length} thành viên` : "Chọn thành viên"}
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleCreateChat}
              disabled={selectedUsers.length === 0 || submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  Đang tạo...
                </>
              ) : selectedUsers.length > 1 ? (
                "Tạo nhóm chat"
              ) : (
                "Nhắn tin"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

