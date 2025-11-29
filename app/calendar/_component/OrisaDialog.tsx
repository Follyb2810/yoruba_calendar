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

interface OrisaDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  names: string[];
}

export const OrisaDialog: FC<OrisaDialogProps> = ({
  open,
  onOpenChange,
  names,
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-sm">
      <DialogHeader>
        <DialogTitle>All Orisa Names</DialogTitle>
      </DialogHeader>
      <ul className="list-disc pl-5 space-y-1 mt-2">
        {names.map((n) => (
          <li key={n}>{n}</li>
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


