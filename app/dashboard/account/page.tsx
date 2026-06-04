import Link from "next/link";
import { auth } from "@/utils/auth";
import { prisma } from "@/utils/prisma-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isAdmin, isCreator, isSuperAdmin } from "@/utils/rbac";

export default async function AccountPage() {
  const session = await auth();

  const user = session?.user?.id
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          password: true,
          accounts: { select: { provider: true } },
          roles: { include: { role: { select: { name: true } } } },
        },
      })
    : null;

  const hasPassword = !!user?.password;
  const hasGoogle = user?.accounts.some((a) => a.provider === "google") ?? false;
  const roles = user?.roles.map((r) => r.role.name) ?? session?.user?.roles ?? [];
  const creator = isCreator(session?.user);
  const admin = isAdmin(session?.user);
  const superAdmin = isSuperAdmin(session?.user);

  return (
    <section className="max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Account</h1>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="text-muted-foreground">Name:</span>{" "}
            {session?.user?.name ?? "—"}
          </p>
          <p>
            <span className="text-muted-foreground">Email:</span>{" "}
            {session?.user?.email}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground">Roles:</span>
            {(roles.length ? roles : ["USER"]).map((role) => (
              <Badge key={role} variant="outline">
                {role}
              </Badge>
            ))}
          </div>
          <p>
            <span className="text-muted-foreground">Sign-in:</span>{" "}
            {[hasGoogle && "Google", hasPassword && "Email & Password"]
              .filter(Boolean)
              .join(", ") || "—"}
          </p>
        </CardContent>
      </Card>

      {!creator && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader>
            <CardTitle className="text-lg">Become a Creator</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Publish festivals and list physical books — free and instant.
            </p>
            <Button asChild className="bg-orange-500 hover:bg-orange-600">
              <Link href="/dashboard/become-creator">Get Creator Access</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {admin && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Team management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Grant creator or admin roles to other members.
            </p>
            <Button asChild variant="outline">
              <Link href="/dashboard/team">Manage Team</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {superAdmin && (
        <Card className="border-orange-200 bg-orange-50/30">
          <CardHeader>
            <CardTitle className="text-lg">Platform owner</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              You have SUPERADMIN access. Set{" "}
              <code className="text-xs bg-muted px-1 rounded">OWNER_EMAIL</code> in
              your <code className="text-xs bg-muted px-1 rounded">.env</code> to
              your email so any new sign-in from that address gets full platform
              roles automatically.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {!hasPassword && hasGoogle ? (
            <p className="text-muted-foreground">
              You signed in with Google. Add a password to also sign in with email.
            </p>
          ) : (
            <p className="text-muted-foreground">Update your account password.</p>
          )}
          <Button asChild variant="outline">
            <Link href="/updatepassword">
              {hasPassword ? "Update Password" : "Add Password"}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
