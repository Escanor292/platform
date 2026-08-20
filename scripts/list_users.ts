import { PrismaClient } from "../prisma/generated/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.users.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      password: true,
      createdAt: true,
    },
  });
  console.log(`Total users: ${users.length}\n`);
  for (const u of users) {
    const hasPassword = !!u.password;
    const canVerify =
      hasPassword && (await bcrypt.compare("ManusTest@123", u.password!));
    console.log(
      JSON.stringify({
        id: u.id,
        email: u.email,
        name: u.name,
        hasPassword,
        passwordIsManusTest123: canVerify,
        createdAt: u.createdAt,
      })
    );
  }
  await prisma.$disconnect();
}

main().catch(console.error);
