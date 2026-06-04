"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isCreator } from "@/utils/rbac";
import { Sparkles } from "lucide-react";

export default function CreatorGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p className="text-muted-foreground py-12 text-center">Loading…</p>;
  }

  if (!session || !isCreator(session.user)) {
    return (
      <Card className="max-w-lg mx-auto mt-8">
        <CardHeader className="text-center">
          <Sparkles className="h-10 w-10 text-orange-500 mx-auto mb-2" />
          <CardTitle>Creator access required</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Become a creator to publish events and sell books on Kọ́jọ́dá.
            It&apos;s free and instant.
          </p>
          <Button asChild className="bg-orange-500 hover:bg-orange-600">
            <Link href="/dashboard/become-creator">Become a Creator</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}
