import { prisma } from "../utils/prisma-client";
// import { ORISAS, FESTIVALS } from "./seed-data";

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

async function main() {
  // Create Orisas
  const createdOrisas = await Promise.all(
    ORISAS.map((o) => prisma.orisa.create({ data: o }))
  );

  const getOrisaId = (name: string) =>
    createdOrisas.find((o) => o.name === name)?.id!;

  // Create Festivals
  for (const f of FESTIVALS) {
    await prisma.festival.create({
      data: {
        title: f.title,
        startMonth: f.startMonth,
        startDay: f.startDay,
        endMonth: f.endMonth,
        endDay: f.endDay,
        orisaId: getOrisaId(f.orisaName),
      },
    });
  }

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
