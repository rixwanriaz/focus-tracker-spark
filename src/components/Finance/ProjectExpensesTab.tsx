import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import { createExpense, deleteExpense, fetchExpenses, updateExpense } from "@/redux/slice/financeSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarPicker } from "@/components/ui/calendar-picker";
import { Plus, PencilLine, Trash2, RefreshCw } from "lucide-react";
import type { ExpenseOut } from "@/redux/api/finance";
import { toast } from "sonner";

interface Props {
  projectId: string;
}

interface ExpenseFormData {
  amount: number;
  currency: string;
  category: string;
  description: string;
  receipt_url?: string;
  incurred_at?: Date;
}

const defaultForm: ExpenseFormData = {
  amount: 0,
  currency: "USD",
  category: "General",
  description: "",
  receipt_url: "",
  incurred_at: undefined,
};

const currencies = ["USD", "EUR", "GBP", "CAD", "AUD", "JPY"];

const ProjectExpensesTab: React.FC<Props> = ({ projectId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { expenses, expensesLoading, expensesError } = useSelector((s: RootState) => s.finance);
  const list: ExpenseOut[] = useMemo(() => expenses[projectId] || [], [expenses, projectId]);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState<ExpenseFormData>(defaultForm);
  const [editing, setEditing] = useState<ExpenseOut | null>(null);

  useEffect(() => {
    dispatch(fetchExpenses(projectId));
  }, [dispatch, projectId]);

  const handleRefresh = () => {
    dispatch(fetchExpenses(projectId));
  };

  const submitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(
        createExpense({
          project_id: projectId,
          payload: {
            amount: form.amount,
            currency: form.currency,
            category: form.category,
            description: form.description,
            receipt_url: form.receipt_url || undefined,
            incurred_at: form.incurred_at ? form.incurred_at.toISOString() : undefined,
          },
        })
      ).unwrap();
      toast.success("Expense added");
      setCreateOpen(false);
      setForm(defaultForm);
    } catch (err: any) {
      toast.error(err || "Failed to add expense");
    }
  };

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    try {
      await dispatch(
        updateExpense({
          project_id: projectId,
          expense_id: editing.id,
          payload: {
            amount: form.amount,
            currency: form.currency,
            category: form.category,
            description: form.description,
            receipt_url: form.receipt_url || undefined,
            incurred_at: form.incurred_at ? form.incurred_at.toISOString() : undefined,
          },
        })
      ).unwrap();
      toast.success("Expense updated");
      setEditOpen(false);
      setEditing(null);
    } catch (err: any) {
      toast.error(err || "Failed to update expense");
    }
  };

  const onEdit = (exp: ExpenseOut) => {
    setEditing(exp);
    setForm({
      amount: exp.amount,
      currency: exp.currency,
      category: exp.category,
      description: exp.description,
      receipt_url: exp.receipt_url,
      incurred_at: undefined,
    });
    setEditOpen(true);
  };

  const onDelete = async (exp: ExpenseOut) => {
    try {
      await dispatch(deleteExpense({ project_id: projectId, expense_id: exp.id })).unwrap();
      toast.success("Expense deleted");
    } catch (err: any) {
      toast.error(err || "Failed to delete expense");
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900 border-gray-800 shadow-xl rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-800/50 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Project Expenses
            </CardTitle>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={expensesLoading}
                className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white hover:scale-105 transition-all"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${expensesLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button 
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:scale-105 transition-transform" 
                onClick={() => setCreateOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Expense
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {expensesError && (
            <div className="p-4 text-red-400 text-sm bg-red-900/20 border-l-4 border-red-500 m-4">{expensesError}</div>
          )}
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow className="border-gray-800">
                  <TableHead className="text-gray-300 font-semibold">Date</TableHead>
                  <TableHead className="text-gray-300 font-semibold">Category</TableHead>
                  <TableHead className="text-gray-300 font-semibold">Description</TableHead>
                  <TableHead className="text-gray-300 font-semibold">Amount</TableHead>
                  <TableHead className="text-gray-300 font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-400 py-12">
                      <div className="flex flex-col items-center gap-2">
                        <div className="p-3 bg-gray-800 rounded-full">
                          <Plus className="h-6 w-6 text-gray-500" />
                        </div>
                        <p className="text-lg">No expenses yet</p>
                        <p className="text-sm text-gray-500">Add your first expense to get started</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  list.map((exp) => (
                    <TableRow key={exp.id} className="border-gray-800 hover:bg-gray-800/50 transition-colors">
                      <TableCell className="text-gray-300 text-sm">
                        {new Date(exp.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </TableCell>
                      <TableCell className="text-gray-200 text-sm font-medium">{exp.category}</TableCell>
                      <TableCell className="text-gray-400 text-sm">{exp.description}</TableCell>
                      <TableCell className="text-gray-200 text-sm font-semibold">
                        <span className="text-purple-400">{exp.currency}</span> {exp.amount.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-gray-400 hover:text-purple-400 hover:bg-purple-900/20 transition-all" 
                            onClick={() => onEdit(exp)}
                          >
                            <PencilLine className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-gray-400 hover:text-red-400 hover:bg-red-900/20 transition-all" 
                            onClick={() => onDelete(exp)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white shadow-2xl sm:max-w-lg">
          <DialogHeader className="border-b border-gray-800 pb-4">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Add Expense
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={submitCreate} className="space-y-5 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-300">Amount *</Label>
                <Input
                  type="text"
                  inputMode="decimal"
                  value={form.amount === 0 ? "" : form.amount}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9.]/g, '');
                    setForm((f) => ({ ...f, amount: val === "" ? 0 : parseFloat(val) }));
                  }}
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 h-11 transition-all"
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-300">Currency *</Label>
                <Select value={form.currency} onValueChange={(v) => setForm((f) => ({ ...f, currency: v }))}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white h-11 focus:ring-2 focus:ring-purple-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {currencies.map((c) => (
                      <SelectItem key={c} value={c} className="text-gray-300 focus:bg-gray-700">
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-300">Category</Label>
                <Input
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 h-11 transition-all"
                  placeholder="e.g., Travel, Office"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-300">Incurred At</Label>
                <CalendarPicker value={form.incurred_at} onChange={(d) => setForm((f) => ({ ...f, incurred_at: d }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-300">Description</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 h-11 transition-all"
                placeholder="What was this expense for?"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-300">Receipt URL (Optional)</Label>
              <Input
                value={form.receipt_url}
                onChange={(e) => setForm((f) => ({ ...f, receipt_url: e.target.value }))}
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 h-11 transition-all"
                placeholder="https://..."
              />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateOpen(false)}
                className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white hover:scale-105 transition-all"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:scale-105 transition-transform"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Expense
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white shadow-2xl sm:max-w-lg">
          <DialogHeader className="border-b border-gray-800 pb-4">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Edit Expense
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={submitEdit} className="space-y-5 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-300">Amount *</Label>
                <Input
                  type="text"
                  inputMode="decimal"
                  value={form.amount === 0 ? "" : form.amount}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9.]/g, '');
                    setForm((f) => ({ ...f, amount: val === "" ? 0 : parseFloat(val) }));
                  }}
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 h-11 transition-all"
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-300">Currency *</Label>
                <Select value={form.currency} onValueChange={(v) => setForm((f) => ({ ...f, currency: v }))}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white h-11 focus:ring-2 focus:ring-purple-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {currencies.map((c) => (
                      <SelectItem key={c} value={c} className="text-gray-300 focus:bg-gray-700">
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-300">Category</Label>
                <Input
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 h-11 transition-all"
                  placeholder="e.g., Travel, Office"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-300">Incurred At</Label>
                <CalendarPicker value={form.incurred_at} onChange={(d) => setForm((f) => ({ ...f, incurred_at: d }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-300">Description</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 h-11 transition-all"
                placeholder="What was this expense for?"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-300">Receipt URL (Optional)</Label>
              <Input
                value={form.receipt_url}
                onChange={(e) => setForm((f) => ({ ...f, receipt_url: e.target.value }))}
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 h-11 transition-all"
                placeholder="https://..."
              />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditOpen(false)}
                className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white hover:scale-105 transition-all"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:scale-105 transition-transform"
              >
                <PencilLine className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectExpensesTab;



