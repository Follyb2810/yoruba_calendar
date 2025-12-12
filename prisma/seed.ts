import { prisma } from "../utils/prisma-client";
import bcrypt from "bcrypt";

console.log("seeing beging");
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
  {
    title: "Ogun Festival (March)",
    startMonth: 3,
    startDay: 21,
    endMonth: 3,
    endDay: 24,
    orisaName: "Ogun",
  },
  {
    title: "Ogun Festival (August)",
    startMonth: 8,
    startDay: 25,
    endMonth: 8,
    endDay: 31,
    orisaName: "Ogun",
  },
  {
    title: "Yoruba New Year",
    startMonth: 6,
    startDay: 3,
    endMonth: 6,
    endDay: 3,
    orisaName: "Obatala",
  },
  {
    title: "Yemoja Festival",
    startMonth: 6,
    startDay: 18,
    endMonth: 6,
    endDay: 21,
    orisaName: "Yemoja",
  },
  {
    title: "Elegba / Eṣu Festival",
    startMonth: 7,
    startDay: 12,
    endMonth: 7,
    endDay: 14,
    orisaName: "Elegba",
  },
];
console.log("seeing beging_1");
const ALL_ROLES = ["USER", "CREATOR", "MODERATOR", "ADMIN", "SUPERADMIN"];

async function main() {
  for (const name of ALL_ROLES) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "changeme";

  const hashed = await bcrypt.hash(adminPassword, 10);

  let admin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!admin) {
    admin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: "Administrator",
        password: hashed,
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
    const orisaId = orisaMap[f.orisaName];
    if (!orisaId) continue;

    await prisma.festival.create({
      data: {
        title: f.title,
        location: "",
        userId: admin.id,
        orisaId,

        startYear: currentYear,
        endYear: currentYear,

        startMonth: f.startMonth,
        startDay: f.startDay,
        endMonth: f.endMonth,
        endDay: f.endDay,
      },
    });
  }

  console.log("Seeding completed! Admin has all roles.");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
