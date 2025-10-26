import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TimeReportResponse } from '@/redux/api/reports';

interface Props {
  data: TimeReportResponse | null;
  loading?: boolean;
}

export const TimeReportTable: React.FC<Props> = ({ data, loading }) => {
  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white">Time Report</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        ) : !data || data.rows.length === 0 ? (
          <div className="text-center text-gray-400 py-10">No data for selected filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-gray-300">User</TableHead>
                  <TableHead className="text-gray-300">Project</TableHead>
                  <TableHead className="text-gray-300">Task</TableHead>
                  <TableHead className="text-gray-300 text-right">Total Hours</TableHead>
                  <TableHead className="text-gray-300 text-right">Billable Hours</TableHead>
                  <TableHead className="text-gray-300 text-right">Billable Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.rows.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="text-white">{row.user_id || '-'}</TableCell>
                    <TableCell className="text-white">{row.project_id || '-'}</TableCell>
                    <TableCell className="text-white">{row.task_id || '-'}</TableCell>
                    <TableCell className="text-white text-right">{row.total_hours?.toFixed(2)}</TableCell>
                    <TableCell className="text-white text-right">{row.billable_hours == null ? '-' : row.billable_hours.toFixed(2)}</TableCell>
                    <TableCell className="text-white text-right">{row.billable_value == null ? '-' : row.billable_value.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="text-gray-400 text-sm mt-3">Total: {data.total_count}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};


