import { PrismaClient } from "@prisma/client";
import { hashSync } from "bcrypt";

const prisma = new PrismaClient();
const PASSWORD = "123";

async function main() {
    // 1. Đổi mật khẩu test3@gmail.com sang 123
    const t3 = await prisma.users.findUnique({ where: { email: "test3@gmail.com" } });
    if (t3) {
        await prisma.users.update({
            where: { id: t3.id },
            data: { password: hashSync(PASSWORD, 10) },
        });
        console.log("Updated test3@gmail.com password -> 123");
    }

    // 2. Tạo 3 tài khoản mới
    const accounts = [
        {
            email: "test1@gmail.com",
            name: "Test Backer",
            role: "BACKER",
            bio: "Người ủng hộ cộng đồng, thích góp phần vào các dự án tử tế.",
        },
        {
            email: "test2@gmail.com",
            name: "Test Creator",
            role: "CREATOR",
            bio: "Nhà sáng tạo nội dung và dự án gây quỹ.",
        },
        {
            email: "admin@gmail.com",
            name: "Admin Tử Tử Fund",
            role: "ADMIN",
            bio: "Quản trị viên nền tảng Tử Tử Fund.",
        },
    ];

    for (const acc of accounts) {
        const existing = await prisma.users.findUnique({ where: { email: acc.email } });
        if (existing) {
            await prisma.users.update({
                where: { id: existing.id },
                data: { password: hashSync(PASSWORD, 10) },
            });
            console.log(`Updated ${acc.email} (id ${existing.id}) -> password 123`);
        } else {
            const user = await prisma.users.create({
                data: {
                    id: crypto.randomUUID(),
                    email: acc.email,
                    name: acc.name,
                    password: hashSync(PASSWORD, 10),
                    role: acc.role,
                    isAdmin: acc.role === "ADMIN",
                    bio: acc.bio,
                    status: "NORMAL",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            });
            console.log(`Created ${acc.email} (${user.role}) id=${user.id}`);
        }
    }

    // 3. In danh sách toàn bộ users để xác nhận
    const users = await prisma.users.findMany({
        select: { id: true, email: true, name: true, role: true, isAdmin: true },
    });
    console.log("\nTất cả tài khoản hiện có:");
    console.table(users);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
