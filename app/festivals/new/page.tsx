"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectItem,
  SelectContent,
} from "@/components/ui/select";

export default function NewFestivalPage() {
  const [title, setTitle] = useState("");
  const [orisaId, setOrisaId] = useState<number | null>(null);
  const [orisas, setOrisas] = useState([]);

  const [startMonth, setStartMonth] = useState("1");
  const [startDay, setStartDay] = useState("1");
  const [endMonth, setEndMonth] = useState("1");
  const [endDay, setEndDay] = useState("1");

  // Load Orisas
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/orisha");
      const data = await res.json();
      setOrisas(data);
    })();
  }, []);

  async function submitFestival() {
    await fetch("/api/festivals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        orisaId,
        startMonth: Number(startMonth),
        startDay: Number(startDay),
        endMonth: Number(endMonth),
        endDay: Number(endDay),
      }),
    });

    alert("Festival created!");
  }

  return (
    <div className="max-w-xl mx-auto pt-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Create Festival</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Festival Name</label>
            <Input
              placeholder="Egungun Festival"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Orisa</label>
            <Select onValueChange={(v) => setOrisaId(Number(v))}>
              <SelectTrigger>
                <SelectValue placeholder="Choose Orisa" />
              </SelectTrigger>
              <SelectContent>
                {orisas.map((o: any) => (
                  <SelectItem key={o.id} value={String(o.id)}>
                    {o.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Start Date</label>
            <div className="flex gap-2">
              <Select value={startMonth} onValueChange={setStartMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i + 1} value={String(i + 1)}>
                      Month {i + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={startDay} onValueChange={setStartDay}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 31 }, (_, i) => (
                    <SelectItem key={i + 1} value={String(i + 1)}>
                      {i + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium">End Date</label>
            <div className="flex gap-2">
              <Select value={endMonth} onValueChange={setEndMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i + 1} value={String(i + 1)}>
                      Month {i + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={endDay} onValueChange={setEndDay}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 31 }, (_, i) => (
                    <SelectItem key={i + 1} value={String(i + 1)}>
                      {i + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button className="w-full" onClick={submitFestival}>
            Create Festival
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
