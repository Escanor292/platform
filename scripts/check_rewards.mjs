import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const rewards = await prisma.rewards.findMany({
    where: { projectId: "cmt0y1lls000196jc66m2pj7t" },
    select: { id: true, title: true, projectId: true, campaignId: true, isIncludedInProject: true, isActive: true },
});
console.log(JSON.stringify(rewards, null, 2));
await prisma.$disconnect();
