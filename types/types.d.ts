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

export type EventFormData = {
  // Step 1
  name: string;
  description: string;
  orishaId: number;

  // Step 2
  country: string;
  eventType: "physical" | "virtual";
  location?: string;
  eventLink?: string;
  endTime?: string;
  startTime?: string;
  timezone: string;
  dates: Date[] | [];
  startDate: string;
  endDate: string;
  image?: File;
  banner?: File;

  // Step 3
  ticketType: "free" | "single" | "group";
  tickets?: {
    name: string;
    price: number;
    quantity?: number;
    maxPerGroup?: number;
  }[];
};
