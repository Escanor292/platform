import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkAdmin() {
  console.log("Checking admin user...");
  
  const admin = await prisma.users.findUnique({
    where: { email: "admin@crowdfunding.vn" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isAdmin: true
    }
  });

  if (admin) {
    console.log("Admin user found:");
    console.log(admin);
  } else {
    console.log("Admin user not found!");
  }

  await prisma.$disconnect();
}

checkAdmin();
