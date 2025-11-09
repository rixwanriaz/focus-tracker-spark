import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Users, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { getDailyTeamTimeReport } from '@/redux/slice/reportsSlice';
import { CalendarPicker } from '@/components/ui/calendar-picker';
import { DailyProjectTimeItem, DailyTeamTimeDateItem, DailyTeamTimeItem } from '@/redux/api/reports';
import { toast } from 'sonner';

interface ProjectTeamTimeTabProps {
  projectId: string;
}

const ProjectTeamTimeTab: React.FC<ProjectTeamTimeTabProps> = ({ projectId }) => {
  const dispatch = useDispatch<AppDispatch>();

  // Local state
  const [fromDate, setFromDate] = useState<Date | undefined>(() => {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);
    return weekAgo;
  });
  const [toDate, setToDate] = useState<Date | undefined>(() => new Date());

  // Redux state
  const reportsState = useSelector((state: RootState) => state.reports);
  const currentProject = useSelector((state: RootState) => state.project.currentProject);

  // Helper function to format date as YYYY-MM-DD in local timezone (not UTC)
  const getLocalDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Get the report data for the selected date range
  const dateRangeKey = (fromDate && toDate) ? `${getLocalDateString(fromDate)}_${getLocalDateString(toDate)}` : '';
  const reportData = reportsState.dailyTeamTime[dateRangeKey];
  const isLoading = reportsState.loading.dailyTeamTime[dateRangeKey];

  // Load report data when date range changes
  useEffect(() => {
    if (fromDate && toDate && projectId) {
      const fromStr = getLocalDateString(fromDate);
      const toStr = getLocalDateString(toDate);
      dispatch(getDailyTeamTimeReport({
        from_date: fromStr,
        to_date: toStr,
        project_id: projectId
      })).catch((error) => {
        console.error('Failed to load daily team time report:', error);
        toast.error('Failed to load team time data');
      });
    }
  }, [dispatch, fromDate, toDate, projectId]);

  // Filter data for the current project
  const projectTimeData: DailyProjectTimeItem | null = reportData?.projects?.find(
    (project) => project.project_id === projectId
  ) || null;

  // Flatten the date-based data into a single array for display
  const flattenedTimeData: Array<{ date: string; dateObj: Date; member: DailyTeamTimeItem }> = [];
  if (projectTimeData?.dates) {
    projectTimeData.dates.forEach(dateItem => {
      dateItem.team_members.forEach(member => {
        flattenedTimeData.push({
          date: dateItem.date,
          dateObj: new Date(dateItem.date),
          member
        });
      });
    });
  }

  // Calculate totals
  const totalHours = flattenedTimeData.reduce((sum, item) => sum + item.member.total_hours, 0);
  const totalBillableHours = flattenedTimeData.reduce((sum, item) => sum + item.member.billable_hours, 0);

  // Get unique team members count
  const uniqueTeamMembers = new Set(flattenedTimeData.map(item => item.member.user_id));
  const teamMembersCount = uniqueTeamMembers.size;

  const handleFromDateChange = (date: Date | undefined) => {
    setFromDate(date);
  };

  const handleToDateChange = (date: Date | undefined) => {
    setToDate(date);
  };

  const formatHours = (hours: number) => {
    return hours.toFixed(2);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Team Time Tracking</h2>
          <p className="text-gray-400 text-sm mt-1">
            View how much time each team member spent on {currentProject?.name || 'this project'} for the selected date range
          </p>
        </div>
      </div>

      {/* Date Range Selector */}
      <Card className="bg-gray-900 border-gray-800 shadow-lg rounded-xl">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-300">
              <Calendar className="h-4 w-4" />
              <span className="text-sm font-medium">Date Range:</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">From:</span>
              <CalendarPicker
                value={fromDate}
                onChange={handleFromDateChange}
                className="w-36"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">To:</span>
              <CalendarPicker
                value={toDate}
                onChange={handleToDateChange}
                className="w-36"
              />
            </div>
            {isLoading && (
              <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <Card className="bg-gradient-to-br from-blue-900/30 to-blue-800/10 border-blue-800/50 hover:border-blue-700 transition-all hover:shadow-xl hover:scale-105 group">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-blue-300 group-hover:text-blue-200 transition-colors">
                  Team Members
                </p>
                <p className="text-3xl font-bold text-white">
                  {teamMembersCount}
                </p>
              </div>
              <div className="p-3 bg-blue-900/40 rounded-xl border border-blue-800/50 group-hover:bg-blue-900/60 transition-colors">
                <Users className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-900/30 to-green-800/10 border-green-800/50 hover:border-green-700 transition-all hover:shadow-xl hover:scale-105 group">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-green-300 group-hover:text-green-200 transition-colors">
                  Total Hours
                </p>
                <p className="text-3xl font-bold text-white">
                  {formatHours(totalHours)}
                </p>
              </div>
              <div className="p-3 bg-green-900/40 rounded-xl border border-green-800/50 group-hover:bg-green-900/60 transition-colors">
                <Clock className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900/30 to-purple-800/10 border-purple-800/50 hover:border-purple-700 transition-all hover:shadow-xl hover:scale-105 group">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-purple-300 group-hover:text-purple-200 transition-colors">
                  Billable Hours
                </p>
                <p className="text-3xl font-bold text-white">
                  {formatHours(totalBillableHours)}
                </p>
              </div>
              <div className="p-3 bg-purple-900/40 rounded-xl border border-purple-800/50 group-hover:bg-purple-900/60 transition-colors">
                <Clock className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-900/30 to-orange-800/10 border-orange-800/50 hover:border-orange-700 transition-all hover:shadow-xl hover:scale-105 group">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-orange-300 group-hover:text-orange-200 transition-colors">
                  Billable %
                </p>
                <p className="text-3xl font-bold text-white">
                  {totalHours > 0 ? ((totalBillableHours / totalHours) * 100).toFixed(1) : 0}%
                </p>
              </div>
              <div className="p-3 bg-orange-900/40 rounded-xl border border-orange-800/50 group-hover:bg-orange-900/60 transition-colors">
                <AlertCircle className="h-6 w-6 text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Time Data */}
      <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 shadow-xl">
        <CardHeader className="bg-gray-950/50 border-b border-gray-800">
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <Clock className="h-5 w-5 text-purple-400" />
            Time Spent from {fromDate?.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })} to {toDate?.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-purple-400 mb-4" />
              <p className="text-gray-400">Loading team time data...</p>
            </div>
          ) : flattenedTimeData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="p-4 bg-gray-800/50 rounded-full mb-4">
                <Clock className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                No time logged
              </h3>
              <p className="text-gray-400 text-sm text-center max-w-md">
                No team members logged time on {currentProject?.name || 'this project'} for the selected date range.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-6 gap-4 px-6 py-4 bg-gray-950/30 border-b border-gray-800">
                <div className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Date</div>
                <div className="col-span-2 text-sm font-semibold text-gray-300 uppercase tracking-wider">Team Member</div>
                <div className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Total Hours</div>
                <div className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Billable Hours</div>
                <div className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Billable %</div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-800/50">
                {flattenedTimeData
                  .sort((a, b) => {
                    // Sort by date descending, then by total hours descending
                    const dateCompare = b.dateObj.getTime() - a.dateObj.getTime();
                    if (dateCompare !== 0) return dateCompare;
                    return b.member.total_hours - a.member.total_hours;
                  })
                  .map((item, index) => (
                    <div key={`${item.date}-${item.member.user_id}`} className="grid grid-cols-6 gap-4 px-6 py-5 hover:bg-gray-800/30 transition-all duration-200 group">
                      <div className="flex items-center">
                        <Badge variant="outline" className="bg-gray-800/50 border-gray-600 text-gray-300 font-medium">
                          {item.dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </Badge>
                      </div>

                      <div className="col-span-2 flex items-center gap-4">
                        <Avatar className="h-10 w-10 ring-2 ring-gray-700 group-hover:ring-purple-500/50 transition-all duration-200">
                          <AvatarImage src={undefined} />
                          <AvatarFallback className="bg-gradient-to-br from-purple-600 to-purple-700 text-white font-semibold">
                            {item.member.user_email.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-white font-semibold group-hover:text-purple-300 transition-colors">
                            {item.member.user_email.split('@')[0]}
                          </div>
                          <div className="text-gray-400 text-sm">{item.member.user_email}</div>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <Badge variant="outline" className="bg-blue-900/20 border-blue-700 text-blue-300 font-medium">
                          {formatHours(item.member.total_hours)}h
                        </Badge>
                      </div>

                      <div className="flex items-center">
                        <Badge variant="outline" className="bg-green-900/20 border-green-700 text-green-300 font-medium">
                          {formatHours(item.member.billable_hours)}h
                        </Badge>
                      </div>

                      <div className="flex items-center">
                        <Badge
                          variant="outline"
                          className={`font-medium ${
                            item.member.total_hours > 0 && item.member.billable_hours / item.member.total_hours >= 0.8
                              ? 'bg-green-900/20 border-green-700 text-green-300'
                              : item.member.total_hours > 0 && item.member.billable_hours / item.member.total_hours >= 0.5
                              ? 'bg-yellow-900/20 border-yellow-700 text-yellow-300'
                              : 'bg-red-900/20 border-red-700 text-red-300'
                          }`}
                        >
                          {item.member.total_hours > 0 ? ((item.member.billable_hours / item.member.total_hours) * 100).toFixed(1) : 0}%
                        </Badge>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export { ProjectTeamTimeTab };
