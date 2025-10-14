import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

const RateResolutionInfo: React.FC = () => {
  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Calendar className="w-5 h-5" />
          Rate Resolution Priority
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-gray-300 space-y-2">
          <p>Rates are resolved in the following priority order:</p>
          <ol className="list-decimal list-inside space-y-1 ml-4">
            <li>User-specific rates</li>
            <li>Project-specific rates</li>
            <li>Client-specific rates</li>
            <li>Organization default rates</li>
          </ol>
          <p className="text-gray-400 mt-4">
            The system will automatically select the most specific rate available for each time entry.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RateResolutionInfo;
