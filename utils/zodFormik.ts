import { ZodSchema } from "zod";

export const zodFormikValidate =
  <T>(schema: ZodSchema<T>) =>
  (values: T) => {
    const result = schema.safeParse(values);

    if (result.success) return {};

    return result.error.flatten().fieldErrors;
  };