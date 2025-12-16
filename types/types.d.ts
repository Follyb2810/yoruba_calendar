interface Orisa {
  id: number;
  name: string;
}

interface Festival {
  id: number;
  title: string;
  startYear: number;
  startMonth: number;
  startDay: number;
  endYear: number;
  endMonth: number;
  endDay: number;
  orisa: Orisa;
}

interface FestivalsResponse {
  festivals: Festival[];
}
export type ITicketType = "single" | "group";
export type IEventType = "physical" | "virtual";

export type EventFormData = {
  // Step 1
  name: string;
  description: string;
  orishaId?: number;

  // Step 2
  country: string;
  eventType: IEventType;
  location?: string;
  eventLink?: string;
  startTime?: string;
  endTime?: string;
  timezone: string;
  dates: Date[] | [];
  startDate: string;
  endDate: string;
  image?: File;
  banner?: File;

  // Step 3
  ticketType: ITicketType;
  tickets?: {
    name: string;
    type: ITicketType;
    isFree: boolean;
    price?: number;
    quantity?: number;
    maxPerGroup?: number;
  }[];
};
