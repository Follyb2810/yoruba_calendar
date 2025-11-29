"use client";
import { FC } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

interface CalendarHeaderProps {
  cursor: Date;
  showFourDayCycle: boolean;
  setShowFourDayCycle: (v: boolean) => void;
  gotoPrevMonth: () => void;
  gotoNextMonth: () => void;
  gotoToday: () => void;
  setOrisaModalOpen: (v: boolean) => void;
  getYorubaYear: (date: Date) => number;
}

const CalendarHeader: FC<CalendarHeaderProps> = ({
  cursor,
  showFourDayCycle,
  setShowFourDayCycle,
  gotoPrevMonth,
  gotoNextMonth,
  gotoToday,
  setOrisaModalOpen,
  getYorubaYear,
}) => {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
      <div className="flex-1">
        <h1 className="text-2xl font-semibold">Kọ́jọ́dá — Yoruba Calendar</h1>
        <p className="text-sm text-muted-foreground">
          Yoruba year starts June 3 • Toggle Orisa 4-day cycle
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button onClick={gotoPrevMonth} variant="ghost">
          Prev
        </Button>
        <Button onClick={gotoToday} variant="outline">
          Today
        </Button>
        <Button onClick={gotoNextMonth} variant="ghost">
          Next
        </Button>
      </div>
      <div className="flex flex-wrap gap-3 text-sm mt-2 sm:mt-0">
        <div>
          Viewing:{" "}
          <strong>
            {cursor.toLocaleString(undefined, {
              month: "long",
              year: "numeric",
            })}
          </strong>
        </div>
        <div>
          Yoruba Year: <strong>{getYorubaYear(cursor)}</strong>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-2 sm:mt-0">
        <div className="flex items-center gap-2 text-sm">
          <Switch
            checked={showFourDayCycle}
            onCheckedChange={setShowFourDayCycle}
          />
          <span>Show 4-day Orisa cycle</span>
        </div>
        <Button onClick={() => setOrisaModalOpen(true)} variant="outline">
          Show All Orisa
        </Button>
      </div>
    </header>
  );
};

export default CalendarHeader;
