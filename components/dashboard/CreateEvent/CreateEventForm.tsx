"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import StepNavigation from "./StepNavigation";
import { StepOne } from "./StepOne";
import { StepTwo } from "./StepTwo";
import { StepThree } from "./StepThree";
import { EventFormData } from "@/types/types";

export default function CreateEventForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<EventFormData>({
    name: "",
    description: "",
    orishaId: undefined,
    country: "",
    eventType: "physical",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    startDate: "",
    endDate: "",
    ticketType: "single",
    dates: [],
  });

  const next = () => setStep((s) => Math.min(s + 1, 3));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  async function handleFinish(
    status: "DRAFT" | "PUBLISHED",
    stepThreeData?: Pick<EventFormData, "ticketType" | "tickets">
  ) {
    const merged = { ...formData, ...stepThreeData };

    if (!merged.orishaId) {
      toast.error("Please select an Orisa");
      setStep(1);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/festivals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: merged.name,
          description: merged.description,
          orisaId: merged.orishaId,
          country: merged.country,
          eventType: merged.eventType,
          location: merged.location,
          eventLink: merged.eventLink,
          timezone: merged.timezone,
          startDate: merged.startDate,
          startTime: merged.startTime,
          endDate: merged.endDate,
          endTime: merged.endTime,
          ticketType: merged.ticketType,
          status,
          tickets: merged.tickets,
          image: merged.image || undefined,
          banner: merged.banner || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 403) {
          toast.error("Creator access required");
          router.push("/dashboard/become-creator");
          return;
        }
        throw new Error(data.error || "Failed to create event");
      }

      toast.success(
        status === "PUBLISHED" ? "Event published!" : "Draft saved!"
      );
      router.push("/dashboard/events/all");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg">
      <StepNavigation step={step} />

      {step === 1 && (
        <StepOne data={formData} setData={setFormData} onNext={next} />
      )}
      {step === 2 && (
        <StepTwo data={formData} setData={setFormData} onNext={next} />
      )}
      {step === 3 && (
        <StepThree
          data={formData}
          setData={setFormData}
          onFinish={handleFinish}
          submitting={submitting}
        />
      )}

      {step > 1 && step < 3 && (
        <div className="flex justify-start mt-6">
          <button
            type="button"
            onClick={back}
            className="px-4 py-2 rounded-md border"
          >
            Back
          </button>
        </div>
      )}
    </div>
  );
}
