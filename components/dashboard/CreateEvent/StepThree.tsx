"use client";

import { Formik, Form, Field } from "formik";
import { zodFormikValidate } from "@/utils/zodFormik";
import { StepProps } from "./StepOne";
import { stepThreeSchema } from "@/schemas/event.schema";

export function StepThree({ data, setData }: StepProps) {
  return (
    <Formik
      initialValues={{
        ticketType: data.ticketType || "",
      }}
      validate={zodFormikValidate(stepThreeSchema)}
      validateOnMount
      onSubmit={(values) => {
        setData((prev) => ({ ...prev, ...values }));
        // onNext();
      }}
    >
      {({ errors, touched, isValid, setFieldValue, values }) => (
        <Form className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2">
              <Field
                type="radio"
                name="ticketType"
                value="free"
                checked={values.ticketType === "free"}
                onChange={() => setFieldValue("ticketType", "free")}
              />
              Free
            </label>

            <label className="flex items-center gap-2">
              <Field
                type="radio"
                name="ticketType"
                value="single"
                checked={values.ticketType === "single"}
                onChange={() => setFieldValue("ticketType", "single")}
              />
              Single Ticket
            </label>

            <label className="flex items-center gap-2">
              <Field
                type="radio"
                name="ticketType"
                value="group"
                checked={values.ticketType === "group"}
                onChange={() => setFieldValue("ticketType", "group")}
              />
              Group Ticket
            </label>
          </div>

          {touched.ticketType && errors.ticketType && (
            <p className="text-sm text-red-500">{errors.ticketType}</p>
          )}

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
              Finish
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
