import { IFestive } from "./calendar.types";

export const YORUBA_YEAR_OFFSET = 8042;
export const ORISA_NAMES = [
  "Ọ̀ṣẹ̀ Obatala",
  "Ọ̀ṣẹ̀ Ifá/Orunmila",
  "Ọ̀ṣẹ̀ Ogun",
  "Ọ̀ṣẹ̀ Sango",
];
export const ORISA_DAILY: Record<number, string[]> = {
  1: [
    "Ọbàtálá/Òrìṣà Ńlá",
    "Yemòó",
    "Èṣù",
    "Egúngún",
    "Ẹgbẹ́-Ọ̀gbà/Alárá-Igbó",
    "Orò",
    "Ẹ̀lúkú",
    " Agẹmọ",
    "Òrìṣà Òkè",
    "Ògìyán/Ògìrìyán",
  ],
  2: ["Ifá/Ọ̀rúnmìlà", "Ọ̀ṣun", "Ọ̀sanyìn", "Yemọja", "Olókun", "Ẹ̀là"],
  3: ["Ògún", "Ìja", "Ọ̀ṣọ́ọ̀sì", "Òrìṣà-Oko", "Erinlẹ̀"],
  4: [
    "Ṣàngó/Jàkúta",
    "Ọya",
    "Baáyànnì",
    "Aganjú",
    "Ọbalúayé/Ṣànpọ̀nná",
    "Nàná-Bùkúù",
  ],
};
export const ORISA_COLORS: Record<string, string> = {
  Obatala: "bg-white text-black",
  Orunmila: "bg-green-200 text-black",
  Ogun: "bg-green-600 text-white",
  Sango: "bg-red-500 text-white",
  Yemoja: "bg-blue-400 text-white",
  Oshun: "bg-yellow-300 text-black",
  Elegba: "bg-red-800 text-white",
  Oya: "bg-purple-500 text-white",
  Olokun: "bg-blue-900 text-white",
  Egungun:
    "bg-gradient-to-r from-red-400 via-yellow-400 to-blue-400 text-black",
  Shopona: "bg-red-700 text-white",
};

export const FESTIVALS: IFestive[] = [
  {
    id: "olokun",
    title: "Olokún (Sea & sailors)",
    start: { m: 2, d: 21 },
    end: { m: 2, d: 25 },
  },
  {
    id: "men_rites",
    title: "Rites of passage (men)",
    start: { m: 3, d: 12 },
    end: { m: 3, d: 28 },
  },
  {
    id: "oduduwa",
    title: "Oduduwa (Earth)",
    start: { m: 3, d: 15 },
    end: { m: 3, d: 19 },
  },
  {
    id: "oshosi",
    title: "Oshosi (Hunt)",
    start: { m: 3, d: 21 },
    end: { m: 3, d: 24 },
  },
  {
    id: "ogun_mar",
    title: "Ogun (Metal & craft)",
    start: { m: 3, d: 21 },
    end: { m: 3, d: 24 },
  },
  {
    id: "oshun",
    title: "Oshun (Fertility)",
    start: { m: 4, d: 24 },
    end: { m: 4, d: 30 },
  },
  {
    id: "egungun",
    title: "Egungun (Ancestors)",
    start: { m: 5, d: 25 },
    end: { m: 6, d: 1 },
  },
  {
    id: "yoruba_new_year",
    title: "Yoruba New Year (Okudu 3)",
    start: { m: 6, d: 3 },
    end: { m: 6, d: 3 },
  },
  {
    id: "shopona",
    title: "Shopona & Osanyin",
    start: { m: 6, d: 7 },
    end: { m: 6, d: 8 },
  },
  {
    id: "women_rites",
    title: "Rites of passage (women)",
    start: { m: 6, d: 10 },
    end: { m: 6, d: 23 },
  },
  {
    id: "yemoja",
    title: "Yemoja (Matriarch)",
    start: { m: 6, d: 18 },
    end: { m: 6, d: 21 },
  },
  {
    id: "ifa_mass",
    title: "Ọrúnmilà / Ifá gatherings",
    start: { m: 7, d: 1 },
    end: { m: 7, d: 14 },
  },
  {
    id: "elegba",
    title: "Ẹlégba / Eṣu",
    start: { m: 7, d: 12 },
    end: { m: 7, d: 14 },
  },
  {
    id: "sango",
    title: "Ṣàngó (Thunder)",
    start: { m: 7, d: 15 },
    end: { m: 7, d: 21 },
  },
  {
    id: "ogun_aug",
    title: "Ogun (August weekend)",
    start: { m: 8, d: 25 },
    end: { m: 8, d: 31 },
  },
  {
    id: "oya_osun",
    title: "Oya / Ọwaro Osun (Ijebu)",
    start: { m: 10, d: 15 },
    end: { m: 10, d: 21 },
  },
  {
    id: "shigidi",
    title: "Shigidi (Òrún-Apadi)",
    start: { m: 10, d: 30 },
    end: { m: 10, d: 30 },
  },
  {
    id: "obajulaiye",
    title: "Obajulaiye (Commerce)",
    start: { m: 12, d: 15 },
    end: { m: 12, d: 15 },
  },
];
