import type { SerializedFestival } from "@/utils/serializeFestival";

export type ITicketType = "single" | "group";
export type IEventType = "physical" | "virtual";

export type EventFormData = {
  name: string;
  description: string;
  orishaId?: number;
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

export type { SerializedFestival as Festival };
