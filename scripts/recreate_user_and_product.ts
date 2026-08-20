import { PrismaClient } from "@prisma/client";
import { hashSync } from "bcrypt";

const prisma = new PrismaClient();

async function main() {
    // 1. Create user
    const existing = await prisma.users.findUnique({ where: { email: "test3@gmail.com" } });
    let user = existing;
    if (!user) {
        user = await prisma.users.create({
            data: {
                id: "cmphnhw8e0002so1uh16dwpvn",
                email: "test3@gmail.com",
                name: "Test Creator Pro",
                password: hashSync("ManusTest@123", 10),
                role: "CREATOR",
                bio: "Nhà sáng tạo nội dung, người sáng lập dự án gây quỹ cộng đồng.",
                status: "NORMAL",
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        });
        console.log("Created user:", user.id);
    } else {
        console.log("User exists:", user.id);
    }

    // 2. Create project "Mầm xanh tử tế"
    const projectSlug = "mam-xanh-tu-te";
    let project = await prisma.projects.findFirst({ where: { creatorId: user.id } });
    if (!project) {
        project = await prisma.projects.create({
            data: {
                creatorId: user.id,
                title: "Mầm xanh tử tế",
                slug: projectSlug,
                description:
                    "Dự án trồng cây xanh cho trường học vùng khó khăn. Mỗi đóng góp sẽ giúp các em nhỏ có không gian học tập xanh mát và trong lành.",
                richDescription: {
                    type: "doc",
                    content: [
                        {
                            type: "paragraph",
                            content: [
                                {
                                    type: "text",
                                    text: "Dự án trồng cây xanh cho trường học vùng khó khăn.",
                                },
                            ],
                        },
                    ],
                },
                heroBackgroundType: "image",
                coverImage: null,
                createdAt: new Date(),
            },
        });
        console.log("Created project:", project.id);
    } else {
        console.log("Project exists:", project.id);
    }

    // 3. Create product (reward) không thuộc chiến dịch nào
    const product = await prisma.rewards.create({
        data: {
            id: crypto.randomUUID(),
            projectId: project.id,
            campaignId: null,
            isIncludedInProject: true,
            title: "Bộ hạt giống cây xanh tử tế",
            description:
                "Bộ hạt giống gồm 5 loại cây: hoa mười giờ, hoa chiều tím, rau mầm, bạc hà và hương thảo. Kèm đất dinh dưỡng, chậu giấy phân hủy sinh học và hướng dẫn trồng chi tiết. Đóng góp mỗi bộ sẽ ủng hộ quỹ trồng cây xanh cho trường học vùng khó khăn. Sản phẩm chính thức của dự án Mầm xanh tử tế.",
            minAmount: 55000,
            maxAmount: 55000,
            stock: 100,
            maxQuantity: 100,
            deliveryDate: new Date("2026-09-30T00:00:00Z"),
            isActive: true,
            productImages: [],
            updatedAt: new Date(),
        },
    });
    console.log("Created product:", product.id);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
