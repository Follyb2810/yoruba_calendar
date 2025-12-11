"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { hasRole } from "@/utils/rbac";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user) {
      router.replace("/");
    }
  }, [session, status, router]);

  if (!session?.user) {
    return <p>Loading...</p>;
  }

  const user = session.user;

  return (
    <div>
      <h1>Dashboard</h1>

      {hasRole(user, "USER") && <p>Your personal calendar</p>}
      {hasRole(user, "CREATOR") && <p>Create new festivals</p>}
      {hasRole(user, "MODERATOR") && <p>Moderate content</p>}
      {hasRole(user, "ADMIN") && <p>Admin panel</p>}
      {hasRole(user, "SUPERADMIN") && <p>Super Admin panel</p>}
    </div>
  );
}
