import { redirect } from "next/navigation";
import { auth } from "@/utils/auth";
import { isCreator } from "@/utils/rbac";

/** Legacy route — event creation lives in the creator dashboard. */
export default async function LegacyNewFestivalPage() {
  const session = await auth();

  if (!session) {
    redirect("/signin?callbackUrl=/dashboard/events/new");
  }

  if (!isCreator(session.user)) {
    redirect("/dashboard/become-creator");
  }

  redirect("/dashboard/events/new");
}
