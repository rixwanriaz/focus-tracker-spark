// src/redux/api/finance.ts
import { api } from "../../service/api";
import { API_CONFIG } from "../../config/api.config";

// Types for Finance API requests and responses

// Rate Types
export interface RateCreate {
  scope: "user" | "project" | "client" | "default";
  scope_id?: string;
  rate_type: "billable" | "internal";
  currency: string;
  hourly_rate: number;
  effective_from?: string;
  effective_to?: string;
}

export interface RateOut {
  id: string;
  organization_id: string;
  scope: string;
  scope_id?: string;
  rate_type: string;
  currency: string;
  hourly_rate: number;
  effective_from?: string;
  effective_to?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface RateResolveOut {
  currency: string;
  rate_type: string;
  hourly_rate: number;
  source: string;
  resolved_scope: string;
  resolved_scope_id?: string;
}

// Project Financials Types
export interface ProjectFinancialsOut {
  project_id: string;
  currency: string;
  revenue: number;
  freelancer_cost: number;
  expenses: number;
  profit?: number;
  margin_percent?: number;
  billable_hours: number;
  last_updated: string;
  budget_amount?: number;
  projected_end_date?: string;
  notes: Record<string, any>;
}

// Payout Types
export interface PayoutCreate {
  freelancer_user_id: string;
  project_id?: string;
  amount: number;
  currency: string;
  payout_method: string;
  scheduled_for?: string;
  metadata?: Record<string, any>;
}

export interface PayoutOut {
  id: string;
  organization_id: string;
  freelancer_user_id: string;
  project_id?: string;
  amount: number;
  currency: string;
  payout_method: string;
  status: "pending" | "completed" | "failed";
  payout_reference?: string;
  scheduled_for?: string;
  paid_at?: string;
  created_at: string;
  created_by: string;
  payout_metadata?: Record<string, any>;
}

export interface PayoutMarkCompletedRequest {
  payout_reference: string;
  paid_at?: string;
}

// Finance Alert Types
export interface FinanceAlertOut {
  id: string;
  organization_id: string;
  project_id?: string;
  alert_type: string;
  title: string;
  message: string;
  severity: "low" | "medium" | "high" | "critical";
  acknowledged: boolean;
  acknowledged_at?: string;
  created_at: string;
  notes?: string;
}

export interface FinanceAlertAckRequest {
  notes?: string;
}

// Per-User Project Cost Types
export interface MyProjectCostOut {
  project_id: string;
  user_id: string;
  start?: string;
  end?: string;
  hours: number;
  cost: number;
  currency: string;
}

export interface ProjectUserCostItem {
  user_id: string;
  hours: number;
  cost: number;
  currency: string;
}

export interface ProjectUserCostsOut {
  project_id: string;
  start?: string;
  end?: string;
  currency: string;
  total_hours: number;
  total_cost: number;
  users: ProjectUserCostItem[];
}

// Expense Types
export interface ExpenseCreate {
  amount: number;
  currency: string;
  category: string;
  description: string;
  receipt_url?: string;
}

export interface ExpenseOut {
  id: string;
  project_id: string;
  organization_id: string;
  amount: number;
  currency: string;
  category: string;
  description: string;
  receipt_url?: string;
  created_at: string;
  created_by: string;
}

// Finance API service functions
export const financeApiService = {
  // Rates
  createRate: async (payload: RateCreate): Promise<RateOut> => {
    const response = await api.post("/finance/rates", payload);
    return response.data;
  },

  listRates: async (scope?: string, scope_id?: string): Promise<RateOut[]> => {
    const params = new URLSearchParams();
    if (scope) params.append("scope", scope);
    if (scope_id) params.append("scope_id", scope_id);

    const response = await api.get(`/finance/rates?${params.toString()}`);
    return response.data;
  },

  resolveRate: async (
    project_id: string,
    for_user_id?: string,
    at_ts?: string,
    rate_type: string = "billable"
  ): Promise<RateResolveOut> => {
    const params = new URLSearchParams();
    params.append("rate_type", rate_type);
    if (for_user_id) params.append("for_user_id", for_user_id);
    if (at_ts) params.append("at_ts", at_ts);

    const response = await api.get(
      `/projects/${project_id}/rate-resolve?${params.toString()}`
    );
    return response.data;
  },

  // Project Financials
  getProjectFinancials: async (
    project_id: string
  ): Promise<ProjectFinancialsOut> => {
    const response = await api.get(`/projects/${project_id}/financials`);
    return response.data;
  },

  recomputeProjectFinancials: async (
    project_id: string
  ): Promise<{ status: string }> => {
    const response = await api.post(
      `/projects/${project_id}/financials/recompute`
    );
    return response.data;
  },

  // Payouts
  createPayout: async (payload: PayoutCreate): Promise<PayoutOut> => {
    const response = await api.post("/finance/payouts", payload);
    return response.data;
  },

  listPayouts: async (freelancer_id?: string): Promise<PayoutOut[]> => {
    const params = new URLSearchParams();
    if (freelancer_id) params.append("freelancer_id", freelancer_id);

    const response = await api.get(`/finance/payouts?${params.toString()}`);
    return response.data;
  },

  markPayoutCompleted: async (
    payout_id: string,
    payload: PayoutMarkCompletedRequest
  ): Promise<PayoutOut> => {
    const response = await api.post(
      `/finance/payouts/${payout_id}/mark-completed`,
      payload
    );
    return response.data;
  },

  exportPayouts: async (
    format: string = "csv",
    from?: string
  ): Promise<Blob> => {
    const params = new URLSearchParams();
    params.append("format", format);
    if (from) params.append("from", from);

    const response = await api.get(
      `/finance/payouts/export?${params.toString()}`,
      {
        responseType: "blob",
      }
    );
    return response.data;
  },

  // Per-User Costs Endpoints
  getMyProjectCost: async (
    project_id: string,
    start?: string,
    end?: string
  ): Promise<MyProjectCostOut> => {
    const params = new URLSearchParams();
    if (start) params.append("start", start);
    if (end) params.append("end", end);

    const response = await api.get(
      `/projects/${project_id}/my-cost?${params.toString()}`
    );
    return response.data;
  },

  getProjectUserCosts: async (
    project_id: string,
    start?: string,
    end?: string
  ): Promise<ProjectUserCostsOut> => {
    const params = new URLSearchParams();
    if (start) params.append("start", start);
    if (end) params.append("end", end);

    const response = await api.get(
      `/projects/${project_id}/user-costs?${params.toString()}`
    );
    return response.data;
  },

  // Finance Alerts
  listAlerts: async (project_id?: string): Promise<FinanceAlertOut[]> => {
    const params = new URLSearchParams();
    if (project_id) params.append("project_id", project_id);

    const response = await api.get(`/finance/alerts?${params.toString()}`);
    return response.data;
  },

  acknowledgeAlert: async (
    alert_id: string,
    payload: FinanceAlertAckRequest
  ): Promise<FinanceAlertOut> => {
    const response = await api.post(
      `/finance/alerts/${alert_id}/acknowledge`,
      payload
    );
    return response.data;
  },

  // Expenses
  createExpense: async (
    project_id: string,
    payload: ExpenseCreate
  ): Promise<ExpenseOut> => {
    const response = await api.post(
      `/projects/${project_id}/expenses`,
      payload
    );
    return response.data;
  },

  listExpenses: async (project_id: string): Promise<ExpenseOut[]> => {
    const response = await api.get(`/projects/${project_id}/expenses`);
    return response.data;
  },

  updateExpense: async (
    project_id: string,
    expense_id: string,
    payload: ExpenseCreate
  ): Promise<ExpenseOut> => {
    const response = await api.patch(
      `/projects/${project_id}/expenses/${expense_id}`,
      payload
    );
    return response.data;
  },

  deleteExpense: async (
    project_id: string,
    expense_id: string
  ): Promise<void> => {
    await api.delete(`/projects/${project_id}/expenses/${expense_id}`);
  },
};
