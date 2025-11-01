import React, { useEffect, useMemo, useState } from "react";
import { MainLayout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { createPayout, fetchPayouts, markPayoutCompleted } from "@/redux/slice/financeSlice";
import { Download, Plus, Check, User } from "lucide-react";
import { projectApiService } from "@/redux/api/project";
import { getOrganizationMembers } from "@/redux/slice/organizationSlice";
import { getOrgIdFromToken } from "@/lib/jwt";
import type { Project, ProjectMember } from "@/redux/api/project";
import { CalendarPicker } from "@/components/ui/calendar-picker";

const currencies = ["USD", "EUR", "GBP", "CAD", "AUD", "JPY"];

const Payouts: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { payouts, payoutsLoading, payoutsError } = useSelector((s: RootState) => s.finance);
  const { members: orgMembers, loadingMembers: loadingOrgMembers } = useSelector((s: RootState) => s.organization);

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({
    freelancer_user_id: "",
    project_id: "",
    amount: 0,
    currency: "USD",
    payout_method: "manual",
    scheduled_for: "",
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const [freelancerEmail, setFreelancerEmail] = useState("");
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [projectMap, setProjectMap] = useState<Record<string, Project>>({});
  const [memberMap, setMemberMap] = useState<Record<string, ProjectMember>>({});
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedUserEmail, setSelectedUserEmail] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [summary, setSummary] = useState<{
    currency: string;
    total_hours: number;
    total_cost: number;
    paid_total: number;
    pending_payout_total: number;
    due_total: number;
  } | null>(null);
  const [exportFrom, setExportFrom] = useState("");
  const [summaryFrom, setSummaryFrom] = useState("");
  const [summaryTo, setSummaryTo] = useState("");

  // Load organization members on mount
  useEffect(() => {
    const orgId = getOrgIdFromToken();
    if (orgId && (!orgMembers || orgMembers.length === 0)) {
      dispatch(getOrganizationMembers(orgId));
    }
  }, [dispatch]);

  // Fetch payouts when a user is selected
  useEffect(() => {
    if (!selectedUserEmail) return;
    dispatch(fetchPayouts({ freelancer_email: selectedUserEmail }));
  }, [dispatch, selectedUserEmail]);

  // Fetch summary for selected user on selection or date changes
  useEffect(() => {
    if (!selectedUserId) {
      setSummary(null);
      setSummaryError(null);
      return;
    }
    setSummaryLoading(true);
    setSummaryError(null);
    import("@/redux/api/finance")
      .then(({ financeApiService }) =>
        financeApiService.getFreelancerFinanceSummary(
          selectedUserId as string,
          summaryFrom ? new Date(summaryFrom).toISOString() : undefined,
          summaryTo ? new Date(summaryTo).toISOString() : undefined
        )
      )
      .then((data) => {
        setSummary({
          currency: data.currency,
          total_hours: data.total_hours,
          total_cost: data.total_cost,
          paid_total: data.paid_total,
          pending_payout_total: data.pending_payout_total,
          due_total: data.due_total,
        });
      })
      .catch((err: any) => {
        setSummary(null);
        setSummaryError(
          err?.message || "Failed to load freelancer finance summary"
        );
      })
      .finally(() => setSummaryLoading(false));
  }, [selectedUserId, summaryFrom, summaryTo]);

  // Load projects and build maps for display
  useEffect(() => {
    const loadProjectsAndMembers = async () => {
      try {
        setLoadingProjects(true);
        const projectsList = await projectApiService.getProjects();
        setProjects(projectsList);
        
        // Build project map
        const projectMapData: Record<string, Project> = {};
        projectsList.forEach(project => {
          projectMapData[project.id] = project;
        });
        setProjectMap(projectMapData);

        // Load members for all projects to build member map
        const memberMapData: Record<string, ProjectMember> = {};
        for (const project of projectsList) {
          try {
            const members = await projectApiService.getProjectMembers(project.id);
            members.forEach(member => {
              memberMapData[member.user_id] = member;
            });
          } catch (err) {
            // Skip projects with member loading errors
          }
        }
        setMemberMap(memberMapData);
      } catch (err) {
        console.error('Failed to load projects:', err);
      } finally {
        setLoadingProjects(false);
      }
    };

    loadProjectsAndMembers();
  }, []);

  useEffect(() => {
    if (createOpen && projects.length === 0) {
      // Projects are already loaded in the main useEffect, no need to reload
    }
  }, [createOpen, projects.length]);

  const onSelectProject = async (projectId: string) => {
    setForm((f) => ({ ...f, project_id: projectId }));
    setFreelancerEmail("");
    setProjectMembers([]);
    if (!projectId) return;
    try {
      setLoadingMembers(true);
      const members = await projectApiService.getProjectMembers(projectId);
      setProjectMembers(members);
    } catch (err) {
      setProjectMembers([]);
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.freelancer_user_id || !form.amount) {
      toast.error("Freelancer and amount are required");
      return;
    }
    try {
      await dispatch(
        createPayout({
          freelancer_user_id: form.freelancer_user_id,
          project_id: form.project_id || undefined,
          amount: form.amount,
          currency: form.currency,
          payout_method: form.payout_method,
          scheduled_for: scheduledDate ? scheduledDate.toISOString() : undefined,
        })
      ).unwrap();
      toast.success("Payout created");
      setCreateOpen(false);
      setForm({ freelancer_user_id: "", project_id: "", amount: 0, currency: "USD", payout_method: "manual", scheduled_for: "" });
      setFreelancerEmail("");
      setProjectMembers([]);
      setScheduledDate(undefined);
      // Refresh the payouts list for the selected user
      if (selectedUserEmail) {
        dispatch(
          fetchPayouts({
            freelancer_email: selectedUserEmail,
          })
        );
      }
    } catch (err: any) {
      toast.error(err || "Failed to create payout");
    }
  };

  const handleMarkCompleted = async (payoutId: string) => {
    try {
      await dispatch(markPayoutCompleted({ payout_id: payoutId, payload: { payout_reference: "manual" } })).unwrap();
      toast.success("Payout marked completed");
    } catch (err: any) {
      toast.error(err || "Failed to mark completed");
    }
  };

  const handleExportCsv = async () => {
    try {
      const blob = await import("@/redux/api/finance").then(({ financeApiService }) => financeApiService.exportPayouts("csv", exportFrom ? new Date(exportFrom).toISOString() : undefined));
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `payouts_${new Date().toISOString().slice(0,10)}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      toast.error("Failed to export payouts");
    }
  };

  return (
    <div className="w-full">
      <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-end gap-3">
            <Label className="text-gray-300 text-sm">User</Label>
            <Select
              value={selectedUserId || "none"}
              onValueChange={(value) => {
                if (value === "none") {
                  setSelectedUserId("");
                  setSelectedUserEmail("");
                  setSummary(null);
                  return;
                }
                const mem = orgMembers.find((m) => m.user.id === value);
                setSelectedUserId(value);
                setSelectedUserEmail(mem?.user.email || "");
              }}
            >
              <SelectTrigger className="bg-gray-800 border-gray-700 w-72">
                <SelectValue placeholder={loadingOrgMembers ? "Loading users..." : "Select user"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none" className="text-gray-300">None</SelectItem>
                {orgMembers.map((m) => (
                  <SelectItem key={m.user.id} value={m.user.id} className="text-gray-300">
                    {m.user.full_name || m.user.email} ({m.user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Label className="text-gray-300 text-sm">Summary From</Label>
            <Input
              type="date"
              value={summaryFrom}
              onChange={(e) => setSummaryFrom(e.target.value)}
              className="bg-gray-800 border-gray-700 w-44"
            />
            <Label className="text-gray-300 text-sm">To</Label>
            <Input
              type="date"
              value={summaryTo}
              onChange={(e) => setSummaryTo(e.target.value)}
              className="bg-gray-800 border-gray-700 w-44"
            />
            <Label className="text-gray-300 text-sm">Export from</Label>
            <Input
              type="date"
              value={exportFrom}
              onChange={(e) => setExportFrom(e.target.value)}
              className="bg-gray-800 border-gray-700 w-44"
            />
            <Button variant="outline" onClick={handleExportCsv} className="border-gray-700 text-gray-300">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button className="bg-pink-500 hover:bg-pink-600" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Payout
            </Button>
          </div>

          {summary || summaryLoading || summaryError ? (
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Freelancer Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {summaryLoading && (
                  <div className="text-gray-400 text-sm">Loading summary…</div>
                )}
                {summaryError && (
                  <div className="text-red-400 text-sm">{summaryError}</div>
                )}
                {summary && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-200">
                    <div>
                      <div className="text-gray-400">Currency</div>
                      <div>{summary.currency}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Total Hours</div>
                      <div>{summary.total_hours.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Total Cost</div>
                      <div>
                        {summary.currency} {summary.total_cost.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400">Paid Total</div>
                      <div>
                        {summary.currency} {summary.paid_total.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400">Pending Payouts</div>
                      <div>
                        {summary.currency} {summary.pending_payout_total.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400">Due Total</div>
                      <div>
                        {summary.currency} {summary.due_total.toFixed(2)}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : null}

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Recent Payouts</CardTitle>
            </CardHeader>
            <CardContent>
              {payoutsError && <div className="text-red-400 text-sm mb-2">{payoutsError}</div>}
              <div className="overflow-x-auto">
                <Table className="min-w-full">
                  <TableHeader>
                    <TableRow className="border-gray-800">
                      <TableHead className="text-gray-300">Freelancer</TableHead>
                      <TableHead className="text-gray-300">Project</TableHead>
                      <TableHead className="text-gray-300">Amount</TableHead>
                      <TableHead className="text-gray-300">Status</TableHead>
                      <TableHead className="text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payouts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-gray-400 py-6">No payouts</TableCell>
                      </TableRow>
                    ) : (
                      payouts.map((p) => {
                        const project = p.project_id ? projectMap[p.project_id] : null;
                        const member = memberMap[p.freelancer_user_id];
                        return (
                          <TableRow key={p.id} className="border-gray-800">
                            <TableCell className="text-gray-300 text-sm flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-500" />
                              {member?.user_email || p.freelancer_user_id}
                            </TableCell>
                            <TableCell className="text-gray-300 text-sm">{project?.name || p.project_id || "—"}</TableCell>
                            <TableCell className="text-gray-200 text-sm">{p.currency} {p.amount.toFixed(2)}</TableCell>
                            <TableCell className="text-gray-300 text-sm">{p.status}</TableCell>
                            <TableCell className="text-right">
                              {p.status !== "completed" && (
                                <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white" onClick={() => handleMarkCompleted(p.id)}>
                                  <Check className="h-4 w-4 mr-1" /> Mark completed
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-md">
              <DialogHeader>
                <DialogTitle>Create Payout</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <Label>Project</Label>
                  <Select value={form.project_id || "none"} onValueChange={(value) => onSelectProject(value === "none" ? "" : value)}>
                    <SelectTrigger className="bg-gray-800 border-gray-700"><SelectValue placeholder={loadingProjects ? "Loading projects..." : "Select project (optional)"} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none" className="text-gray-300">None</SelectItem>
                      {projects.map(p => (
                        <SelectItem key={p.id} value={p.id} className="text-gray-300">{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Freelancer (email) *</Label>
                  <Select value={freelancerEmail || "none"} onValueChange={(email) => {
                    if (email === "none") {
                      setFreelancerEmail("");
                      setForm(f => ({ ...f, freelancer_user_id: "" }));
                    } else {
                      setFreelancerEmail(email);
                      const selected = projectMembers.find(m => m.user_email === email);
                      setForm(f => ({ ...f, freelancer_user_id: selected ? selected.user_id : "" }));
                    }
                  }}>
                    <SelectTrigger className="bg-gray-800 border-gray-700"><SelectValue placeholder={loadingMembers ? "Loading members..." : (form.project_id ? "Select freelancer" : "Select a project first (or none)")} /></SelectTrigger>
                    <SelectContent>
                      {projectMembers.length === 0 ? (
                        <SelectItem value="none" className="text-gray-400" disabled>No members</SelectItem>
                      ) : (
                        <>
                          <SelectItem value="none" className="text-gray-300">None</SelectItem>
                          {projectMembers.map(m => (
                            <SelectItem key={m.id} value={m.user_email} className="text-gray-300">{m.user_email}</SelectItem>
                          ))}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Amount *</Label>
                    <Input 
                      type="number" 
                      min="0" 
                      step="0.01" 
                      value={form.amount || ""} 
                      onChange={(e) => {
                        const value = e.target.value;
                        // Remove leading zeros and handle empty input
                        const cleanValue = value === "" ? "" : parseFloat(value).toString();
                        setForm(f => ({ ...f, amount: cleanValue === "" ? 0 : parseFloat(cleanValue) }));
                      }}
                      className="bg-gray-800 border-gray-700" 
                      required 
                    />
                  </div>
                  <div>
                    <Label>Currency</Label>
                    <Select value={form.currency} onValueChange={(v) => setForm(f => ({ ...f, currency: v }))}>
                      <SelectTrigger className="bg-gray-800 border-gray-700"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {currencies.map(c => <SelectItem key={c} value={c} className="text-gray-300">{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Payout Method</Label>
                    <Input value={form.payout_method} onChange={(e) => setForm(f => ({ ...f, payout_method: e.target.value }))} className="bg-gray-800 border-gray-700" />
                  </div>
                  <div>
                    <Label>Scheduled For</Label>
                    <CalendarPicker 
                      value={scheduledDate} 
                      onChange={setScheduledDate}
                      placeholder="Select date (optional)"
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} className="border-gray-700 text-gray-300 hover:bg-gray-800">Cancel</Button>
                  <Button type="submit" className="bg-pink-500 hover:bg-pink-600">Create</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
      </div>
    </div>
  );
};

export default Payouts;


