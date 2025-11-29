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

interface DayDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  selectedDay?: number | null;
  dailyOrisas: Record<number, string[]>;
}

export const DayDialog: FC<DayDialogProps> = ({
  open,
  onOpenChange,
  selectedDay,
  dailyOrisas,
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-sm">
      <DialogHeader>
        <DialogTitle>Orisa for Day {selectedDay}</DialogTitle>
      </DialogHeader>
      <ul className="list-disc pl-5 space-y-1 mt-2">
        {selectedDay &&
          (dailyOrisas[selectedDay % 4 || 4] || []).map((o) => (
            <li key={o}>{o}</li>
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
