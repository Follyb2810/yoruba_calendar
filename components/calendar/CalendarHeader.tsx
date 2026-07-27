"use client";

import { FC } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { formatMonthYearLabel, YORUBA_CALENDAR_TZ } from "@/utils/yorubaCalendar";

interface CalendarHeaderProps {
  viewYear: number;
  viewMonth: number;
  showFourDayCycle: boolean;
  setShowFourDayCycle: (v: boolean) => void;
  gotoPrevMonth: () => void;
  gotoNextMonth: () => void;
  gotoToday: () => void;
  setOrisaModalOpen: (v: boolean) => void;
  yorubaYear: number;
}

const CalendarHeader: FC<CalendarHeaderProps> = ({
  viewYear,
  viewMonth,
  showFourDayCycle,
  setShowFourDayCycle,
  gotoPrevMonth,
  gotoNextMonth,
  gotoToday,
  setOrisaModalOpen,
  yorubaYear,
}) => {
  return (
    <header className="flex flex-col gap-4 mb-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-semibold truncate">
            Kọ́jọ́dá — Yoruba Calendar
          </h1>
          <p className="text-sm text-muted-foreground truncate">
            Yoruba year starts June 3 · Dates follow {YORUBA_CALENDAR_TZ} time
          </p>
        </div>
        <div className="flex flex-wrap gap-2 justify-start sm:justify-end">
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
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-col sm:flex-row gap-2 text-sm">
          <div>
            Viewing:{" "}
            <strong>{formatMonthYearLabel(viewYear, viewMonth)}</strong>
          </div>
          <div>
            Yoruba Year: <strong>{yorubaYear}</strong>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
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
      </div>
    </header>
  );
};

export default CalendarHeader;
