"use client";
import { useState } from "react";
import StepNavigation from "./StepNavigation";
import { StepOne } from "./StepOne";
import { StepTwo } from "./StepTwo";
import { StepThree } from "./StepThree";
import { EventFormData } from "@/types/types";

export default function CreateEventForm() {
  const [step, setStep] = useState(1);
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

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg">
      <StepNavigation step={step} />

      {step === 1 && (
        <StepOne data={formData} setData={setFormData} onNext={next} />
      )}
      {step === 2 && (
        <StepTwo data={formData} setData={setFormData} onNext={next} />
      )}
      {step === 3 && <StepThree data={formData} setData={setFormData} />}

      {step > 1 && (
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
