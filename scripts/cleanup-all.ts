/**
 * Cleanup script: xóa toàn bộ chiến dịch, dự án, sản phẩm, đóng góp,
 * giao dịch, đánh giá và tin nhắn chat. Giữ nguyên tài khoản người dùng.
 *
 * Chạy: npx tsx scripts/cleanup-all.ts
 */
import { PrismaClient } from "@prisma/client";
import { getDb } from "../src/lib/mongodb";

async function main() {
    const prisma = new PrismaClient();

    console.log("=== BẮT ĐẦU XÓA DỮ LIỆU ===");

    // ---- PostgreSQL (theo thứ tự quan hệ) ----
    console.log("1. Xóa audit_logs ...");
    await prisma.audit_logs.deleteMany({});

    console.log("2. Xóa platform_invoices, daily_tip_invoices ...");
    await prisma.platform_invoices.deleteMany({});
    await prisma.daily_tip_invoices.deleteMany({});

    console.log("3. Xóa backer_invoices (liên kết campaigns, users) ...");
    await prisma.backer_invoices.deleteMany({});

    console.log("4. Xóa reviews ...");
    await prisma.reviews.deleteMany({});

    console.log("5. Xóa pledges (kéo theo cascade các quan hệ) ...");
    await prisma.pledges.deleteMany({});

    console.log("6. Xóa rewards (products + gifts, onDelete Cascade với campaigns) ...");
    await prisma.rewards.deleteMany({});

    console.log("7. Xóa campaign_updates, campaign_followers, campaign_reports, campaign_blog_links ...");
    await prisma.campaign_updates.deleteMany({});
    await prisma.campaign_followers.deleteMany({});
    await prisma.campaign_reports.deleteMany({});
    await prisma.campaign_blog_links.deleteMany({});

    console.log("8. Xóa campaigns ...");
    await prisma.campaigns.deleteMany({});

    console.log("9. Xóa blog_reports, blog_likes, blog_comments, blog_bookmarks, blog_posts ...");
    await prisma.blog_reports.deleteMany({});
    await prisma.blog_likes.deleteMany({});
    await prisma.blog_comments.deleteMany({});
    await prisma.blog_bookmarks.deleteMany({});
    await prisma.blog_posts.deleteMany({});

    console.log("10. Xóa projects ...");
    await prisma.projects.deleteMany({});

    console.log("11. Xóa blacklist, transaction_limits, kyc_info ...");
    await prisma.blacklist.deleteMany({});
    await prisma.transaction_limits.deleteMany({});
    await prisma.kyc_info.deleteMany({});

    console.log("12. Xóa badges, user_badges ...");
    await prisma.user_badges.deleteMany({});
    await prisma.badges.deleteMany({});

    // ---- MongoDB: chat (conversations, messages, reports, notes) ----
    console.log("13. Xóa tin nhắn chat (MongoDB) ...");
    try {
        const db = await getDb();
        await db.collection("conversations").deleteMany({});
        await db.collection("messages").deleteMany({});
        await db.collection("chat_reports").deleteMany({});
        await db.collection("user_notes").deleteMany({});
        console.log("    Đã xóa conversations, messages, chat_reports, user_notes trong MongoDB.");
    } catch (err) {
        console.error("    Lỗi xóa MongoDB (có thể không có kết nối):", err);
    }

    // ---- Kiểm tra kết quả ----
    console.log("\n=== KẾT QUẢ ===");
    const counts = {
        campaigns: await prisma.campaigns.count(),
        projects: await prisma.projects.count(),
        rewards: await prisma.rewards.count(),
        pledges: await prisma.pledges.count(),
        reviews: await prisma.reviews.count(),
        backer_invoices: await prisma.backer_invoices.count(),
        platform_invoices: await prisma.platform_invoices.count(),
        daily_tip_invoices: await prisma.daily_tip_invoices.count(),
        campaign_updates: await prisma.campaign_updates.count(),
        users: await prisma.users.count(),
        audit_logs: await prisma.audit_logs.count(),
        blacklist: await prisma.blacklist.count(),
    };
    console.table(counts);

    try {
        const db = await getDb();
        const mongoCounts = {
            conversations: await db.collection("conversations").countDocuments(),
            messages: await db.collection("messages").countDocuments(),
        };
        console.table(mongoCounts);
    } catch {
        console.log("Không kiểm tra được MongoDB.");
    }

    console.log("=== HOÀN TẤT ===");
    await prisma.$disconnect();
    process.exit(0);
}

main().catch(async (err) => {
    console.error("LỖI:", err);
    process.exit(1);
});
