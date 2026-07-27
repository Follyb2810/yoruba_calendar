export type IFestive = {
  id: string;
  title: string;
  start: { m: number; d: number };
  end: { m: number; d: number };
};

export type SelectedCalendarDay = {
  year: number;
  month: number;
  day: number;
};
