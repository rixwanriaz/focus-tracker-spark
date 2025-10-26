import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/hooks/hooks';
import { getExportStatus, listExports } from '@/redux/slice/reportsSlice';

export const ExportsPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const { exports: jobs, loading } = useAppSelector((s) => s.reports);

  useEffect(() => {
    dispatch(listExports());
  }, [dispatch]);

  const pollJob = (id: string) => dispatch(getExportStatus(id));

  const download = (url?: string | null) => {
    if (!url) return;
    window.open(url, '_blank');
  };

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white">Exports</CardTitle>
      </CardHeader>
      <CardContent>
        {loading.exports ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center text-gray-400 py-10">No exports yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-gray-300">ID</TableHead>
                  <TableHead className="text-gray-300">Type</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-300">Created</TableHead>
                  <TableHead className="text-gray-300">Completed</TableHead>
                  <TableHead className="text-gray-300 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((j) => (
                  <TableRow key={j.id}>
                    <TableCell className="text-white">{j.id}</TableCell>
                    <TableCell className="text-white">{j.type}</TableCell>
                    <TableCell className="text-white">{j.status}</TableCell>
                    <TableCell className="text-white">{new Date(j.created_at).toLocaleString()}</TableCell>
                    <TableCell className="text-white">{j.completed_at ? new Date(j.completed_at).toLocaleString() : '-'}</TableCell>
                    <TableCell className="text-white text-right">
                      {j.status !== 'completed' ? (
                        <Button size="sm" variant="outline" className="border-gray-700 hover:bg-gray-800" onClick={() => pollJob(j.id)}>Refresh</Button>
                      ) : (
                        <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={() => download(j.download_url)}>Download</Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};


