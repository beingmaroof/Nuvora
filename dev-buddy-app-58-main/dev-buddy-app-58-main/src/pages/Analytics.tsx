import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BarChart3, TrendingUp, Calendar, Smile, Meh, Frown, Download, Clock, Sun, Moon, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { BottomNavigation } from "@/components/BottomNavigation";
import { toast } from "sonner";
import { format, subDays, subWeeks, subMonths, startOfDay, endOfDay, isSameDay, getHours, parseISO } from "date-fns";
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell, AreaChart, Area, ComposedChart, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";
import type { MoodEntry } from "@/types/mood";

const COLORS = ['#8B5FBF', '#A8C09A', '#FFB5A7', '#F5F7FA'];

const MOOD_COLORS = {
  positive: '#A8C09A',
  neutral: '#F5F7FA',
  negative: '#FFB5A7'
};

export default function Analytics() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState("week");
  const [moodData, setMoodData] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEntries: 0,
    averageMood: 0,
    positiveDays: 0,
    neutralDays: 0,
    negativeDays: 0,
    streak: 0,
    consistency: 0,
    mostFrequentMood: '',
    bestDay: '',
    worstDay: ''
  });

  useEffect(() => {
    loadMoodData();
  }, [user, timeRange]);

  const loadMoodData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Calculate date range based on selected time range
      const now = new Date();
      let startDate: Date;
      
      switch (timeRange) {
        case "week":
          startDate = subWeeks(now, 1);
          break;
        case "month":
          startDate = subMonths(now, 1);
          break;
        case "3months":
          startDate = subMonths(now, 3);
          break;
        case "year":
          startDate = subMonths(now, 12);
          break;
        default:
          startDate = subWeeks(now, 1);
      }
      
      const { data, error } = await supabase
        .from("mood_entries")
        .select("*")
        .eq("user_id", user.id)
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: true });

      if (error) throw error;
      
      setMoodData(data || []);
      calculateStats(data || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: MoodEntry[]) => {
    if (data.length === 0) {
      setStats({
        totalEntries: 0,
        averageMood: 0,
        positiveDays: 0,
        neutralDays: 0,
        negativeDays: 0,
        streak: 0,
        consistency: 0,
        mostFrequentMood: '',
        bestDay: '',
        worstDay: ''
      });
      return;
    }

    // Group entries by date
    const entriesByDate: Record<string, MoodEntry[]> = {};
    data.forEach(entry => {
      const date = format(new Date(entry.created_at), "yyyy-MM-dd");
      if (!entriesByDate[date]) {
        entriesByDate[date] = [];
      }
      entriesByDate[date].push(entry);
    });

    // Calculate stats
    const totalEntries = data.length;
    
    // Count days based on predominant mood category for each day
    let positiveDays = 0;
    let negativeDays = 0;
    let neutralDays = 0;
    
    Object.values(entriesByDate).forEach(entries => {
      // Count mood categories for this day
      const categoryCounts = {
        positive: entries.filter(e => e.mood_category === 'positive').length,
        negative: entries.filter(e => e.mood_category === 'negative').length,
        neutral: entries.filter(e => e.mood_category === 'neutral').length
      };
      
      // Determine predominant category for the day
      const predominantCategory = Object.entries(categoryCounts)
        .sort((a, b) => b[1] - a[1])[0][0];
      
      // Increment the appropriate day counter
      switch (predominantCategory) {
        case 'positive':
          positiveDays++;
          break;
        case 'negative':
          negativeDays++;
          break;
        case 'neutral':
          neutralDays++;
          break;
      }
    });

    // Calculate average mood intensity
    const avgIntensity = data.reduce((sum, entry) => sum + entry.mood_intensity, 0) / totalEntries;

    // Find most frequent mood
    const moodCounts: Record<string, number> = {};
    data.forEach(entry => {
      const mood = entry.mood_label;
      moodCounts[mood] = (moodCounts[mood] || 0) + 1;
    });
    const mostFrequentMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '';

    // Find best and worst days based on average intensity
    const dayAverages: Record<string, number> = {};
    Object.entries(entriesByDate).forEach(([date, entries]) => {
      const avg = entries.reduce((sum, entry) => sum + entry.mood_intensity, 0) / entries.length;
      dayAverages[date] = avg;
    });
    
    const sortedDays = Object.entries(dayAverages).sort((a, b) => b[1] - a[1]);
    const bestDay = sortedDays[0] ? format(new Date(sortedDays[0][0]), "MMM dd, yyyy") : '';
    const worstDay = sortedDays.length > 1 ? format(new Date(sortedDays[sortedDays.length - 1][0]), "MMM dd, yyyy") : '';

    // Calculate streak (consecutive days with entries)
    // Convert to sorted array of unique dates
    const sortedDates = Object.keys(entriesByDate)
      .map(date => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d;
      })
      .sort((a, b) => a.getTime() - b.getTime());
    
    let streak = 0;
    if (sortedDates.length > 0) {
      // Calculate streak from the most recent date backwards
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let currentDate = today;
      
      // Check if we have an entry for today
      const hasEntryToday = sortedDates.some(date => date.getTime() === currentDate.getTime());
      
      if (hasEntryToday) {
        streak = 1;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        // Check yesterday
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const hasEntryYesterday = sortedDates.some(date => date.getTime() === yesterday.getTime());
        
        if (hasEntryYesterday) {
          streak = 1;
          currentDate = yesterday;
          currentDate.setDate(currentDate.getDate() - 1);
        }
      }
      
      // Continue counting backwards while we have consecutive entries
      while (sortedDates.some(date => date.getTime() === currentDate.getTime())) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      }
    }

    // Calculate consistency (percentage of days with entries in the selected period)
    const now = new Date();
    let startDate: Date;
    
    switch (timeRange) {
      case "week":
        startDate = subWeeks(now, 1);
        break;
      case "month":
        startDate = subMonths(now, 1);
        break;
      case "3months":
        startDate = subMonths(now, 3);
        break;
      case "year":
        startDate = subMonths(now, 12);
        break;
      default:
        startDate = subWeeks(now, 1);
    }
    
    // Calculate actual number of days in the period
    const timeDiff = Math.abs(now.getTime() - startDate.getTime());
    const totalDaysInPeriod = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    const consistency = Math.round((Object.keys(entriesByDate).length / totalDaysInPeriod) * 100);

    setStats({
      totalEntries,
      averageMood: parseFloat(avgIntensity.toFixed(1)),
      positiveDays,
      neutralDays,
      negativeDays,
      streak,
      consistency,
      mostFrequentMood,
      bestDay,
      worstDay
    });
  };

  // Prepare data for charts
  const getChartData = () => {
    if (moodData.length === 0) return [];
    
    // Group by date
    const groupedData: Record<string, { 
      date: string; 
      positive: number; 
      neutral: number; 
      negative: number;
      avgIntensity: number;
      entries: number;
      fullDate: string;
    }> = {};
    
    moodData.forEach(entry => {
      const dateKey = format(new Date(entry.created_at), "yyyy-MM-dd");
      const displayDate = format(new Date(entry.created_at), "MMM dd");
      if (!groupedData[dateKey]) {
        groupedData[dateKey] = {
          date: displayDate,
          fullDate: dateKey,
          positive: 0,
          neutral: 0,
          negative: 0,
          avgIntensity: 0,
          entries: 0
        };
      }
      
      groupedData[dateKey].entries++;
      
      switch (entry.mood_category) {
        case 'positive':
          groupedData[dateKey].positive++;
          break;
        case 'neutral':
          groupedData[dateKey].neutral++;
          break;
        case 'negative':
          groupedData[dateKey].negative++;
          break;
      }
      
      // Calculate average intensity for this date
      const entriesForDate = moodData.filter(e => 
        format(new Date(e.created_at), "yyyy-MM-dd") === dateKey
      );
      const avgIntensity = entriesForDate.reduce((sum, e) => sum + e.mood_intensity, 0) / entriesForDate.length;
      groupedData[dateKey].avgIntensity = parseFloat(avgIntensity.toFixed(1));
    });
    
    return Object.values(groupedData);
  };

  // Prepare data for pie chart
  const getPieData = () => {
    return [
      { name: 'Positive', value: stats.positiveDays },
      { name: 'Neutral', value: stats.neutralDays },
      { name: 'Negative', value: stats.negativeDays }
    ];
  };

  // Prepare data for mood intensity over time
  const getIntensityData = () => {
    return getChartData().map(item => ({
      date: item.date,
      intensity: item.avgIntensity,
      entries: item.entries
    }));
  };

  // Prepare data for time of day analysis
  const getTimeOfDayData = () => {
    if (moodData.length === 0) return [];
    
    const timeData = [
      { time: 'Morning', count: 0, avgIntensity: 0, entries: 0 },
      { time: 'Afternoon', count: 0, avgIntensity: 0, entries: 0 },
      { time: 'Evening', count: 0, avgIntensity: 0, entries: 0 },
      { time: 'Night', count: 0, avgIntensity: 0, entries: 0 }
    ];
    
    moodData.forEach(entry => {
      const hour = getHours(parseISO(entry.created_at));
      let timeIndex = 0;
      
      if (hour >= 5 && hour < 12) {
        timeIndex = 0; // Morning
      } else if (hour >= 12 && hour < 17) {
        timeIndex = 1; // Afternoon
      } else if (hour >= 17 && hour < 21) {
        timeIndex = 2; // Evening
      } else {
        timeIndex = 3; // Night
      }
      
      timeData[timeIndex].count++;
      timeData[timeIndex].entries += entry.mood_intensity;
    });
    
    // Calculate average intensities
    timeData.forEach(item => {
      if (item.count > 0) {
        item.avgIntensity = parseFloat((item.entries / item.count).toFixed(1));
      }
    });
    
    return timeData;
  };

  // Prepare comparative data
  const getComparativeData = () => {
    if (moodData.length === 0) return [];
    
    // Get data for current and previous period
    const currentData = chartData.slice(-7); // Last 7 days
    const previousData = chartData.slice(-14, -7); // Previous 7 days
    
    // Calculate averages
    const currentAvg = currentData.length > 0 
      ? currentData.reduce((sum, item) => sum + item.avgIntensity, 0) / currentData.length
      : 0;
      
    const previousAvg = previousData.length > 0 
      ? previousData.reduce((sum, item) => sum + item.avgIntensity, 0) / previousData.length
      : 0;
    
    return [
      { period: 'Previous Week', avgIntensity: parseFloat(previousAvg.toFixed(1)) },
      { period: 'Current Week', avgIntensity: parseFloat(currentAvg.toFixed(1)) }
    ];
  };

  const handleExportData = async () => {
    if (!user) return;
    
    try {
      toast.info("Exporting analytics data...");
      
      // Create CSV data
      const headers = ['Date', 'Mood Emoji', 'Mood Label', 'Category', 'Intensity', 'Notes'];
      const csvContent = [
        headers.join(','),
        ...moodData.map(entry => [
          `"${format(new Date(entry.created_at), "yyyy-MM-dd HH:mm")}"`,
          `"${entry.mood_emoji}"`,
          `"${entry.mood_label}"`,
          `"${entry.mood_category}"`,
          entry.mood_intensity,
          `"${entry.notes || ''}"`
        ].join(','))
      ].join('\n');
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `nuvora-analytics-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Analytics data exported successfully!");
    } catch (error: any) {
      console.error("Export error:", error);
      toast.error("Failed to export analytics data. Please try again.");
    }
  };

  const handleExportPDF = async () => {
    toast.info("PDF export feature coming soon!");
  };

  const handleExportJSON = async () => {
    if (!user) return;
    
    try {
      toast.info("Exporting analytics data as JSON...");
      
      // Create JSON data
      const exportData = {
        metadata: {
          exportedAt: new Date().toISOString(),
          timeRange,
          totalEntries: stats.totalEntries
        },
        stats,
        moodData: moodData.map(entry => ({
          date: format(new Date(entry.created_at), "yyyy-MM-dd HH:mm"),
          mood: entry.mood_emoji + ' ' + entry.mood_label,
          category: entry.mood_category,
          intensity: entry.mood_intensity,
          notes: entry.notes
        }))
      };
      
      // Create and download file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `nuvora-analytics-${new Date().toISOString().split('T')[0]}.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Analytics data exported as JSON successfully!");
    } catch (error: any) {
      console.error("Export error:", error);
      toast.error("Failed to export analytics data as JSON. Please try again.");
    }
  };

  const chartData = getChartData();
  const pieData = getPieData();
  const intensityData = getIntensityData();
  const timeOfDayData = getTimeOfDayData();
  const comparativeData = getComparativeData();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 p-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 p-4 pb-20">
      <div className="max-w-6xl mx-auto py-8 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-accent font-bold text-primary">
            Mood Analytics
          </h1>
          <div className="ml-auto flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportData}>
              <Download className="mr-2 h-4 w-4" />
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportJSON}>
              <Download className="mr-2 h-4 w-4" />
              JSON
            </Button>
          </div>
        </div>

        {/* Time Range Selector */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Time Period</h2>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Last Week</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                  <SelectItem value="3months">Last 3 Months</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEntries}</div>
              <p className="text-xs text-muted-foreground">Mood entries</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Mood</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageMood}/5</div>
              <p className="text-xs text-muted-foreground">Intensity score</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.streak} days</div>
              <p className="text-xs text-muted-foreground">Consecutive entries</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Consistency</CardTitle>
              <Smile className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.consistency}%</div>
              <p className="text-xs text-muted-foreground">Tracking consistency</p>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Most Frequent Mood</CardTitle>
              <Smile className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{stats.mostFrequentMood || 'N/A'}</div>
              <p className="text-xs text-muted-foreground">Your go-to mood</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Best Day</CardTitle>
              <Sun className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{stats.bestDay || 'N/A'}</div>
              <p className="text-xs text-muted-foreground">Highest average mood</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Challenging Day</CardTitle>
              <Moon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{stats.worstDay || 'N/A'}</div>
              <p className="text-xs text-muted-foreground">Lowest average mood</p>
            </CardContent>
          </Card>
        </div>

        {/* Mood Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Mood Trends Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => {
                        switch (name) {
                          case 'positive': return [value, 'Positive'];
                          case 'neutral': return [value, 'Neutral'];
                          case 'negative': return [value, 'Negative'];
                          default: return [value, name];
                        }
                      }}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Legend />
                    <Bar dataKey="positive" name="Positive" fill={MOOD_COLORS.positive} />
                    <Bar dataKey="neutral" name="Neutral" fill={MOOD_COLORS.neutral} />
                    <Bar dataKey="negative" name="Negative" fill={MOOD_COLORS.negative} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                  <p>No data available for the selected period</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mood Intensity Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Mood Intensity Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            {intensityData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={intensityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 5]} />
                    <Tooltip 
                      formatter={(value) => [value, 'Intensity']}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="intensity" 
                      name="Mood Intensity" 
                      stroke="#8B5FBF" 
                      fill="#8B5FBF" 
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4" />
                  <p>No intensity data available</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mood Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Mood Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {pieData.some(item => item.value > 0) ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={MOOD_COLORS[entry.name.toLowerCase() as keyof typeof MOOD_COLORS] || COLORS[index % COLORS.length]} 
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name) => {
                          switch (name) {
                            case 'Positive': return [value, 'Positive Days'];
                            case 'Neutral': return [value, 'Neutral Days'];
                            case 'Negative': return [value, 'Negative Days'];
                            default: return [value, name];
                          }
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Smile className="h-12 w-12 mx-auto mb-4" />
                    <p>No mood data available</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Time of Day Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Time of Day Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              {timeOfDayData.some(item => item.count > 0) ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={timeOfDayData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis yAxisId="left" orientation="left" />
                      <YAxis yAxisId="right" orientation="right" domain={[0, 5]} />
                      <Tooltip 
                        formatter={(value, name) => {
                          if (name === 'avgIntensity') return [value, 'Avg. Intensity'];
                          if (name === 'count') return [value, 'Entries'];
                          return [value, name];
                        }}
                      />
                      <Legend />
                      <Bar yAxisId="left" dataKey="count" name="Entries" fill="#8884d8" />
                      <Bar yAxisId="right" dataKey="avgIntensity" name="Avg. Intensity" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Clock className="h-12 w-12 mx-auto mb-4" />
                    <p>No time data available</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Comparative Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Week-over-Week Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            {comparativeData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={comparativeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis domain={[0, 5]} />
                    <Tooltip 
                      formatter={(value) => [value, 'Avg. Intensity']}
                    />
                    <Legend />
                    <Bar dataKey="avgIntensity" name="Avg. Intensity" fill="#8884d8" />
                    <Line type="monotone" dataKey="avgIntensity" name="Trend" stroke="#ff7300" strokeWidth={2} dot={{ r: 4 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4" />
                  <p>No comparative data available</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mood Category Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Mood Category Trends</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="positive" name="Positive" stroke={MOOD_COLORS.positive} strokeWidth={2} dot={{ r: 2 }} />
                    <Line type="monotone" dataKey="neutral" name="Neutral" stroke={MOOD_COLORS.neutral} strokeWidth={2} dot={{ r: 2 }} />
                    <Line type="monotone" dataKey="negative" name="Negative" stroke={MOOD_COLORS.negative} strokeWidth={2} dot={{ r: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4" />
                  <p>No trend data available</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

          {/* Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-primary/5 rounded-lg">
                  <h3 className="font-semibold mb-2">Mood Patterns</h3>
                  <p className="text-sm text-muted-foreground">
                    {stats.positiveDays > stats.negativeDays 
                      ? "You've been experiencing more positive moods recently. Keep up the good work!" 
                      : stats.negativeDays > stats.positiveDays 
                      ? "Consider focusing on activities that boost your mood. Remember, it's okay to have difficult days." 
                      : "Your moods are well balanced. Continue maintaining this healthy pattern."}
                  </p>
                </div>
                
                <div className="p-4 bg-secondary/5 rounded-lg">
                  <h3 className="font-semibold mb-2">Consistency</h3>
                  <p className="text-sm text-muted-foreground">
                    {stats.streak > 3 
                      ? `Great job maintaining your streak of ${stats.streak} consecutive days! Consistency is key to building healthy habits.` 
                      : "Try to log your mood daily to build a consistent tracking habit and gain better insights."}
                  </p>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${stats.consistency}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{stats.consistency}% consistent</p>
                </div>
                
                <div className="p-4 bg-accent/5 rounded-lg">
                  <h3 className="font-semibold mb-2">Recommendation</h3>
                  <p className="text-sm text-muted-foreground">
                    {stats.averageMood > 3.5 
                      ? "Your average mood intensity is positive. Consider what activities contribute to these good days." 
                      : "Focus on activities that bring you joy and consider speaking with a professional if you're concerned about your mood patterns."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
      </div>
      <BottomNavigation />
    </div>
  );
}