import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

/**
 * Middleware để kiểm tra user status
 * Chặn user bị BANNED không cho truy cập
 */
export async function checkUserStatus() {
    const session = await auth();

    if (session?.user) {
        const userStatus = (session.user as any).status;

        if (userStatus === "BANNED") {
            // User bị cấm - redirect về trang thông báo
            redirect("/banned");
        }
    }

    return session;
}

/**
 * Check nếu user có thể tạo campaign
 * Chỉ CREATOR với status NORMAL hoặc PRO mới được tạo
 */
export function canCreateCampaign(user: any): boolean {
    if (!user) return false;
    if (user.role !== "CREATOR") return false;
    if (user.status === "BANNED") return false;
    return true;
}

/**
 * Check nếu user có thể pledge
 * User bị BANNED không được pledge
 */
export function canPledge(user: any): boolean {
    if (!user) return true; // Guest có thể pledge
    if (user.status === "BANNED") return false;
    return true;
}
