"use client";

import { Formik, Form, Field } from "formik";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { StepWithNextProps } from "./StepOne";
import { zodFormikValidate } from "@/utils/zodFormik";
import { stepTwoSchema } from "@/helpers/zod/event.schema";

const COUNTRIES = ["Nigeria", "Ghana", "Togo", "Benin", "Other"];

export function StepTwo({ data, setData, onNext }: StepWithNextProps) {
  return (
    <Formik
      initialValues={{
        country: data.country || "",
        eventType: data.eventType || "physical",
        location: data.location || "",
        eventLink: data.eventLink || "",
        startDate: data.startDate || "",
        startTime: data.startTime || "",
        endDate: data.endDate || "",
        endTime: data.endTime || "",
      }}
      validate={zodFormikValidate(stepTwoSchema)}
      validateOnMount
      onSubmit={(values) => {
        setData((prev) => ({ ...prev, ...values }));
        onNext();
      }}
    >
      {({ errors, touched, isValid, setFieldValue, values }) => (
        <Form className="space-y-6">
          <div className="space-y-1">
            <label className="text-sm font-medium">Country</label>
            <Select
              value={values.country}
              onValueChange={(v) => setFieldValue("country", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {touched.country && errors.country && (
              <p className="text-sm text-red-500">{errors.country}</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Event Type</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={values.eventType === "physical"}
                  onChange={() => setFieldValue("eventType", "physical")}
                />
                Physical
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={values.eventType === "virtual"}
                  onChange={() => setFieldValue("eventType", "virtual")}
                />
                Virtual
              </label>
            </div>
          </div>
          {values.eventType === "physical" && (
            <div className="space-y-1">
              <Field as={Input} name="location" placeholder="Event location" />
              {touched.location && errors.location && (
                <p className="text-sm text-red-500">{errors.location}</p>
              )}
            </div>
          )}

          {values.eventType === "virtual" && (
            <div className="space-y-1">
              <Field as={Input} name="eventLink" placeholder="Event link" />
              {touched.eventLink && errors.eventLink && (
                <p className="text-sm text-red-500">{errors.eventLink}</p>
              )}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm font-medium">Start</label>
            <div className="flex gap-2">
              <Field as={Input} type="date" name="startDate" />
              <Field as={Input} type="time" name="startTime" />
            </div>
            {touched.startDate && errors.startDate && (
              <p className="text-sm text-red-500">{errors.startDate}</p>
            )}
            {touched.startTime && errors.startTime && (
              <p className="text-sm text-red-500">{errors.startTime}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">End</label>
            <div className="flex gap-2">
              <Field as={Input} type="date" name="endDate" />
              <Field as={Input} type="time" name="endTime" />
            </div>
            {touched.endDate && errors.endDate && (
              <p className="text-sm text-red-500">{errors.endDate}</p>
            )}
            {touched.endTime && errors.endTime && (
              <p className="text-sm text-red-500">{errors.endTime}</p>
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
