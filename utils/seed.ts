import bcrypt from "bcrypt";
import { prisma } from "./prisma-client";

export async function runSeedIfEmpty() {
  console.log("Checking if DB needs seeding...");

  const roleCount = await prisma.role.count();
  const orisaCount = await prisma.orisa.count();
  const festivalCount = await prisma.festival.count();

  const needsSeeding =
    roleCount === 0 || orisaCount === 0 || festivalCount === 0;

  if (!needsSeeding) {
    console.log("Database already has data. Skipping seed.");
    return;
  }

  console.log("Seeding database...");

  const ORISAS = [
    { name: "Olokun" },
    { name: "Oshun" },
    { name: "Sango" },
    { name: "Ogun" },
    { name: "Obatala" },
    { name: "Yemoja" },
    { name: "Elegba" },
    { name: "Oya" },
    { name: "Egungun" },
    { name: "Shopona" },
    { name: "Obajulaiye" },
    { name: "Oduduwa" },
    { name: "Oshosi" },
    { name: "Orunmila" },
  ];

  const FESTIVALS = [
    {
      title: "Olokun Festival",
      startMonth: 2,
      startDay: 21,
      endMonth: 2,
      endDay: 25,
      orisaName: "Olokun",
    },
    {
      title: "Oshun Festival",
      startMonth: 4,
      startDay: 24,
      endMonth: 4,
      endDay: 30,
      orisaName: "Oshun",
    },
    {
      title: "Sango Festival",
      startMonth: 7,
      startDay: 15,
      endMonth: 7,
      endDay: 21,
      orisaName: "Sango",
    },
  ];

  const ALL_ROLES = ["USER", "CREATOR", "MODERATOR", "ADMIN", "SUPERADMIN"];

  for (const name of ALL_ROLES) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@dev.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "admin1234";
  const hashed = await bcrypt.hash(adminPassword, 10);

  let admin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!admin) {
    admin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: "Administrator",
        password: hashed,
        emailVerified: new Date(),
        roles: {
          create: ALL_ROLES.map((role) => ({
            role: { connect: { name: role } },
          })),
        },
      },
    });
  }

  const orisaMap: Record<string, number> = {};

  for (const ori of ORISAS) {
    const orisa = await prisma.orisa.upsert({
      where: { name: ori.name },
      update: {},
      create: { name: ori.name },
    });
    orisaMap[ori.name] = orisa.id;
  }

  const currentYear = new Date().getFullYear();

  for (const f of FESTIVALS) {
    const already = await prisma.festival.findFirst({
      where: { title: f.title },
    });

    if (already) continue;

    await prisma.festival.create({
      data: {
        title: f.title,
        location: "",
        userId: admin.id,
        orisaId: orisaMap[f.orisaName],

        startYear: currentYear,
        endYear: currentYear,
        startMonth: f.startMonth,
        startDay: f.startDay,
        endMonth: f.endMonth,
        endDay: f.endDay,
      },
    });
  }

  console.log("Seeding completed!");
}

// runSeedIfEmpty()
//   .catch((e) => {
//     console.error("Seed error:", e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
