import { ORISA_COLORS } from "@/app/(public)/calendar/_component/mocks";

export function getOrisaColor(orisaName: string) {
  const key = Object.keys(ORISA_COLORS).find((k) => orisaName.includes(k));
  return key ? ORISA_COLORS[key] : "bg-background text-black";
}
