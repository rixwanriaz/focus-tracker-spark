import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LeaderboardResponse } from '@/redux/api/reports';

interface Props {
  data: LeaderboardResponse | null;
  loading?: boolean;
}

export const LeaderboardTable: React.FC<Props> = ({ data, loading }) => {
  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white">Profitability Leaderboard</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="text-center text-gray-400 py-10">No leaderboard data.</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-gray-300">Project</TableHead>
                  <TableHead className="text-gray-300 text-right">Revenue</TableHead>
                  <TableHead className="text-gray-300 text-right">Cost</TableHead>
                  <TableHead className="text-gray-300 text-right">Profit</TableHead>
                  <TableHead className="text-gray-300 text-right">Margin</TableHead>
                  <TableHead className="text-gray-300 text-right">Billable Hours</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((it) => (
                  <TableRow key={it.project_id}>
                    <TableCell className="text-white">{it.project_name}</TableCell>
                    <TableCell className="text-white text-right">{it.revenue.toFixed(2)}</TableCell>
                    <TableCell className="text-white text-right">{it.cost.toFixed(2)}</TableCell>
                    <TableCell className="text-white text-right">{it.profit.toFixed(2)}</TableCell>
                    <TableCell className="text-white text-right">{it.margin.toFixed(2)}%</TableCell>
                    <TableCell className="text-white text-right">{it.billable_hours.toFixed(2)}</TableCell>
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


