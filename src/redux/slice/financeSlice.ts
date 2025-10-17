// src/redux/slice/financeSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { financeApiService } from "../api/finance";
import type {
  RateCreate,
  RateOut,
  RateResolveOut,
  ProjectFinancialsOut,
  PayoutCreate,
  PayoutOut,
  PayoutMarkCompletedRequest,
  FinanceAlertOut,
  FinanceAlertAckRequest,
  ExpenseCreate,
  ExpenseOut,
} from "../api/finance";

// Finance State Interface
interface FinanceState {
  // Rates
  rates: RateOut[];
  ratesLoading: boolean;
  ratesError: string | null;

  // Project Financials
  projectFinancials: Record<string, ProjectFinancialsOut>;
  financialsLoading: boolean;
  financialsError: string | null;

  // Payouts
  payouts: PayoutOut[];
  payoutsLoading: boolean;
  payoutsError: string | null;

  // Finance Alerts
  alerts: FinanceAlertOut[];
  alertsLoading: boolean;
  alertsError: string | null;

  // Expenses
  expenses: Record<string, ExpenseOut[]>; // project_id -> expenses[]
  expensesLoading: boolean;
  expensesError: string | null;

  // General loading and error states
  loading: boolean;
  error: string | null;
}

const initialState: FinanceState = {
  // Rates
  rates: [],
  ratesLoading: false,
  ratesError: null,

  // Project Financials
  projectFinancials: {},
  financialsLoading: false,
  financialsError: null,

  // Payouts
  payouts: [],
  payoutsLoading: false,
  payoutsError: null,

  // Finance Alerts
  alerts: [],
  alertsLoading: false,
  alertsError: null,

  // Expenses
  expenses: {},
  expensesLoading: false,
  expensesError: null,

  // General states
  loading: false,
  error: null,
};

// Helper function to extract error messages
const getErrorMessage = (err: any): string => {
  let errorMessage = "Finance operation failed";

  if (err?.data?.detail) {
    if (typeof err.data.detail === "string") {
      errorMessage = err.data.detail;
    } else if (Array.isArray(err.data.detail)) {
      errorMessage = err.data.detail
        .map((e: any) => e.msg || e.message || e)
        .join(", ");
    }
  } else if (err?.data?.message) {
    errorMessage = err.data.message;
  } else if (err?.data?.error) {
    errorMessage = err.data.error;
  } else if (err?.message) {
    errorMessage = err.message;
  }

  // Handle specific HTTP status codes
  if (err?.status === 400) {
    if (errorMessage === "Finance operation failed") {
      errorMessage = "Invalid finance request. Please check your information.";
    }
  } else if (err?.status === 404) {
    if (errorMessage === "Finance operation failed") {
      errorMessage = "Finance resource not found.";
    }
  } else if (err?.status === 422) {
    if (errorMessage === "Finance operation failed") {
      errorMessage =
        "Finance validation failed. Please check your information.";
    }
  } else if (err?.status === 500) {
    if (errorMessage === "Finance operation failed") {
      errorMessage = "Finance server error. Please try again later.";
    }
  } else if (err?.status === "FETCH_ERROR") {
    errorMessage =
      "Cannot connect to finance service. Please check if the backend is running.";
  }

  return errorMessage.replace(/<[^>]*>/g, "").trim();
};

// Async Thunks for Rates
export const createRate = createAsyncThunk<
  RateOut,
  RateCreate,
  { rejectValue: string }
>("finance/createRate", async (rateData, { rejectWithValue }) => {
  try {
    const result = await financeApiService.createRate(rateData);
    return result;
  } catch (err: any) {
    const errorMessage = getErrorMessage(err);
    return rejectWithValue(errorMessage);
  }
});

export const fetchRates = createAsyncThunk<
  RateOut[],
  { scope?: string; scope_id?: string },
  { rejectValue: string }
>("finance/fetchRates", async ({ scope, scope_id }, { rejectWithValue }) => {
  try {
    const result = await financeApiService.listRates(scope, scope_id);
    return result;
  } catch (err: any) {
    const errorMessage = getErrorMessage(err);
    return rejectWithValue(errorMessage);
  }
});

export const resolveRate = createAsyncThunk<
  RateResolveOut,
  {
    project_id: string;
    for_user_id?: string;
    at_ts?: string;
    rate_type?: string;
  },
  { rejectValue: string }
