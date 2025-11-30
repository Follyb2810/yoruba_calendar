"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BackButton({
  label = "Padà (Back)",
}: {
  label?: string;
}) {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      onClick={() => router.back()}
      className="flex items-center gap-2 text-base py-3"
    >
      <ArrowLeft className="w-4 h-4" />
      {label}
    </Button>
  );
}
