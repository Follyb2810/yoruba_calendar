"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { isAdmin, isSuperAdmin } from "@/utils/rbac";
import { Shield, UserPlus } from "lucide-react";

type TeamUser = {
  id: string;
  name: string | null;
  email: string;
  roles: string[];
  createdAt: string;
};

const CREATOR_ROLES = ["CREATOR", "MODERATOR", "ADMIN", "SUPERADMIN"] as const;

export default function TeamManagement() {
  const router = useRouter();
  const { data: session } = useSession();
  const admin = isAdmin(session?.user);
  const superAdmin = isSuperAdmin(session?.user);
  const [users, setUsers] = useState<TeamUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>("CREATOR");
  const [submitting, setSubmitting] = useState(false);

  async function loadUsers() {
    try {
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      if (res.status === 403) {
        router.replace("/dashboard");
        return;
      }
      if (!res.ok) throw new Error("Failed to load team");
      const data = await res.json();
      setUsers(data.users ?? []);
    } catch {
      toast.error("Could not load team");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (admin) loadUsers();
    else router.replace("/dashboard");
  }, [admin]);

  async function grantRole(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to grant role");

      toast.success(data.message);
      setEmail("");
      loadUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (!admin) return null;

  if (loading) {
    return (
      <p className="text-muted-foreground py-12 text-center">Loading team…</p>
    );
  }

  const grantableRoles = superAdmin
    ? CREATOR_ROLES
    : (["CREATOR", "MODERATOR"] as const);

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <Shield className="h-6 w-6 text-orange-500" />
          Team & Roles
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Upgrade members to creators or assign admin roles
        </p>
      </div>

      <form
        onSubmit={grantRole}
        className="border rounded-xl p-4 space-y-4 bg-muted/20"
      >
        <h2 className="font-medium flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Grant role
        </h2>
        <p className="text-xs text-muted-foreground">
          The person must already have an account (Google or email sign-up).
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            type="email"
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1"
            required
          />
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {grantableRoles.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="submit"
            disabled={submitting}
            className="bg-orange-500 hover:bg-orange-600"
          >
            {submitting ? "Saving…" : "Grant"}
          </Button>
        </div>
        {!superAdmin && (
          <p className="text-xs text-muted-foreground">
            Admins can grant Creator and Moderator. Only the platform owner can grant Admin roles.
          </p>
        )}
      </form>

      <div className="border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="text-left p-3 font-medium">User</th>
              <th className="text-left p-3 font-medium">Roles</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b last:border-0">
                <td className="p-3">
                  <div className="font-medium">{user.name ?? "—"}</div>
                  <div className="text-xs text-muted-foreground">{user.email}</div>
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    {user.roles.length === 0 ? (
                      <Badge variant="outline">USER</Badge>
                    ) : (
                      user.roles.map((r) => (
                        <Badge
                          key={r}
                          variant={r === "SUPERADMIN" ? "default" : "outline"}
                          className={r === "SUPERADMIN" ? "bg-orange-500" : ""}
                        >
                          {r}
                        </Badge>
                      ))
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {superAdmin && (
        <div className="text-xs text-muted-foreground border rounded-lg p-4 bg-orange-50/50 border-orange-100">
          <p className="font-medium text-foreground mb-1">Platform owner</p>
          <p>
            Your account is the owner when your email matches{" "}
            <code className="text-xs bg-muted px-1 rounded">OWNER_EMAIL</code> in{" "}
            <code className="text-xs bg-muted px-1 rounded">.env</code>. On sign-in,
            you automatically receive SUPERADMIN, ADMIN, and CREATOR roles.
          </p>
        </div>
      )}
    </div>
  );
}
