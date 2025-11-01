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
import { DailyProjectTimeItem, DailyTeamTimeItem } from '@/redux/api/reports';
import { toast } from 'sonner';

interface ProjectTeamTimeTabProps {
  projectId: string;
}

const ProjectTeamTimeTab: React.FC<ProjectTeamTimeTabProps> = ({ projectId }) => {
  const dispatch = useDispatch<AppDispatch>();

  // Local state
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(() => new Date());

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

  // Get the report data for the selected date
  const dateKey = selectedDate ? getLocalDateString(selectedDate) : '';
  const reportData = reportsState.dailyTeamTime[dateKey];
  const isLoading = reportsState.loading.dailyTeamTime[dateKey];

  // Load report data when date changes
  useEffect(() => {
    if (selectedDate && projectId) {
      const dateStr = getLocalDateString(selectedDate);
      dispatch(getDailyTeamTimeReport({
        date: dateStr,
        project_id: projectId
      })).catch((error) => {
        console.error('Failed to load daily team time report:', error);
        toast.error('Failed to load team time data');
      });
    }
  }, [dispatch, selectedDate, projectId]);

  // Filter data for the current project
  const projectTimeData: DailyProjectTimeItem | null = reportData?.projects?.find(
    (project) => project.project_id === projectId
  ) || null;

  const teamMembers = projectTimeData?.team_members || [];

  // Calculate totals
  const totalHours = teamMembers.reduce((sum, member) => sum + member.total_hours, 0);
  const totalBillableHours = teamMembers.reduce((sum, member) => sum + member.billable_hours, 0);

  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date);
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
            View how much time each team member spent on {currentProject?.name || 'this project'} for a specific day
          </p>
        </div>
      </div>

      {/* Date Selector */}
      <Card className="bg-gray-900 border-gray-800 shadow-lg rounded-xl">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-300">
              <Calendar className="h-4 w-4" />
              <span className="text-sm font-medium">Select Date:</span>
            </div>
            <CalendarPicker
              value={selectedDate}
              onChange={handleDateChange}
              className="w-48"
            />
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
                  {teamMembers.length}
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
            Time Spent on {selectedDate?.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-purple-400 mb-4" />
              <p className="text-gray-400">Loading team time data...</p>
            </div>
          ) : teamMembers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="p-4 bg-gray-800/50 rounded-full mb-4">
                <Clock className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                No time logged
              </h3>
              <p className="text-gray-400 text-sm text-center max-w-md">
                No team members logged time on {currentProject?.name || 'this project'} for the selected date.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-5 gap-4 px-6 py-4 bg-gray-950/30 border-b border-gray-800">
                <div className="col-span-2 text-sm font-semibold text-gray-300 uppercase tracking-wider">Team Member</div>
                <div className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Total Hours</div>
                <div className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Billable Hours</div>
                <div className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Billable %</div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-800/50">
                {teamMembers
                  .sort((a, b) => b.total_hours - a.total_hours) // Sort by total hours descending
                  .map((member: DailyTeamTimeItem) => (
                    <div key={member.user_id} className="grid grid-cols-5 gap-4 px-6 py-5 hover:bg-gray-800/30 transition-all duration-200 group">
                      <div className="col-span-2 flex items-center gap-4">
                        <Avatar className="h-10 w-10 ring-2 ring-gray-700 group-hover:ring-purple-500/50 transition-all duration-200">
                          <AvatarImage src={undefined} />
                          <AvatarFallback className="bg-gradient-to-br from-purple-600 to-purple-700 text-white font-semibold">
                            {member.user_email.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-white font-semibold group-hover:text-purple-300 transition-colors">
                            {member.user_email.split('@')[0]}
                          </div>
                          <div className="text-gray-400 text-sm">{member.user_email}</div>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <Badge variant="outline" className="bg-blue-900/20 border-blue-700 text-blue-300 font-medium">
                          {formatHours(member.total_hours)}h
                        </Badge>
                      </div>

                      <div className="flex items-center">
                        <Badge variant="outline" className="bg-green-900/20 border-green-700 text-green-300 font-medium">
                          {formatHours(member.billable_hours)}h
                        </Badge>
                      </div>

                      <div className="flex items-center">
                        <Badge
                          variant="outline"
                          className={`font-medium ${
                            member.total_hours > 0 && member.billable_hours / member.total_hours >= 0.8
                              ? 'bg-green-900/20 border-green-700 text-green-300'
                              : member.total_hours > 0 && member.billable_hours / member.total_hours >= 0.5
                              ? 'bg-yellow-900/20 border-yellow-700 text-yellow-300'
                              : 'bg-red-900/20 border-red-700 text-red-300'
                          }`}
                        >
                          {member.total_hours > 0 ? ((member.billable_hours / member.total_hours) * 100).toFixed(1) : 0}%
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
