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
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Project Expenses</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={expensesLoading}
              className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${expensesLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button className="bg-pink-500 hover:bg-pink-600" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {expensesError && (
            <div className="p-4 text-red-400 text-sm">{expensesError}</div>
          )}
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-300">Date</TableHead>
                  <TableHead className="text-gray-300">Category</TableHead>
                  <TableHead className="text-gray-300">Description</TableHead>
                  <TableHead className="text-gray-300">Amount</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-400 py-6">
                      No expenses yet
                    </TableCell>
                  </TableRow>
                ) : (
                  list.map((exp) => (
                    <TableRow key={exp.id} className="border-gray-800">
                      <TableCell className="text-gray-300 text-sm">
                        {new Date(exp.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-gray-200 text-sm">{exp.category}</TableCell>
                      <TableCell className="text-gray-400 text-sm">{exp.description}</TableCell>
                      <TableCell className="text-gray-200 text-sm">
                        {exp.currency} {exp.amount.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white" onClick={() => onEdit(exp)}>
                          <PencilLine className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white" onClick={() => onDelete(exp)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
        <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
          </DialogHeader>
          <form onSubmit={submitCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Amount</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: parseFloat(e.target.value || "0") }))}
                  className="bg-gray-800 border-gray-700"
                  required
                />
              </div>
              <div>
                <Label>Currency</Label>
                <Select value={form.currency} onValueChange={(v) => setForm((f) => ({ ...f, currency: v }))}>
                  <SelectTrigger className="bg-gray-800 border-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((c) => (
                      <SelectItem key={c} value={c} className="text-gray-300">
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Category</Label>
                <Input
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="bg-gray-800 border-gray-700"
                  placeholder="Category"
                />
              </div>
              <div>
                <Label>Incurred At</Label>
                <CalendarPicker value={form.incurred_at} onChange={(d) => setForm((f) => ({ ...f, incurred_at: d }))} />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="bg-gray-800 border-gray-700"
                placeholder="What was this expense for?"
              />
            </div>
            <div>
              <Label>Receipt URL</Label>
              <Input
                value={form.receipt_url}
                onChange={(e) => setForm((f) => ({ ...f, receipt_url: e.target.value }))}
                className="bg-gray-800 border-gray-700"
                placeholder="https://..."
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateOpen(false)}
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-pink-500 hover:bg-pink-600">
                Add Expense
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
          </DialogHeader>
          <form onSubmit={submitEdit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Amount</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: parseFloat(e.target.value || "0") }))}
                  className="bg-gray-800 border-gray-700"
                  required
                />
              </div>
              <div>
                <Label>Currency</Label>
                <Select value={form.currency} onValueChange={(v) => setForm((f) => ({ ...f, currency: v }))}>
                  <SelectTrigger className="bg-gray-800 border-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((c) => (
                      <SelectItem key={c} value={c} className="text-gray-300">
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Category</Label>
                <Input
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="bg-gray-800 border-gray-700"
                  placeholder="Category"
                />
              </div>
              <div>
                <Label>Incurred At</Label>
                <CalendarPicker value={form.incurred_at} onChange={(d) => setForm((f) => ({ ...f, incurred_at: d }))} />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="bg-gray-800 border-gray-700"
                placeholder="What was this expense for?"
              />
            </div>
            <div>
              <Label>Receipt URL</Label>
              <Input
                value={form.receipt_url}
                onChange={(e) => setForm((f) => ({ ...f, receipt_url: e.target.value }))}
                className="bg-gray-800 border-gray-700"
                placeholder="https://..."
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditOpen(false)}
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-pink-500 hover:bg-pink-600">
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


