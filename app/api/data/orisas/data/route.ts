import { FESTIVALS } from "../../orisas-festivals";

export async function GET() {
  return new Response(JSON.stringify(FESTIVALS), {
    headers: { "Content-Type": "application/json" },
  });
}
