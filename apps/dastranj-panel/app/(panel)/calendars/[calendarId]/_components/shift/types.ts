export type CalendarShiftDayContext = {
  date: string;
  weekdayName: string;
  isHoliday?: boolean;
};

export type CalendarShiftWizardCalendar = {
  id: string;
  title: string;
  description: string | null;
  yearLabel: string;
  startDate: string;
  endDate: string;
  weekends: string[];
  singleHolidays: Array<{ id: string; title: string; date: string }>;
};
