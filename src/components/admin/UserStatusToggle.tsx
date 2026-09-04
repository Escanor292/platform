"use client";

import { useState } from "react";
import { Zap, Ban, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

interface UserStatusToggleProps {
    userId: string;
    userName: string;
    userRole: string;
    status: string;
    onSuccess?: () => void;
}

export default function UserStatusToggle({
    userId,
    userName,
    userRole,
    status,
    onSuccess
}: UserStatusToggleProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [currentStatus, setCurrentStatus] = useState(status);

    // Chỉ hiển thị cho CREATOR và BACKER
    if (userRole === "ADMIN") {
        return <span className="text-xs text-gray-400">Admin</span>;
    }

    const isCreator = userRole === "CREATOR";

    const handleStatusChange = async (newStatus: string) => {
        if (isLoading || newStatus === currentStatus) return;

        const statusLabels: Record<string, string> = {
            NORMAL: "thường",
            PRO: "Pro",
            BANNED: "cấm"
        };

        const confirmMessage = `Bạn có chắc muốn đổi trạng thái ${userName} sang ${statusLabels[newStatus]}?`;

        if (!confirm(confirmMessage)) return;

        setIsLoading(true);

        try {
            const response = await fetch(`/api/admin/users/${userId}/update-status`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Có lỗi xảy ra");
            }

            setCurrentStatus(data.users.status);
            toast.success(data.message);

            if (onSuccess) {
                onSuccess();
            }
        } catch (error: any) {
            toast.error(error.message || "Không thể thay đổi trạng thái");
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusDisplay = () => {
        switch (currentStatus) {
            case "PRO":
                return {
                    label: "Pro",
                    icon: <Zap size={12} className="fill-amber-500" />,
                    className: "bg-gradient-to-r from-amber-400 to-amber-500 text-white"
                };
            case "BANNED":
                return {
                    label: "Cấm",
                    icon: <Ban size={12} />,
                    className: "bg-red-600 text-white"
                };
            default:
                return {
                    label: "Thường",
                    icon: null,
                    className: "bg-gray-200 text-gray-700"
                };
        }
    };

    const statusDisplay = getStatusDisplay();

    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
                <button
                    disabled={isLoading}
                    className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold
            transition-all duration-200 hover:shadow-md
            ${statusDisplay.className}
            ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          `}
                >
                    {statusDisplay.icon}
                    {isLoading ? "..." : statusDisplay.label}
                    <ChevronDown size={12} className="ml-0.5" />
                </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
                <DropdownMenu.Content
                    align="end"
                    sideOffset={5}
                    className="min-w-[140px] bg-white rounded-xl shadow-lg border border-gray-100 p-1 z-50 animate-in fade-in zoom-in-95 duration-200"
                >
                    <DropdownMenu.Item
                        onClick={() => handleStatusChange("NORMAL")}
                        disabled={currentStatus === "NORMAL"}
                        className={`
              flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold
              transition-colors cursor-pointer outline-none
              ${currentStatus === "NORMAL"
                                ? "bg-gray-100 text-gray-900"
                                : "text-gray-600 hover:bg-gray-50"
                            }
            `}
                    >
                        <div className="w-2 h-2 rounded-full bg-gray-400" />
                        Thường
                    </DropdownMenu.Item>

                    {isCreator && (
                        <DropdownMenu.Item
                            onClick={() => handleStatusChange("PRO")}
                            disabled={currentStatus === "PRO"}
                            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold
              transition-colors cursor-pointer outline-none
              ${currentStatus === "PRO"
                                    ? "bg-amber-50 text-amber-600"
                                    : "text-gray-600 hover:bg-amber-50"
                                }
            `}
                        >
                            <Zap size={12} className={currentStatus === "PRO" ? "fill-amber-500 text-amber-500" : ""} />
                            Pro
                        </DropdownMenu.Item>
                    )}

                    <DropdownMenu.Separator className="h-px bg-gray-100 my-1" />

                    <DropdownMenu.Item
                        onClick={() => handleStatusChange("BANNED")}
                        disabled={currentStatus === "BANNED"}
                        className={`
              flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold
              transition-colors cursor-pointer outline-none
              ${currentStatus === "BANNED"
                                ? "bg-red-50 text-red-600"
                                : "text-red-600 hover:bg-red-50"
                            }
            `}
                    >
                        <Ban size={12} />
                        Cấm
                    </DropdownMenu.Item>
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    );
}
