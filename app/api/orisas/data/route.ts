// import { FESTIVALS } from "../../orisas-festivals";

import { FESTIVALS } from "@/prisma/seed-data";

export async function GET() {
  return new Response(JSON.stringify(FESTIVALS), {
    headers: { "Content-Type": "application/json" },
  });
}
