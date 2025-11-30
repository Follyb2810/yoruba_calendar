"use client";
import { getBusinessWeekDayName } from "@/utils/getBusinessWeekDayName";
import { getOrisaColor } from "@/utils/getOrisaColor";
import { getOrisaNameForDate } from "@/utils/getYorubaYear";
import { FC } from "react";

interface GridCell {
  date: Date;
  festivals: any[];
}

interface CalendarGridProps {
  grid: (GridCell | null)[];
  showFourDayCycle: boolean;
  today: Date;
  openDayModal: (day: number) => void;
}

const CalendarGrid: FC<CalendarGridProps> = ({
  grid,
  showFourDayCycle,
  today,
  openDayModal,
}) => {
  return (
    <div className="overflow-x-auto">
      <div className="grid grid-cols-7 gap-1 bg-card rounded overflow-hidden border text-[10px] sm:text-xs md:text-sm min-w-[600px]">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div
            key={d}
            className="py-2 text-center font-semibold text-muted-foreground bg-muted border-b"
          >
            {d}
          </div>
        ))}
        {grid.map((cell, i) => {
          if (!cell)
            return (
              <div key={i} className="p-2 border min-h-[90px] bg-muted/40" />
            );
          const { date, festivals } = cell;
          const isToday = date.toDateString() === today.toDateString();
          const orisaName = showFourDayCycle ? getOrisaNameForDate(date) : "";
          const orisaColor = showFourDayCycle ? getOrisaColor(orisaName) : "";
          const [bgClass, textClass] = orisaColor.split(" ");
          const businessName = getBusinessWeekDayName(date);
          return (
            <div
              key={i}
              className={`p-1 sm:p-2 border min-h-[70px] sm:min-h-[90px] ${bgClass} ${textClass} ${
                isToday ? "today-dotted" : ""
              }`}
              onClick={() => openDayModal(date.getDate())}
            >
              <div className="flex justify-between items-start">
                <div className="text-sm font-medium">{date.getDate()}</div>
                <div className="text-xs">{businessName}</div>
              </div>
              {showFourDayCycle && (
                <div className="mt-1 text-xs text-[11px] font-semibold">
                  {orisaName}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarGrid;
