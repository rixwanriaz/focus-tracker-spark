import React, { useEffect, useState } from "react";
import { MainLayout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { acknowledgeFinanceAlert, fetchFinanceAlerts } from "@/redux/slice/financeSlice";
import { AlertTriangle, Check } from "lucide-react";
import { toast } from "sonner";

const FinanceAlerts: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { alerts, alertsLoading, alertsError } = useSelector((s: RootState) => s.finance);
  const [projectId, setProjectId] = useState("");

  useEffect(() => {
    dispatch(fetchFinanceAlerts({ project_id: undefined }));
  }, [dispatch]);

  const handleFilter = () => {
    dispatch(fetchFinanceAlerts({ project_id: projectId || undefined }));
  };

  const handleAcknowledge = async (alertId: string) => {
    try {
      await dispatch(acknowledgeFinanceAlert({ alert_id: alertId, payload: {} })).unwrap();
      toast.success("Alert acknowledged");
    } catch (err: any) {
      toast.error(err || "Failed to acknowledge alert");
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-950 text-white p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Finance Alerts</h1>
              <p className="text-gray-400">Budget and margin alerts</p>
            </div>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Filter by Project ID"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="bg-gray-900 border-gray-800 text-white w-64"
              />
              <Button variant="outline" onClick={handleFilter} className="border-gray-700 text-gray-300">Apply</Button>
            </div>
          </div>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Active Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              {alertsError && <div className="text-red-400 text-sm mb-2">{alertsError}</div>}
              <div className="overflow-x-auto">
                <Table className="min-w-full">
                  <TableHeader>
                    <TableRow className="border-gray-800">
                      <TableHead className="text-gray-300">Type</TableHead>
                      <TableHead className="text-gray-300">Severity</TableHead>
                      <TableHead className="text-gray-300">Threshold</TableHead>
                      <TableHead className="text-gray-300">Current</TableHead>
                      <TableHead className="text-gray-300">Project</TableHead>
                      <TableHead className="text-gray-300">Acknowledged</TableHead>
                      <TableHead className="text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {alerts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-gray-400 py-6">No alerts</TableCell>
                      </TableRow>
                    ) : (
                      alerts.map((a) => (
                        <TableRow key={a.id} className="border-gray-800">
                          <TableCell className="text-gray-200 text-sm flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-400" />
                            {a.alert_type}
                          </TableCell>
                          <TableCell className="text-gray-300 text-sm">{a.severity}</TableCell>
                          <TableCell className="text-gray-300 text-sm">{a.threshold ?? "—"} {a.currency || ""}</TableCell>
                          <TableCell className="text-gray-300 text-sm">{a.current_value ?? "—"} {a.currency || ""}</TableCell>
                          <TableCell className="text-gray-300 text-sm">{a.project_id || "—"}</TableCell>
                          <TableCell className="text-gray-300 text-sm">{a.acknowledged ? "Yes" : "No"}</TableCell>
                          <TableCell className="text-right">
                            {!a.acknowledged && (
                              <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white" onClick={() => handleAcknowledge(a.id)}>
                                <Check className="h-4 w-4 mr-1" /> Acknowledge
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default FinanceAlerts;




