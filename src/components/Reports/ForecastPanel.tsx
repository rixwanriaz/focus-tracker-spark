import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/hooks/hooks';
import { computeForecast, getForecast } from '@/redux/slice/reportsSlice';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
  projectId: string | undefined;
}

export const ForecastPanel: React.FC<Props> = ({ projectId }) => {
  const dispatch = useAppDispatch();
  const { forecast, loading } = useAppSelector((s) => s.reports);
  const [lookbackDays, setLookbackDays] = useState<number>(30);

  useEffect(() => {
    if (projectId) dispatch(getForecast({ projectId }));
  }, [dispatch, projectId]);

  if (!projectId) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Forecast</CardTitle>
          <CardDescription>Select a project to view forecast.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const data = forecast[projectId];
  const busy = !!loading.forecast[projectId];

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white">Forecast</CardTitle>
        <CardDescription>Predict budget exhaustion date</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <Label className="text-gray-300">Lookback days</Label>
            <Input type="number" min={7} value={lookbackDays} onChange={(e) => setLookbackDays(Number(e.target.value) || 0)} className="bg-gray-800 border-gray-700 text-white" />
          </div>
          <div className="flex items-end">
            <Button
              className="bg-purple-600 hover:bg-purple-700"
              disabled={busy}
              onClick={() => projectId && dispatch(computeForecast({ projectId, body: { lookback_days: lookbackDays } }))}
            >
              {busy ? 'Computing…' : 'Compute forecast'}
            </Button>
          </div>
        </div>

        {!data ? (
          <div className="text-gray-400">No forecast yet for this project.</div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-800/50 rounded-lg">
                <div className="text-sm text-gray-400">Method</div>
                <div className="text-white font-medium">{data.method}</div>
              </div>
              <div className="p-4 bg-gray-800/50 rounded-lg">
                <div className="text-sm text-gray-400">Predicted Exhaustion</div>
                <div className="text-white font-medium">{new Date(data.predicted_budget_exhausted_date).toLocaleDateString()}</div>
              </div>
              {data.confidence_band && (data.confidence_band as any).low_date && (data.confidence_band as any).high_date ? (
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-sm text-gray-400">Confidence Band</div>
                  <div className="text-white font-medium">{new Date((data.confidence_band as any).low_date).toLocaleDateString()} – {new Date((data.confidence_band as any).high_date).toLocaleDateString()}</div>
                </div>
              ) : (
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-sm text-gray-400">Confidence Band</div>
                  <div className="text-white font-medium">Not available</div>
                </div>
              )}
            </div>
            {data.explanation && (
              <div className="text-gray-300 text-sm">{data.explanation}</div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};


