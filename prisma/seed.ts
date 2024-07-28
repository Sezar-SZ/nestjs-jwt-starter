import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();
async function main() {
    const adminHashedPassword = await bcrypt.hash(
        process.env.ADMIN_PASSWORD,
        10
    );
    await prisma.user.upsert({
        where: { email: process.env.ADMIN_EMAIL },
        update: {},
        create: {
            email: process.env.ADMIN_EMAIL,
            password: adminHashedPassword,
            role: "ADMIN",
        },
    });

    const normalUserHashedPassword = await bcrypt.hash("testpassword", 10);
    await prisma.user.upsert({
        where: { email: "testuser@test.com" },
        update: {},
        create: {
            email: "testuser@test.com",
            password: normalUserHashedPassword,
            role: "USER",
        },
    });
}
main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