>(
  "finance/resolveRate",
  async (
    { project_id, for_user_id, at_ts, rate_type = "billable" },
    { rejectWithValue }
  ) => {
    try {
      const result = await financeApiService.resolveRate(
        project_id,
        for_user_id,
        at_ts,
        rate_type
      );
      return result;
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      return rejectWithValue(errorMessage);
    }
  }
);

// Async Thunks for Project Financials
export const fetchProjectFinancials = createAsyncThunk<
  ProjectFinancialsOut,
  string,
  { rejectValue: string }
>("finance/fetchProjectFinancials", async (projectId, { rejectWithValue }) => {
  try {
    const result = await financeApiService.getProjectFinancials(projectId);
    return result;
  } catch (err: any) {
    const errorMessage = getErrorMessage(err);
    return rejectWithValue(errorMessage);
  }
});

export const recomputeProjectFinancials = createAsyncThunk<
  { status: string },
  string,
  { rejectValue: string }
>(
  "finance/recomputeProjectFinancials",
  async (projectId, { rejectWithValue }) => {
    try {
      const result = await financeApiService.recomputeProjectFinancials(
        projectId
      );
      return result;
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      return rejectWithValue(errorMessage);
    }
  }
);

// Async Thunks for Payouts
export const createPayout = createAsyncThunk<
  PayoutOut,
  PayoutCreate,
  { rejectValue: string }
>("finance/createPayout", async (payoutData, { rejectWithValue }) => {
  try {
    const result = await financeApiService.createPayout(payoutData);
    return result;
  } catch (err: any) {
    const errorMessage = getErrorMessage(err);
    return rejectWithValue(errorMessage);
  }
});

export const fetchPayouts = createAsyncThunk<
  PayoutOut[],
  { freelancer_id?: string },
  { rejectValue: string }
>("finance/fetchPayouts", async ({ freelancer_id }, { rejectWithValue }) => {
  try {
    const result = await financeApiService.listPayouts(freelancer_id);
    return result;
  } catch (err: any) {
    const errorMessage = getErrorMessage(err);
    return rejectWithValue(errorMessage);
  }
});

export const markPayoutCompleted = createAsyncThunk<
  PayoutOut,
  { payout_id: string; payload: PayoutMarkCompletedRequest },
  { rejectValue: string }
>(
  "finance/markPayoutCompleted",
  async ({ payout_id, payload }, { rejectWithValue }) => {
    try {
      const result = await financeApiService.markPayoutCompleted(
        payout_id,
        payload
      );
      return result;
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      return rejectWithValue(errorMessage);
    }
  }
);

// Async Thunks for Finance Alerts
export const fetchFinanceAlerts = createAsyncThunk<
  FinanceAlertOut[],
  { project_id?: string },
  { rejectValue: string }
>("finance/fetchFinanceAlerts", async ({ project_id }, { rejectWithValue }) => {
  try {
    const result = await financeApiService.listAlerts(project_id);
    return result;
  } catch (err: any) {
    const errorMessage = getErrorMessage(err);
    return rejectWithValue(errorMessage);
  }
});

export const acknowledgeFinanceAlert = createAsyncThunk<
  FinanceAlertOut,
  { alert_id: string; payload: FinanceAlertAckRequest },
  { rejectValue: string }
>(
  "finance/acknowledgeFinanceAlert",
  async ({ alert_id, payload }, { rejectWithValue }) => {
    try {
      const result = await financeApiService.acknowledgeAlert(
        alert_id,
        payload
      );
      return result;
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      return rejectWithValue(errorMessage);
    }
  }
);

// Async Thunks for Expenses
export const createExpense = createAsyncThunk<
  ExpenseOut,
  { project_id: string; payload: ExpenseCreate },
  { rejectValue: string }
