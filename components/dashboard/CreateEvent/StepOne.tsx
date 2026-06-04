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
import { Label } from "@/components/ui/label";
import ImageUpload from "@/components/shared/ImageUpload";

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
        setData((prev) => ({ ...prev, ...values }));
        onNext();
      }}
    >
      {({ errors, touched, isValid, setFieldValue, values }) => (
        <Form className="space-y-6">
          <div className="space-y-1">
            <Label htmlFor="name">Event Name</Label>

            <Field as={Input} name="name" placeholder="Event name" />
            {touched.name && errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="description">Description</Label>
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
            <Label className="text-sm font-medium">Orisa</Label>
            <Select
              onValueChange={(value) =>
                setFieldValue("orishaId", Number(value))
              }
              value={values.orishaId ? String(values.orishaId) : undefined}
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

          <div className="grid sm:grid-cols-2 gap-6 pt-2">
            <ImageUpload
              label="Event poster (optional)"
              value={data.image ?? ""}
              onChange={(url) => setData((prev) => ({ ...prev, image: url }))}
              folder="yoruba_calendar/events/posters"
            />
            <ImageUpload
              label="Banner image (optional)"
              value={data.banner ?? ""}
              onChange={(url) => setData((prev) => ({ ...prev, banner: url }))}
              folder="yoruba_calendar/events/banners"
            />
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
