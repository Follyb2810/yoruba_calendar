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
    orisha: "",
    country: "",
    eventType: "physical",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    dates: [],
    startDate: null,
    endDate: null,
    ticketType: "free",
  });

  const next = () => setStep((s) => Math.min(s + 1, 3));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg">
      <StepNavigation step={step} />

      {step === 1 && <StepOne data={formData} setData={setFormData} />}
      {step === 2 && <StepTwo data={formData} setData={setFormData} />}
      {step === 3 && <StepThree data={formData} setData={setFormData} />}

      <div className="flex justify-between mt-6">
        {step > 1 && <button onClick={back}>Back</button>}
        {step < 3 ? (
          <button onClick={next} className="btn-primary">
            Next
          </button>
        ) : (
          <button className="btn-primary">Create Event</button>
        )}
      </div>
    </div>
  );
}
