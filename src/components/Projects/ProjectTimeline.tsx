import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar, Sparkles, Layers } from "lucide-react";
import { GanttChart } from "@/components/Reports/GanttChart";
import { toast } from "sonner";
import {
  GanttChartData,
  TimelineMarkers,
  TimelineBaseline,
  TimelineInsights,
  TimelineAnnotation,
  TimelineRiskItem,
  TimelineCapacityItem,
  projectApiService,
} from "@/redux/api/project";

type ZoomMode = "day" | "week" | "month";

interface ProjectTimelineProps {
  projectId: string;
}

const ProjectTimeline: React.FC<ProjectTimelineProps> = ({ projectId }) => {
  const [loading, setLoading] = useState(true);
  const [gantt, setGantt] = useState<GanttChartData | null>(null);
  const [markers, setMarkers] = useState<TimelineMarkers | null>(null);
  const [insights, setInsights] = useState<TimelineInsights | null>(null);
  const [baselines, setBaselines] = useState<TimelineBaseline[]>([]);
  const [selectedBaselineId, setSelectedBaselineId] = useState<string | null>(null);
  const [showWeekends, setShowWeekends] = useState<boolean>(true);
  const [zoom, setZoom] = useState<ZoomMode>("week");
  const [compareBaseline, setCompareBaseline] = useState<boolean>(false);
  const [risksOpen, setRisksOpen] = useState<boolean>(false);
  const [risks, setRisks] = useState<TimelineRiskItem[]>([]);
  const [capacity, setCapacity] = useState<TimelineCapacityItem[]>([]);
  const [annotations, setAnnotations] = useState<TimelineAnnotation[]>([]);

  const loadPrimary = useCallback(async () => {
    setLoading(true);
    try {
      const [markersRes, baselinesRes, ganttRes] = await Promise.all([
        projectApiService.getTimelineMarkers(projectId).catch(() => null),
        projectApiService.listBaselines(projectId).catch(() => []),
        projectApiService.getGanttChart(projectId).catch(() => null),
      ]);

      setMarkers(markersRes);
      setBaselines(baselinesRes || []);
      setGantt(ganttRes);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadPrimary();
  }, [loadPrimary]);

  // Note: insights endpoint not yet implemented on backend
  const cpiSpi = useMemo(() => {
    return { cpi: undefined, spi: undefined };
  }, []);


  const onToggleCompare = (value: boolean) => {
    setCompareBaseline(value);
  };

  const onChangeZoom = (value: ZoomMode) => {
    setZoom(value);
  };

  const onChangeWeekend = (checked: boolean) => {
    setShowWeekends(checked);
  };

  const onSelectBaseline = (baselineId: string) => {
    setSelectedBaselineId(baselineId);
  };

  const loadInsightsPanel = async () => {
    // Calculate date range: default to current month
    const today = new Date();
    const from = new Date(today.getFullYear(), today.getMonth(), 1);
    const to = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    const fromStr = from.toISOString().split('T')[0];
    const toStr = to.toISOString().split('T')[0];
    
    const [risksRes, capacityRes] = await Promise.all([
      projectApiService.getTimelineRisks(projectId).catch(() => []),
      projectApiService.getTimelineCapacity(projectId, { from: fromStr, to: toStr }).catch(() => []),
    ]);
    setRisks(risksRes || []);
    setCapacity(capacityRes || []);
  };

  useEffect(() => {
    if (risksOpen) {
      loadInsightsPanel();
    }
  }, [risksOpen]);

  return (
    <Card className="bg-gray-900 border-gray-800 shadow-xl rounded-xl overflow-hidden">
      <CardHeader className="border-b border-gray-800 bg-gradient-to-r from-gray-900 to-gray-800">
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="text-xl font-bold text-white">Project Timeline</CardTitle>

          <div className="flex items-center gap-3">
            {/* Budget used */}
            {typeof markers?.budget_percent_used === "number" && (
              <Badge variant="outline" className="text-xs">
                Budget {Math.round((markers.budget_percent_used || 0) * 100)}%
              </Badge>
            )}
            {/* CPI/SPI */}
            {(cpiSpi.cpi || cpiSpi.spi) && (
              <Badge variant="secondary" className="text-xs">
                {cpiSpi.cpi ? `CPI ${cpiSpi.cpi.toFixed(2)}` : ""}
                {cpiSpi.spi ? ` · SPI ${cpiSpi.spi.toFixed(2)}` : ""}
              </Badge>
            )}
            {/* Forecast */}
            {markers?.forecast_date && (
              <Badge variant="outline" className="text-xs">
                Forecast {new Date(markers.forecast_date).toLocaleDateString()}
              </Badge>
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Zoom */}
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-400" />
            <span className="text-sm text-gray-300">Zoom</span>
            <Select value={zoom} onValueChange={(v) => onChangeZoom(v as ZoomMode)}>
              <SelectTrigger className="h-8 w-36 bg-gray-900 border-gray-700 text-gray-200">
                <SelectValue placeholder="Zoom" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Day</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Weekends */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-purple-400" />
            <span className="text-sm text-gray-300">Show weekends</span>
            <Switch checked={showWeekends} onCheckedChange={onChangeWeekend} />
          </div>

          {/* Baselines */}
          <div className="flex items-center gap-2 justify-end">
            <Layers className="h-4 w-4 text-purple-400" />
            <span className="text-sm text-gray-300">Baseline</span>
            <Select value={selectedBaselineId || undefined} onValueChange={onSelectBaseline}>
              <SelectTrigger className="h-8 w-48 bg-gray-900 border-gray-700 text-gray-200">
                <SelectValue placeholder="Select baseline" />
              </SelectTrigger>
              <SelectContent>
                {baselines.map((b) => (
                  <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                ))}
                {baselines.length === 0 && (
                  <div className="px-2 py-1.5 text-sm text-gray-400">No baselines</div>
                )}
              </SelectContent>
            </Select>
            <Switch checked={compareBaseline} onCheckedChange={onToggleCompare} />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Timeline main viewport */}
        <GanttChart data={gantt} loading={loading} />

        {/* Insights/Risks */}
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-300">Insights</h3>
            <Button size="sm" variant="outline" className="border-gray-700 text-gray-200 hover:bg-gray-800" onClick={() => setRisksOpen((v) => !v)}>
              {risksOpen ? "Hide" : "Show"} risks & capacity
            </Button>
          </div>

          {risksOpen && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Risks</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {risks.map((r) => (
                      <li key={r.id} className="text-sm text-gray-300 flex items-center justify-between">
                        <span>{r.title}</span>
                        <Badge variant="outline" className="text-xs capitalize">{r.type}</Badge>
                      </li>
                    ))}
                    {risks.length === 0 && (
                      <div className="text-gray-500 text-sm">All clear</div>
                    )}
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800 md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Capacity (snapshot)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {capacity.map((c) => (
                      <div key={c.user_id} className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                        <div className="text-xs font-medium text-gray-300 mb-1">{c.user_email || `User ${c.user_id.slice(0, 6)}`}</div>
                        <div className="space-y-1">
                          <div className="text-sm text-gray-400">Available: <span className="text-white">{c.available_hours}h</span></div>
                          <div className="text-sm text-gray-400">Booked: <span className="text-white">{c.booked_hours}h</span></div>
                          <div className="text-sm text-gray-400">Actual: <span className="text-white">{c.actual_hours}h</span></div>
                        </div>
                        <div className="mt-2 pt-2 border-t border-gray-700">
                          <div className="text-xs text-gray-500">
                            Utilization: <span className={`font-medium ${c.utilization > 0.8 ? 'text-orange-400' : c.utilization > 0.5 ? 'text-yellow-400' : 'text-green-400'}`}>
                              {(c.utilization * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {capacity.length === 0 && (
                      <div className="text-gray-500 text-sm">No capacity data</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectTimeline;


