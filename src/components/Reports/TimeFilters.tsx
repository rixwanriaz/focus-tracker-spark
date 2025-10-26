import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface TimeFiltersValue {
  from_date?: string;
  to_date?: string;
  group_by?: string; // e.g. "user" or "user,project"
  limit?: number;
  offset?: number;
}

interface TimeFiltersProps {
  value: TimeFiltersValue;
  onChange: (next: TimeFiltersValue) => void;
  onSubmit: () => void;
  onDownloadCsv: () => void;
  loading?: boolean;
  csvLoading?: boolean;
}

export const TimeFilters: React.FC<TimeFiltersProps> = ({ value, onChange, onSubmit, onDownloadCsv, loading, csvLoading }) => {
  const { from_date, to_date, group_by, limit = 50, offset = 0 } = value;

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <Label className="text-gray-300">From date</Label>
            <Input
              type="date"
              value={from_date || ''}
              onChange={(e) => onChange({ ...value, from_date: e.target.value })}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
          <div>
            <Label className="text-gray-300">To date</Label>
            <Input
              type="date"
              value={to_date || ''}
              onChange={(e) => onChange({ ...value, to_date: e.target.value })}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
          <div>
            <Label className="text-gray-300">Group by</Label>
            <Select value={group_by ?? 'none'} onValueChange={(v) => onChange({ ...value, group_by: v === 'none' ? undefined : v })}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Select grouping" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="project">Project</SelectItem>
                <SelectItem value="task">Task</SelectItem>
                <SelectItem value="user,project">User, Project</SelectItem>
                <SelectItem value="project,user">Project, User</SelectItem>
                <SelectItem value="user,task">User, Task</SelectItem>
                <SelectItem value="project,task">Project, Task</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-gray-300">Limit</Label>
            <Input
              type="number"
              min={1}
              value={limit}
              onChange={(e) => {
                const raw = e.target.value;
                const num = Number(raw);
                if (raw === '') return onChange({ ...value, limit: undefined });
                if (Number.isNaN(num) || num < 1) return; // ignore invalid
                onChange({ ...value, limit: num });
              }}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
          <div>
            <Label className="text-gray-300">Offset</Label>
            <Input
              type="number"
              min={0}
              value={offset}
              onChange={(e) => {
                const raw = e.target.value;
                const num = Number(raw);
                if (raw === '') return onChange({ ...value, offset: undefined });
                if (Number.isNaN(num) || num < 0) return; // ignore invalid
                onChange({ ...value, offset: num });
              }}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-3 mt-4">
          <Button onClick={onSubmit} disabled={loading} className="bg-purple-600 hover:bg-purple-700">
            {loading ? 'Loading…' : 'Run report'}
          </Button>
          <Button onClick={onDownloadCsv} disabled={csvLoading} variant="outline" className="border-gray-700 hover:bg-gray-800">
            {csvLoading ? 'Downloading…' : 'Download CSV'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};


