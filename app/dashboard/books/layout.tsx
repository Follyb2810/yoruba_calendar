import { auth } from "@/utils/auth";
import { canPublishContent } from "@/utils/rbac";
import { redirect } from "next/navigation";

export default async function CreatorBooksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/signin?callbackUrl=/dashboard/books");
  }

  if (!canPublishContent(session.user)) {
    redirect("/dashboard/become-creator");
  }

  return <>{children}</>;
}
