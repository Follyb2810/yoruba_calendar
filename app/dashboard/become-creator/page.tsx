"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isCreator } from "@/utils/rbac";
import { BookOpen, CalendarDays, CheckCircle, Sparkles } from "lucide-react";

export default function BecomeCreatorPage() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);
  const alreadyCreator = isCreator(session?.user);

  async function handleApply() {
    setLoading(true);
    try {
      const res = await fetch("/api/creator/apply", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to apply");

      await update();
      toast.success(data.message);
      router.push("/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (alreadyCreator) {
    return (
      <Card className="max-w-lg mx-auto">
        <CardHeader className="text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
          <CardTitle>You&apos;re a Creator!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            You can publish events and list books in the shop.
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Button asChild variant="outline">
              <a href="/dashboard/events/new">Create Event</a>
            </Button>
            <Button asChild className="bg-orange-500 hover:bg-orange-600">
              <a href="/dashboard/books/new">Add Book</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <section className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <Sparkles className="h-10 w-10 text-orange-500 mx-auto" />
        <h1 className="text-2xl font-bold">Become a Creator</h1>
        <p className="text-muted-foreground">
          Share Yoruba culture with the world — publish festivals and sell books
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6 space-y-2">
            <CalendarDays className="h-8 w-8 text-orange-500" />
            <h3 className="font-semibold">Publish Events</h3>
            <p className="text-sm text-muted-foreground">
              Create festival listings with tickets, dates, and Orisa associations.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 space-y-2">
            <BookOpen className="h-8 w-8 text-orange-500" />
            <h3 className="font-semibold">List Physical Books</h3>
            <p className="text-sm text-muted-foreground">
              Upload cover photos, set delivery or pickup options, and accept orders via Paystack.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6 text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Creator access is free. Click below to get started instantly.
          </p>
          <Button
            onClick={handleApply}
            disabled={loading}
            size="lg"
            className="bg-orange-500 hover:bg-orange-600"
          >
            {loading ? "Activating…" : "Activate Creator Access"}
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
