import * as Yup from "yup";

// Project Colors
export const projectColors = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#84cc16",
  "#10b981",
  "#14b8a6",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
] as const;

// Validation Schema
export const projectValidationSchema = Yup.object({
  name: Yup.string()
    .required("Project name is required")
    .min(3, "Project name must be at least 3 characters")
    .max(100, "Project name must be less than 100 characters"),

  description: Yup.string()
    .max(500, "Description must be less than 500 characters")
    .notRequired(),

  start_date: Yup.date().required("Start date is required").nullable(),

  end_date: Yup.date()
    .required("End date is required")
    .min(Yup.ref("start_date"), "End date must be after start date")
    .nullable(),

  budget_amount: Yup.number()
    .required("Budget amount is required")
    .min(0, "Budget amount cannot be negative")
    .max(999999999, "Budget amount is too large"),

  budget_currency: Yup.string()
    .oneOf(["USD", "EUR", "GBP", "JPY", "CAD", "AUD"], "Invalid currency")
    .required("Currency is required"),

  project_manager_id: Yup.string().notRequired(),

  color: Yup.string()
    .oneOf(projectColors as unknown as string[], "Invalid color")
    .required("Color is required"),

  privacy: Yup.string()
    .oneOf(["private", "public"], "Invalid privacy setting")
    .notRequired(),

  inviteMembers: Yup.string().notRequired(),

  access: Yup.string()
    .oneOf(["regular", "admin", "manager"], "Invalid access level")
    .notRequired(),

  billable: Yup.boolean().notRequired(),

  default_billable_rate: Yup.number()
    .required("Default billable rate is required")
    .integer("Billable rate must be a whole number")
    .min(1, "Billable rate must be greater than 0"),
});

// Type inference from schema
export type ProjectFormData = Yup.InferType<typeof projectValidationSchema>;

// Error type for form validation
export type ProjectValidationError = {
  field: string;
  message: string;
};

// Helper function to format validation errors for display
export const formatValidationErrors = (
  error: Yup.ValidationError
): ProjectValidationError[] => {
  if (error.inner && error.inner.length > 0) {
    return error.inner.map((err) => ({
      field: err.path || "",
      message: err.message,
    }));
  }
  return [
    {
      field: error.path || "",
      message: error.message,
    },
  ];
};

// Default form values
export const defaultProjectFormData: Partial<ProjectFormData> = {
  name: "",
  description: "",
  start_date: undefined,
  end_date: undefined,
  budget_amount: 0,
  budget_currency: "USD",
  project_manager_id: "",
  color: "#ef4444",
  privacy: "private",
  inviteMembers: "",
  access: "regular",
  billable: true,
  default_billable_rate: 100,
};
