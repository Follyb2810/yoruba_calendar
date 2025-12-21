"use client";

import { Formik, Form, Field, FieldArray } from "formik";
import { zodFormikValidate } from "@/utils/zodFormik";
import { StepProps } from "./StepOne";
import { stepThreeSchema } from "@/helpers/zod/event.schema";
import { Input } from "@/components/ui/input";
import { ITicketType } from "@/types/types";

export function StepThree({ data, setData }: StepProps) {
  return (
    <Formik
      initialValues={{
        ticketType: data.ticketType || "single",
        tickets: data.tickets?.map((t) => ({
          name: t.name || "",
          type: (t.type ?? data.ticketType) as ITicketType,
          isFree: t.isFree ?? true,
          price: t.price ?? 0,
          quantity: t.quantity ?? 1, // total available
          maxPerGroup:
            t.maxPerGroup ?? (data.ticketType === "group" ? 1 : undefined),
        })) ?? [
          {
            name: "",
            type: data.ticketType as ITicketType,
            isFree: true,
            price: 0,
            quantity: 1,
            maxPerGroup: data.ticketType === "group" ? 1 : undefined,
          },
        ],
      }}
      validate={zodFormikValidate(stepThreeSchema)}
      validateOnMount
      onSubmit={(values) => {
        const safeValues = {
          ...values,
          tickets: values.tickets.map((t) => ({
            ...t,
            type: t.type as "single" | "group",
          })),
        };
        setData((prev) => ({ ...prev, ...safeValues }));
      }}
    >
      {({ errors, touched, isValid, setFieldValue, values }) => (
        <Form className="space-y-4">
          {/* Ticket type selection */}
          <div className="flex flex-col gap-2">
            {(["single", "group"] as ITicketType[]).map((type) => (
              <label key={type} className="flex items-center gap-2">
                <Field
                  type="radio"
                  name="ticketType"
                  value={type}
                  checked={values.ticketType === type}
                  onChange={() => setFieldValue("ticketType", type)}
                />
                {type === "single" ? "Single Ticket" : "Group Ticket"}
              </label>
            ))}
          </div>

          {/* Tickets FieldArray */}
          <FieldArray name="tickets">
            {({ push, remove }) => (
              <div className="space-y-4">
                {values.tickets.map((ticket, index) => (
                  <div
                    key={index}
                    className="p-4 border rounded-md flex flex-col gap-2"
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold">Ticket {index + 1}</h4>
                      {values.tickets.length > 1 && (
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="text-red-500"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <Field
                      as={Input}
                      name={`tickets.${index}.name`}
                      placeholder="Ticket Name"
                    />

                    {/* Free vs Paid */}
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2">
                        <Field
                          type="radio"
                          name={`tickets.${index}.isFree`}
                          value="true"
                          checked={ticket.isFree}
                          onChange={() =>
                            setFieldValue(`tickets.${index}.isFree`, true)
                          }
                        />
                        Free
                      </label>
                      <label className="flex items-center gap-2">
                        <Field
                          type="radio"
                          name={`tickets.${index}.isFree`}
                          value="false"
                          checked={!ticket.isFree}
                          onChange={() =>
                            setFieldValue(`tickets.${index}.isFree`, false)
                          }
                        />
                        Paid
                      </label>
                    </div>

                    {!ticket.isFree && (
                      <Field
                        as={Input}
                        type="number"
                        name={`tickets.${index}.price`}
                        placeholder="Price"
                        min={0}
                      />
                    )}

                    {/* Max per group for group tickets */}
                    {values.ticketType === "group" && (
                      <Field
                        as={Input}
                        type="number"
                        name={`tickets.${index}.maxPerGroup`}
                        placeholder="Max per person/group"
                        min={1}
                      />
                    )}

                    {/* Quantity available */}
                    <Field
                      as={Input}
                      type="number"
                      name={`tickets.${index}.quantity`}
                      placeholder="Total Quantity"
                      min={1}
                    />
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() =>
                    push({
                      name: "",
                      type: values.ticketType,
                      isFree: true,
                      price: 0,
                      quantity: 1,
                      maxPerGroup:
                        values.ticketType === "group" ? 1 : undefined,
                    })
                  }
                  className="px-4 py-2 bg-gray-200 rounded-md"
                >
                  Add Ticket
                </button>
              </div>
            )}
          </FieldArray>

          {/* Submit */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={!isValid}
              className={`px-6 py-2 rounded-md text-white transition ${
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
