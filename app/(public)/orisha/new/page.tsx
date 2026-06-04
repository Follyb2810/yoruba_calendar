import { redirect } from "next/navigation";
import { auth } from "@/utils/auth";
import { isAdmin } from "@/utils/rbac";

/** Orisa creation is admin-only — not a public action. */
export default async function LegacyNewOrisaPage() {
  const session = await auth();

  if (!session) {
    redirect("/signin?callbackUrl=/orisha");
  }

  if (!isAdmin(session.user)) {
    redirect("/orisha");
  }

  redirect("/dashboard/team");
}
