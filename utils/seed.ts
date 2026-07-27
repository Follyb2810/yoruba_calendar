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

  // Create roles
  for (const name of ALL_ROLES) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  const devPassword = process.env.ADMIN_PASSWORD ?? process.env.DEV_PASSWORD ?? "admin1234";
  const admin = await ensureDevUser({
    email:
      process.env.OWNER_EMAIL ??
      process.env.ADMIN_EMAIL ??
      "follyb2810@gmail.com",
    name: "Administrator",
    password: devPassword,
    roles: ALL_ROLES,
  });

  // Upsert Orisas
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

    const startDate = new Date(currentYear, f.startMonth - 1, f.startDay);
    const endDate = new Date(currentYear, f.endMonth - 1, f.endDay);

    await prisma.festival.create({
      data: {
        title: f.title,
        description: `Annual celebration honoring ${f.orisaName}, featuring traditional ceremonies, music, and community gathering.`,
        location: "Nigeria",
        userId: admin.id,
        orisaId: orisaMap[f.orisaName],
        country: "Nigeria",
        eventType: "physical",
        timezone: "Africa/Lagos",
        startDate,
        endDate,
        ticketType: "single",
        status: "PUBLISHED",
      },
    });
  }

  console.log("Seeding completed!");
}

function normalizeEmail(raw: string): string {
  return raw.split(",")[0].trim().toLowerCase();
}

async function ensureDevUser(params: {
  email: string;
  name: string;
  password: string;
  roles: string[];
}) {
  const email = normalizeEmail(params.email);
  const hashed = await bcrypt.hash(params.password, 10);

  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: params.name,
        password: hashed,
        emailVerified: new Date(),
        roles: {
          create: params.roles.map((role) => ({
            role: { connect: { name: role } },
          })),
        },
      },
    });
    return user;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashed, name: params.name },
  });

  for (const roleName of params.roles) {
    const role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) continue;

    const existing = await prisma.userRole.findFirst({
      where: { userId: user.id, roleId: role.id },
    });

    if (!existing) {
      await prisma.userRole.create({
        data: { userId: user.id, roleId: role.id },
      });
    }
  }

  return user;
}

/** Always upsert dev admin, seller, and buyer accounts. */
async function seedDevUsers() {
  const devPassword = process.env.ADMIN_PASSWORD ?? process.env.DEV_PASSWORD ?? "admin1234";

  const adminEmail =
    process.env.OWNER_EMAIL ?? process.env.ADMIN_EMAIL ?? "follyb2810@gmail.com";
  const sellerEmail = process.env.SELLER_EMAIL ?? "follyb2810+seller@gmail.com";
  const buyerEmail = process.env.BUYER_EMAIL ?? "follyb2810+buyer@gmail.com";

  await ensureDevUser({
    email: adminEmail,
    name: "Administrator",
    password: devPassword,
    roles: ["USER", "CREATOR", "MODERATOR", "ADMIN", "SUPERADMIN"],
  });

  await ensureDevUser({
    email: sellerEmail,
    name: "Book Seller",
    password: process.env.SELLER_PASSWORD ?? devPassword,
    roles: ["USER", "CREATOR"],
  });

  await ensureDevUser({
    email: buyerEmail,
    name: "Book Buyer",
    password: process.env.BUYER_PASSWORD ?? devPassword,
    roles: ["USER"],
  });

  console.log("Dev users ready:");
  console.log(`  Admin:  ${normalizeEmail(adminEmail)}`);
  console.log(`  Seller: ${normalizeEmail(sellerEmail)}`);
  console.log(`  Buyer:  ${normalizeEmail(buyerEmail)}`);
}

async function publishSampleFestivals() {
  const sampleTitles = [
    "Olokun Festival",
    "Oshun Festival",
    "Sango Festival",
  ];
  const { count } = await prisma.festival.updateMany({
    where: { title: { in: sampleTitles }, status: "DRAFT" },
    data: { status: "PUBLISHED" },
  });
  if (count > 0) {
    console.log(`Published ${count} sample festival(s).`);
  }
}

async function seedSampleBook() {
  const title = "Ọ̀rìṣà: A Beginner's Guide to Yoruba Spirituality";
  const existing = await prisma.book.findFirst({ where: { title } });

  const sellerEmail = process.env.SELLER_EMAIL ?? "follyb2810+seller@gmail.com";
  const seller = await prisma.user.findUnique({
    where: { email: normalizeEmail(sellerEmail) },
  });
  if (!seller) return;

  const bookData = {
    title,
    author: "Kọ́jọ́dá Press",
    description:
      "An introductory guide to the Orisa, Yoruba cosmology, and cultural practices. Perfect for beginners exploring Yoruba heritage — covers major deities, festival traditions, and respectful engagement with the faith.",
    price: 4500,
    currency: "NGN",
    stock: 50,
    status: "PUBLISHED" as const,
    allowsDelivery: true,
    allowsPickup: true,
    pickupLocation: "Kọ́jọ́dá Cultural Centre, Ibadan, Oyo State",
    coverImage:
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop",
    backImage:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop",
    userId: seller.id,
  };

  if (existing) {
    await prisma.book.update({
      where: { id: existing.id },
      data: {
        userId: seller.id,
        allowsDelivery: bookData.allowsDelivery,
        allowsPickup: bookData.allowsPickup,
        pickupLocation: bookData.pickupLocation,
      },
    });
    console.log("Sample book fulfillment options updated.");
    return;
  }

  await prisma.book.create({ data: bookData });
  console.log("Sample book seeded.");
}

async function seedSampleTickets() {
  const admin = await prisma.user.findFirst({
    where: { roles: { some: { role: { name: "ADMIN" } } } },
  });
  if (!admin) return;

  const festival = await prisma.festival.findFirst({
    where: { title: "Oshun Festival" },
    include: { tickets: true },
  });
  if (!festival || festival.tickets.length > 0) return;

  await prisma.ticket.createMany({
    data: [
      {
        festivalId: festival.id,
        creatorId: admin.id,
        name: "General Admission",
        type: "single",
        isFree: false,
        price: 2000,
        quantity: 100,
        sold: 0,
      },
      {
        festivalId: festival.id,
        creatorId: admin.id,
        name: "Community (Free)",
        type: "single",
        isFree: true,
        price: null,
        quantity: 50,
        sold: 0,
      },
    ],
  });
  console.log("Sample tickets seeded for Oshun Festival.");
}

runSeedIfEmpty()
  .then(() => seedDevUsers())
  .then(() => publishSampleFestivals())
  .then(() => seedSampleBook())
  .then(() => seedSampleTickets())
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
