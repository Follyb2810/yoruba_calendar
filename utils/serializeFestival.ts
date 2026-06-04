import { FestivalWithInclude } from "@/module/Festival/festival.types";
import { isFestivalEnded } from "./formatDate";

export type SerializedFestival = {
  id: number;
  title: string;
  description: string;
  country: string;
  eventType: string;
  location: string | null;
  eventLink: string | null;
  timezone: string;
  startDate: string;
  endDate: string;
  startTime: string | null;
  endTime: string | null;
  ticketType: string;
  status: string;
  isEnded: boolean;
  image: string | null;
  banner: string | null;
  orisa: { id: number; name: string };
  user?: { id: string; name: string | null; email: string };
  tickets?: {
    id: number;
    name: string;
    type: string;
    isFree: boolean;
    price: number | null;
    quantity: number;
    maxPerGroup: number | null;
    sold: number;
  }[];
  createdAt: string;
  updatedAt: string;
};

export function serializeFestival(
  festival: FestivalWithInclude
): SerializedFestival {
  return {
    id: festival.id,
    title: festival.title,
    description: festival.description,
    country: festival.country,
    eventType: festival.eventType,
    location: festival.location,
    eventLink: festival.eventLink,
    timezone: festival.timezone,
    startDate: festival.startDate.toISOString(),
    endDate: festival.endDate.toISOString(),
    startTime: festival.startTime,
    endTime: festival.endTime,
    ticketType: festival.ticketType,
    status: festival.status,
    isEnded: isFestivalEnded(festival.endDate),
    image: festival.image,
    banner: festival.banner,
    orisa: { id: festival.orisa.id, name: festival.orisa.name },
    user: festival.user
      ? {
          id: festival.user.id,
          name: festival.user.name,
          email: festival.user.email,
        }
      : undefined,
    tickets: festival.tickets?.map((t) => ({
      id: t.id,
      name: t.name,
      type: t.type,
      isFree: t.isFree,
      price: t.price,
      quantity: t.quantity,
      maxPerGroup: t.maxPerGroup,
      sold: t.sold,
    })),
    createdAt: festival.createdAt.toISOString(),
    updatedAt: festival.updatedAt.toISOString(),
  };
}
