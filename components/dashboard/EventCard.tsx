"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
export type IEventCard = {
  onClick?: () => void;
  title?: string;
};
export default function EventCard({
  onClick,
  title = "You have no events!",
}: IEventCard) {
  const { push } = useRouter();
  return (
    <Card className="flex items-center justify-center h-[420px]">
      <CardContent className="text-center space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
          <CalendarDays className="h-8 w-8 text-orange-500" />
        </div>
        <CardHeader className="p-0">
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Click on the “Add new event” button below to create your first Yorùbá
          calendar event.
        </p>
        <Button
          className="bg-orange-500 hover:bg-orange-600 gap-2"
          onClick={() => push("/dashboard/events/new")}
        >
          <Plus className="h-4 w-4" /> Add new event
        </Button>
      </CardContent>
    </Card>
  );
}