>(
  "finance/createExpense",
  async ({ project_id, payload }, { rejectWithValue }) => {
    try {
      const result = await financeApiService.createExpense(project_id, payload);
      return result;
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchExpenses = createAsyncThunk<
  ExpenseOut[],
  string,
  { rejectValue: string }
>("finance/fetchExpenses", async (projectId, { rejectWithValue }) => {
  try {
    const result = await financeApiService.listExpenses(projectId);
    return result;
  } catch (err: any) {
    const errorMessage = getErrorMessage(err);
    return rejectWithValue(errorMessage);
  }
});

export const updateExpense = createAsyncThunk<
  ExpenseOut,
  { project_id: string; expense_id: string; payload: ExpenseCreate },
  { rejectValue: string }
>(
  "finance/updateExpense",
  async ({ project_id, expense_id, payload }, { rejectWithValue }) => {
    try {
      const result = await financeApiService.updateExpense(
        project_id,
        expense_id,
        payload
      );
      return result;
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteExpense = createAsyncThunk<
  void,
  { project_id: string; expense_id: string },
  { rejectValue: string }
>(
  "finance/deleteExpense",
  async ({ project_id, expense_id }, { rejectWithValue }) => {
    try {
      await financeApiService.deleteExpense(project_id, expense_id);
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      return rejectWithValue(errorMessage);
    }
  }
);

// Finance Slice
const financeSlice = createSlice({
  name: "finance",
  initialState,
  reducers: {
    clearFinanceError: (state) => {
      state.error = null;
      state.ratesError = null;
      state.financialsError = null;
      state.payoutsError = null;
      state.alertsError = null;
      state.expensesError = null;
    },
    clearRatesError: (state) => {
      state.ratesError = null;
    },
    clearFinancialsError: (state) => {
      state.financialsError = null;
    },
    clearPayoutsError: (state) => {
      state.payoutsError = null;
    },
    clearAlertsError: (state) => {
      state.alertsError = null;
    },
    clearExpensesError: (state) => {
      state.expensesError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Rates
      .addCase(createRate.pending, (state) => {
        state.ratesLoading = true;
        state.ratesError = null;
      })
      .addCase(createRate.fulfilled, (state, action) => {
        state.ratesLoading = false;
        state.rates.push(action.payload);
        state.ratesError = null;
      })
      .addCase(createRate.rejected, (state, action) => {
        state.ratesLoading = false;
        state.ratesError = action.payload || "Failed to create rate";
      })
      .addCase(fetchRates.pending, (state) => {
        state.ratesLoading = true;
        state.ratesError = null;
      })
      .addCase(fetchRates.fulfilled, (state, action) => {
        state.ratesLoading = false;
        state.rates = action.payload;
        state.ratesError = null;
      })
      .addCase(fetchRates.rejected, (state, action) => {
        state.ratesLoading = false;
        state.ratesError = action.payload || "Failed to fetch rates";
      })
      .addCase(resolveRate.pending, (state) => {
        state.ratesLoading = true;
        state.ratesError = null;
      })
      .addCase(resolveRate.fulfilled, (state) => {
        state.ratesLoading = false;
        state.ratesError = null;
      })
      .addCase(resolveRate.rejected, (state, action) => {
        state.ratesLoading = false;
        state.ratesError = action.payload || "Failed to resolve rate";
      })

      // Project Financials
      .addCase(fetchProjectFinancials.pending, (state) => {
        state.financialsLoading = true;
        state.financialsError = null;
      })
      .addCase(fetchProjectFinancials.fulfilled, (state, action) => {
        state.financialsLoading = false;
        state.projectFinancials[action.payload.project_id] = action.payload;
        state.financialsError = null;
      })
      .addCase(fetchProjectFinancials.rejected, (state, action) => {
        state.financialsLoading = false;
        state.financialsError =
          action.payload || "Failed to fetch project financials";
      })
      .addCase(recomputeProjectFinancials.pending, (state) => {
        state.financialsLoading = true;
        state.financialsError = null;
      })
      .addCase(recomputeProjectFinancials.fulfilled, (state) => {
        state.financialsLoading = false;
        state.financialsError = null;
      })
      .addCase(recomputeProjectFinancials.rejected, (state, action) => {
        state.financialsLoading = false;
        state.financialsError =
          action.payload || "Failed to recompute project financials";
      })

      // Payouts
      .addCase(createPayout.pending, (state) => {
        state.payoutsLoading = true;
        state.payoutsError = null;
      })
      .addCase(createPayout.fulfilled, (state, action) => {
        state.payoutsLoading = false;
        state.payouts.push(action.payload);
        state.payoutsError = null;
      })
      .addCase(createPayout.rejected, (state, action) => {
        state.payoutsLoading = false;
        state.payoutsError = action.payload || "Failed to create payout";
      })
      .addCase(fetchPayouts.pending, (state) => {
        state.payoutsLoading = true;
        state.payoutsError = null;
      })
      .addCase(fetchPayouts.fulfilled, (state, action) => {
        state.payoutsLoading = false;
        state.payouts = action.payload;
        state.payoutsError = null;
      })
      .addCase(fetchPayouts.rejected, (state, action) => {
        state.payoutsLoading = false;
        state.payoutsError = action.payload || "Failed to fetch payouts";
      })
      .addCase(markPayoutCompleted.pending, (state) => {
        state.payoutsLoading = true;
        state.payoutsError = null;
      })
      .addCase(markPayoutCompleted.fulfilled, (state, action) => {
        state.payoutsLoading = false;
        const index = state.payouts.findIndex(
          (p) => p.id === action.payload.id
        );
        if (index !== -1) {
          state.payouts[index] = action.payload;
        }
        state.payoutsError = null;
      })
      .addCase(markPayoutCompleted.rejected, (state, action) => {
        state.payoutsLoading = false;
        state.payoutsError =
          action.payload || "Failed to mark payout as completed";
      })

      // Finance Alerts
      .addCase(fetchFinanceAlerts.pending, (state) => {
        state.alertsLoading = true;
        state.alertsError = null;
      })
      .addCase(fetchFinanceAlerts.fulfilled, (state, action) => {
        state.alertsLoading = false;
        state.alerts = action.payload;
        state.alertsError = null;
      })
      .addCase(fetchFinanceAlerts.rejected, (state, action) => {
        state.alertsLoading = false;
        state.alertsError = action.payload || "Failed to fetch finance alerts";
      })
      .addCase(acknowledgeFinanceAlert.pending, (state) => {
        state.alertsLoading = true;
        state.alertsError = null;
      })
      .addCase(acknowledgeFinanceAlert.fulfilled, (state, action) => {
        state.alertsLoading = false;
        const index = state.alerts.findIndex((a) => a.id === action.payload.id);
        if (index !== -1) {
          state.alerts[index] = action.payload;
        }
        state.alertsError = null;
      })
      .addCase(acknowledgeFinanceAlert.rejected, (state, action) => {
        state.alertsLoading = false;
        state.alertsError =
          action.payload || "Failed to acknowledge finance alert";
      })

      // Expenses
      .addCase(createExpense.pending, (state) => {
        state.expensesLoading = true;
        state.expensesError = null;
      })
      .addCase(createExpense.fulfilled, (state, action) => {
        state.expensesLoading = false;
        const projectId = action.payload.project_id;
        if (!state.expenses[projectId]) {
          state.expenses[projectId] = [];
        }
        state.expenses[projectId].push(action.payload);
        state.expensesError = null;
      })
      .addCase(createExpense.rejected, (state, action) => {
        state.expensesLoading = false;
        state.expensesError = action.payload || "Failed to create expense";
      })
      .addCase(fetchExpenses.pending, (state) => {
        state.expensesLoading = true;
        state.expensesError = null;
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.expensesLoading = false;
        // Note: We need the project_id to store expenses properly
        // This would need to be passed in the action payload or handled differently
        state.expensesError = null;
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.expensesLoading = false;
        state.expensesError = action.payload || "Failed to fetch expenses";
      })
      .addCase(updateExpense.pending, (state) => {
        state.expensesLoading = true;
        state.expensesError = null;
      })
      .addCase(updateExpense.fulfilled, (state, action) => {
        state.expensesLoading = false;
        const projectId = action.payload.project_id;
        if (state.expenses[projectId]) {
          const index = state.expenses[projectId].findIndex(
            (e) => e.id === action.payload.id
          );
          if (index !== -1) {
            state.expenses[projectId][index] = action.payload;
          }
        }
        state.expensesError = null;
      })
      .addCase(updateExpense.rejected, (state, action) => {
        state.expensesLoading = false;
        state.expensesError = action.payload || "Failed to update expense";
      })
      .addCase(deleteExpense.pending, (state) => {
        state.expensesLoading = true;
        state.expensesError = null;
      })
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.expensesLoading = false;
        // Note: We need the project_id and expense_id to remove the expense
        // This would need to be handled in the action creator
        state.expensesError = null;
      })
      .addCase(deleteExpense.rejected, (state, action) => {
        state.expensesLoading = false;
        state.expensesError = action.payload || "Failed to delete expense";
      });
  },
});

export const {
  clearFinanceError,
  clearRatesError,
  clearFinancialsError,
  clearPayoutsError,
  clearAlertsError,
  clearExpensesError,
} = financeSlice.actions;

export default financeSlice.reducer;
