"use client";

import { FC } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  getOrisaDayIndex,
  getOrisaNameForDate,
} from "@/utils/getYorubaYear";
import { formatCivilDateLabel } from "@/utils/yorubaCalendar";
import type { SelectedCalendarDay } from "@/module/Calendar/calendar.types";

interface DayDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  selected: SelectedCalendarDay | null;
  dailyOrisas: Record<number, string[]>;
}

export const DayDialog: FC<DayDialogProps> = ({
  open,
  onOpenChange,
  selected,
  dailyOrisas,
}) => {
  const orisaDayIndex = selected ? getOrisaDayIndex(selected) : null;
  const orisaName = selected ? getOrisaNameForDate(selected) : null;
  const orisaList =
    orisaDayIndex != null ? dailyOrisas[orisaDayIndex] ?? [] : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {selected ? formatCivilDateLabel(selected) : "Day details"}
          </DialogTitle>
        </DialogHeader>
        {orisaName && (
          <p className="text-sm font-medium text-orange-600">{orisaName}</p>
        )}
        <ul className="list-disc pl-5 space-y-1 mt-2">
          {orisaList.map((orishaName) => (
            <li key={orishaName}>{orishaName}</li>
          ))}
        </ul>
        <div className="mt-4 flex justify-end">
          <DialogClose asChild>
            <Button>Close</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};
