"use client";
import { useEffect, useState } from "react";
import { Formik, Form, Field } from "formik";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EventFormData } from "@/types/types";
import { zodFormikValidate } from "@/utils/zodFormik";
import { stepOneSchema } from "@/helpers/zod/event.schema";

export type TOrisa = { id: number; name: string };

export type StepProps = {
  data: EventFormData;
  setData: React.Dispatch<React.SetStateAction<EventFormData>>;
};

export type StepWithNextProps = StepProps & {
  onNext: () => void;
};

export function StepOne({ data, setData, onNext }: StepWithNextProps) {
  const [orisas, setOrisas] = useState<TOrisa[]>([]);

  useEffect(() => {
    fetch("/api/orisha")
      .then((res) => res.json())
      .then(setOrisas);
  }, []);

  return (
    <Formik
      initialValues={{
        name: data.name,
        description: data.description,
        orishaId: data.orishaId ?? undefined,
      }}
      validate={zodFormikValidate(stepOneSchema)}
      validateOnMount
      onSubmit={(values) => {
        console.log({ values });
        setData((prev) => ({ ...prev, ...values }));
        onNext();
      }}
    >
      {({ errors, touched, isValid, setFieldValue }) => (
        <Form className="space-y-6">
          <div className="space-y-1">
            <Field as={Input} name="name" placeholder="Event name" />
            {touched.name && errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="space-y-1">
            <Field
              as={Textarea}
              name="description"
              placeholder="Describe your event..."
              className="min-h-[120px]"
            />
            {touched.description && errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Orisa</label>
            <Select
              onValueChange={(value) =>
                setFieldValue("orishaId", Number(value))
              }
              value={data.orishaId ? String(data.orishaId) : undefined}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose Orisa" />
              </SelectTrigger>
              <SelectContent>
                {orisas.map((o) => (
                  <SelectItem key={o.id} value={String(o.id)}>
                    {o.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {touched.orishaId && errors.orishaId && (
              <p className="text-sm text-red-500">{errors.orishaId}</p>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={!isValid}
              className={`px-6 py-2 rounded-md text-white transition
                ${
                  isValid
                    ? "bg-orange-500 hover:bg-orange-600"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
            >
              Next
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
