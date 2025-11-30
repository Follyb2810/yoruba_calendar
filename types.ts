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
