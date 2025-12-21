import { runSeedIfEmpty } from "@/utils/seed";
import { NextApiRequest } from "next";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const res = runSeedIfEmpty();
  return NextResponse.json("Thank you");
}
