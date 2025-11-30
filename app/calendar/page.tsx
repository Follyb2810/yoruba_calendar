"use client";
import { useMemo, useState } from "react";
import { ORISA_DAILY, ORISA_NAMES } from "./_component/mocks";
import CalendarHeader from "./_component/CalendarHeader";
import {
  daysInMonth,
  getYorubaYear,
  startOfMonth,
} from "@/utils/getYorubaYear";
import CalendarGrid from "./_component/CalendarGrid";
import { OrisaDialog } from "./_component/OrisaDialog";
import { DayDialog } from "./_component/DayDialog";

export default function Page() {
  const today = new Date();
  const [cursor, setCursor] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [showFourDayCycle, setShowFourDayCycle] = useState(true);
  const [orisaModalOpen, setOrisaModalOpen] = useState(false);
  const [dayModalOpen, setDayModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const grid = useMemo(() => {
    const start = startOfMonth(cursor);
    const dim = daysInMonth(start);
    const firstWeekday = start.getDay();
    const cells: ({ date: Date } | null)[] = [];
    for (let i = 0; i < firstWeekday; i++) cells.push(null);

    for (let d = 1; d <= dim; d++) {
      const date = new Date(start.getFullYear(), start.getMonth(), d);
      cells.push({ date });
    }

    while (cells.length % 7 !== 0) cells.push(null);

    return cells;
  }, [cursor]);

  function gotoPrevMonth() {
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1));
  }
  function gotoNextMonth() {
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1));
  }
  function gotoToday() {
    setCursor(new Date(today.getFullYear(), today.getMonth(), 1));
  }
  function openDayModal(day: number) {
    setSelectedDay(day);
    setDayModalOpen(true);
  }

  return (
    <div className="p-6">
      <CalendarHeader
        cursor={cursor}
        showFourDayCycle={showFourDayCycle}
        setShowFourDayCycle={setShowFourDayCycle}
        gotoPrevMonth={gotoPrevMonth}
        gotoNextMonth={gotoNextMonth}
        gotoToday={gotoToday}
        setOrisaModalOpen={setOrisaModalOpen}
        getYorubaYear={getYorubaYear}
      />

      <CalendarGrid
        grid={grid}
        showFourDayCycle={showFourDayCycle}
        today={today}
        openDayModal={openDayModal}
      />

      <OrisaDialog
        open={orisaModalOpen}
        onOpenChange={setOrisaModalOpen}
        names={ORISA_NAMES}
      />
      <DayDialog
        open={dayModalOpen}
        onOpenChange={setDayModalOpen}
        selectedDay={selectedDay}
        dailyOrisas={ORISA_DAILY}
      />
    </div>
  );
}
