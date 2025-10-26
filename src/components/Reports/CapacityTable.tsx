import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CapacityResponse } from '@/redux/api/reports';

interface Props {
  data: CapacityResponse | null;
  loading?: boolean;
}

export const CapacityTable: React.FC<Props> = ({ data, loading }) => {
  const statusColor = (status: string) => {
    switch (status) {
      case 'underbooked':
        return 'bg-green-900/40 text-green-400 border-green-800';
      case 'balanced':
        return 'bg-blue-900/40 text-blue-400 border-blue-800';
      case 'overbooked':
        return 'bg-red-900/40 text-red-400 border-red-800';
      default:
        return 'bg-gray-800 text-gray-300 border-gray-700';
    }
  };

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white">Capacity Planning</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="text-center text-gray-400 py-10">No capacity data.</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-gray-300">User</TableHead>
                  <TableHead className="text-gray-300 text-right">Available Hours</TableHead>
                  <TableHead className="text-gray-300 text-right">Booked Hours</TableHead>
                  <TableHead className="text-gray-300 text-right">Actual Hours</TableHead>
                  <TableHead className="text-gray-300 text-right">Utilization</TableHead>
                  <TableHead className="text-gray-300 text-right">Booking Load</TableHead>
                  <TableHead className="text-gray-300 text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((it) => (
                  <TableRow key={it.user_id}>
                    <TableCell className="text-white">{it.user_id}</TableCell>
                    <TableCell className="text-white text-right">{it.available_hours.toFixed(1)}</TableCell>
                    <TableCell className="text-white text-right">{it.booked_hours.toFixed(1)}</TableCell>
                    <TableCell className="text-white text-right">{it.actual_hours.toFixed(1)}</TableCell>
                    <TableCell className="text-white text-right">{Math.round(it.utilization * 100)}%</TableCell>
                    <TableCell className="text-white text-right">{Math.round(it.booking_load * 100)}%</TableCell>
                    <TableCell className="text-white text-right">
                      <Badge variant="outline" className={statusColor(it.status)}>
                        {it.status}
                      </Badge>
                    </TableCell>
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


