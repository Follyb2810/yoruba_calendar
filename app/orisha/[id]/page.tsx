import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import BackButton from "@/components/shared/BackButton";

interface Festival {
  id: number;
  title: string;
  startDate?: string;
  endDate?: string;
}

interface Orisa {
  id: number;
  name: string;
  description?: string;
  festivals?: Festival[];
  symbolism?: string[];
  attributes?: string[];
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OrisaPage({ params }: Props) {
  const { id } = await params;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/orisha/${id}`,
    { cache: "no-store" }
  );

  if (!res.ok) notFound();

  const orisa = (await res.json()) as Orisa;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <BackButton />
        <Card className="mb-8 border-0 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <Badge
                variant="secondary"
                className="text-sm px-4 py-1 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200"
              >
                Orisa
              </Badge>
            </div>
            <CardTitle className="text-4xl font-bold bg-linear-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              {orisa.name}
            </CardTitle>
            {orisa.description && (
              <CardDescription className="text-lg mt-4 text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                {orisa.description}
              </CardDescription>
            )}
          </CardHeader>
        </Card>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2 space-y-8">
            {orisa.attributes && orisa.attributes.length > 0 && (
              <Card className="shadow-md border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-xl">Attributes & Symbols</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {orisa.attributes.map((attribute, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="px-3 py-1 text-sm bg-slate-50 dark:bg-slate-800"
                      >
                        {attribute}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {orisa.festivals && orisa.festivals.length > 0 && (
              <Card className="shadow-md border-0">
                <CardHeader>
                  <CardTitle className="text-xl">
                    Associated Festivals
                  </CardTitle>
                  <CardDescription>
                    Celebrations and ceremonies dedicated to {orisa.name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {orisa.festivals.map((festival) => (
                    <div key={festival.id} className="group">
                      <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                            {festival.title}
                          </h3>
                          {(festival.startDate || festival.endDate) && (
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                              {festival.startDate &&
                                `Starts: ${festival.startDate}`}
                              {festival.endDate &&
                                ` • Ends: ${festival.endDate}`}
                            </p>
                          )}
                        </div>
                        <Badge
                          variant="secondary"
                          className="bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                        >
                          View
                        </Badge>
                      </div>
                      <Separator className="mt-4 last:hidden" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card className="shadow-md border-0 bg-amber-50/50 dark:bg-amber-900/10">
              <CardHeader>
                <CardTitle className="text-lg">Quick Facts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">
                    Festivals
                  </span>
                  <span className="font-semibold">
                    {orisa.festivals?.length || 0}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">
                    Domain
                  </span>
                  <Badge variant="outline" className="text-xs">
                    Yoruba Tradition
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md border-0">
              <CardHeader>
                <CardTitle className="text-lg">Cultural Significance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {orisa.name} holds significant importance in Yoruba
                  spirituality and culture, with festivals and ceremonies that
                  celebrate divine attributes and community values.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
