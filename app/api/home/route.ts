import { runSeedIfEmpty } from "@/utils/seed";
import { NextApiRequest } from "next";
import { NextResponse } from "next/server";

export async function GET(req: NextApiRequest) {
  const res = runSeedIfEmpty();
  return NextResponse.json("Thank you");
}
