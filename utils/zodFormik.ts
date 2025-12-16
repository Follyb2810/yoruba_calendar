import { ZodType } from "zod";

export const zodFormikValidate =
  <T>(schema: ZodType<T>) =>
  (values: T) => {
    const result = schema.safeParse(values);

    if (result.success) return {};
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of result.error.issues) {
      const path = issue.path.join(".");
      if (!fieldErrors[path]) {
        fieldErrors[path] = [];
      }
      fieldErrors[path].push(issue.message);
    }
    return fieldErrors;
  };
