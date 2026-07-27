"use client";

import { useMemo, useState } from "react";
import { ORISA_DAILY, ORISA_NAMES } from "@/module/Calendar/calendar.data";
import { buildMonthGrid } from "@/module/Calendar/calendar.service";
import type { SelectedCalendarDay } from "@/module/Calendar/calendar.types";
import { getYorubaYearForMonthView } from "@/utils/getYorubaYear";
import {
  getCalendarDateParts,
  type CalendarDateParts,
} from "@/utils/yorubaCalendar";
import CalendarHeader from "./CalendarHeader";
import CalendarGrid from "./CalendarGrid";
import { OrisaDialog } from "./OrisaDialog";
import { DayDialog } from "./DayDialog";

export default function CalendarView() {
  const todayLagos = useMemo(() => getCalendarDateParts(new Date()), []);
  const [viewYear, setViewYear] = useState(todayLagos.year);
  const [viewMonth, setViewMonth] = useState(todayLagos.month);
  const [showFourDayCycle, setShowFourDayCycle] = useState(true);
  const [orisaModalOpen, setOrisaModalOpen] = useState(false);
  const [dayModalOpen, setDayModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<SelectedCalendarDay | null>(
    null
  );

  const yorubaYear = useMemo(
    () => getYorubaYearForMonthView(viewYear, viewMonth, todayLagos),
    [viewYear, viewMonth, todayLagos]
  );

  const grid = useMemo(
    () => buildMonthGrid(viewYear, viewMonth),
    [viewYear, viewMonth]
  );

  function gotoPrevMonth() {
    if (viewMonth === 1) {
      setViewYear((y) => y - 1);
      setViewMonth(12);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function gotoNextMonth() {
    if (viewMonth === 12) {
      setViewYear((y) => y + 1);
      setViewMonth(1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  function gotoToday() {
    setViewYear(todayLagos.year);
    setViewMonth(todayLagos.month);
  }

  function openDayModal(cell: CalendarDateParts) {
    setSelectedDay({
      year: cell.year,
      month: cell.month,
      day: cell.day,
    });
    setDayModalOpen(true);
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 space-y-16">
      <CalendarHeader
        viewYear={viewYear}
        viewMonth={viewMonth}
        showFourDayCycle={showFourDayCycle}
        setShowFourDayCycle={setShowFourDayCycle}
        gotoPrevMonth={gotoPrevMonth}
        gotoNextMonth={gotoNextMonth}
        gotoToday={gotoToday}
        setOrisaModalOpen={setOrisaModalOpen}
        yorubaYear={yorubaYear}
      />

      <CalendarGrid
        grid={grid}
        showFourDayCycle={showFourDayCycle}
        today={todayLagos}
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
        selected={selectedDay}
        dailyOrisas={ORISA_DAILY}
      />
    </div>
  );
}
