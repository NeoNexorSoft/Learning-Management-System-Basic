import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@neonexor.com";
  const password = "123456";
  const password_hash = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      password_hash,
      role: Role.ADMIN,
      email_verified: true,
      is_banned: false,
    },
    create: {
      id: uuidv4(),
      name: "Super Admin",
      username: "superadmin",
      email,
      password_hash,
      role: Role.ADMIN,
      email_verified: true,
      is_banned: false,
    },
  });

  const isValid = await bcrypt.compare(password, admin.password_hash);

  console.log("Admin fixed successfully");
  console.log("Email:", email);
  console.log("Password:", password);
  console.log("Password check:", isValid);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
