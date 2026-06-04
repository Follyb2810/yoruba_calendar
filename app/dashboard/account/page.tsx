import Link from "next/link";
import { auth } from "@/utils/auth";
import { prisma } from "@/utils/prisma-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AccountPage() {
  const session = await auth();

  const user = session?.user?.id
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          password: true,
          accounts: { select: { provider: true } },
        },
      })
    : null;

  const hasPassword = !!user?.password;
  const hasGoogle = user?.accounts.some((a) => a.provider === "google") ?? false;

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
          <p>
            <span className="text-muted-foreground">Sign-in methods:</span>{" "}
            {[hasGoogle && "Google", hasPassword && "Email & Password"]
              .filter(Boolean)
              .join(", ") || "—"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {!hasPassword && hasGoogle ? (
            <p className="text-muted-foreground">
              You signed in with Google. Add a password to also sign in with your
              email address.
            </p>
          ) : (
            <p className="text-muted-foreground">
              Update your password or change it if you signed in with Google.
            </p>
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
