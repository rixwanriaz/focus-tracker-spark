import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import { fetchMyProjectCost, fetchProjectUserCosts } from "@/redux/slice/financeSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarPicker } from "@/components/ui/calendar-picker";
import { PermissionGate } from "@/components/ui/PermissionGate";
import { RefreshCw, Users, DollarSign, Clock, Shield } from "lucide-react";
import { format } from "date-fns";

interface Props {
  projectId: string;
}

const toIso = (d?: Date) => (d ? d.toISOString() : undefined);
const monthStart = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), 1);
const monthEnd = (d = new Date()) => new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);

const ProjectUserCostsTab: React.FC<Props> = ({ projectId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { myProjectCost, projectUserCosts, perUserCostsLoading, perUserCostsError } = useSelector(
    (s: RootState) => s.finance
  );

  const [startDate, setStartDate] = useState<Date | undefined>(monthStart());
  const [endDate, setEndDate] = useState<Date | undefined>(monthEnd());

  const key = useMemo(() => `${projectId}|${toIso(startDate) || ""}|${toIso(endDate) || ""}`, [projectId, startDate, endDate]);

  const myCost = myProjectCost[key];
  const allCosts = projectUserCosts[key];

  useEffect(() => {
    const start = toIso(startDate);
    const end = toIso(endDate);
    dispatch(fetchMyProjectCost({ project_id: projectId, start, end }));
    dispatch(fetchProjectUserCosts({ project_id: projectId, start, end }));
  }, [dispatch, projectId, startDate, endDate]);

  const handleRefresh = () => {
    const start = toIso(startDate);
    const end = toIso(endDate);
    dispatch(fetchMyProjectCost({ project_id: projectId, start, end }));
    dispatch(fetchProjectUserCosts({ project_id: projectId, start, end }));
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="col-span-2">
              <label className="block text-xs text-gray-400 mb-1">Start date</label>
              <CalendarPicker value={startDate} onChange={setStartDate} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-gray-400 mb-1">End date</label>
              <CalendarPicker value={endDate} onChange={setEndDate} />
            </div>
          </div>
          <div className="flex justify-end mt-3">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={perUserCostsLoading} className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white">
              <RefreshCw className={`mr-2 h-4 w-4 ${perUserCostsLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* My summary */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2"><Shield className="h-4 w-4 text-blue-400" /> My Cost Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {perUserCostsError && (
            <div className="text-red-400 text-sm mb-2">{perUserCostsError}</div>
          )}
          {!myCost ? (
            <div className="text-gray-400 text-sm">{perUserCostsLoading ? "Loading..." : "No data"}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-400" />
                <div>
                  <p className="text-xs text-gray-400">Hours</p>
                  <p className="text-lg font-semibold text-white">{myCost.hours.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-400" />
                <div>
                  <p className="text-xs text-gray-400">Cost</p>
                  <p className="text-lg font-semibold text-white">{myCost.currency} {myCost.cost.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">Date range</p>
                  <p className="text-sm text-gray-300">{myCost.start ? format(new Date(myCost.start), "dd/MM/yyyy") : "-"} – {myCost.end ? format(new Date(myCost.end), "dd/MM/yyyy") : "-"}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* All users table (finance:read) */}
      <PermissionGate permission="finance:read" fallback={<></>}>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2"><Users className="h-4 w-4 text-orange-400" /> Project User Costs</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {!allCosts ? (
              <div className="p-4 text-gray-400 text-sm">{perUserCostsLoading ? "Loading..." : "No data"}</div>
            ) : (
              <div className="overflow-x-auto">
                <Table className="min-w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-gray-300">User</TableHead>
                      <TableHead className="text-gray-300">Hours</TableHead>
                      <TableHead className="text-gray-300">Cost</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allCosts.users.map((u) => (
                      <TableRow key={u.user_id}>
                        <TableCell className="text-gray-200 text-sm">{u.user_id}</TableCell>
                        <TableCell className="text-gray-200 text-sm">{u.hours.toFixed(2)}</TableCell>
                        <TableCell className="text-gray-200 text-sm">{u.currency} {u.cost.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell className="text-gray-400 text-xs">Totals</TableCell>
                      <TableCell className="text-gray-300 font-medium">{allCosts.total_hours.toFixed(2)}</TableCell>
                      <TableCell className="text-gray-300 font-medium">{allCosts.currency} {allCosts.total_cost.toFixed(2)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </PermissionGate>
    </div>
  );
};

export default ProjectUserCostsTab;


