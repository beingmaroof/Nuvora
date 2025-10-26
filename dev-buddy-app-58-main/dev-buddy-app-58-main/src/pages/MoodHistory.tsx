import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowLeft, Filter, Clock, TrendingUp, Calendar as CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import type { MoodEntry } from "@/types/mood";

export default function MoodHistory() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedDateEntries, setSelectedDateEntries] = useState<MoodEntry[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");

  useEffect(() => {
    loadEntries();
  }, [user]);

  useEffect(() => {
    if (selectedDate) {
      const dateEntries = entries.filter((entry) =>
        isSameDay(new Date(entry.created_at), selectedDate)
      );
      setSelectedDateEntries(dateEntries);
    }
  }, [selectedDate, entries]);

  const loadEntries = async () => {
    try {
      const { data, error } = await supabase
        .from("mood_entries")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getDatesWithMoods = () => {
    return entries.map((entry) => new Date(entry.created_at));
  };

  const getFilteredEntries = () => {
    if (filterCategory === "all") return entries;
    return entries.filter(entry => entry.mood_category === filterCategory);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'positive': return 'text-green-600 bg-green-50 border-green-200';
      case 'neutral': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'negative': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getMoodStats = () => {
    const total = entries.length;
    const positive = entries.filter(e => e.mood_category === 'positive').length;
    const neutral = entries.filter(e => e.mood_category === 'neutral').length;
    const negative = entries.filter(e => e.mood_category === 'negative').length;
    const avgIntensity = entries.reduce((sum, e) => sum + (e.mood_intensity || 3), 0) / total || 0;

    return { total, positive, neutral, negative, avgIntensity };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const stats = getMoodStats();
  const filteredEntries = getFilteredEntries();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 pb-20">
      <div className="p-4 space-y-6">
        <div className="pt-4">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" onClick={() => navigate("/mood")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <h1 className="text-2xl font-accent font-bold text-primary">
              Mood History
            </h1>
          </div>
          <p className="text-muted-foreground">
            Review your past moods and emotional patterns
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Entries</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.positive}</div>
              <div className="text-sm text-muted-foreground">Positive</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.neutral}</div>
              <div className="text-sm text-muted-foreground">Neutral</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.negative}</div>
              <div className="text-sm text-muted-foreground">Negative</div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "calendar" | "list")} className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="calendar" className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Calendar
              </TabsTrigger>
              <TabsTrigger value="list" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                List
              </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Moods</SelectItem>
                  <SelectItem value="positive">Positive</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="negative">Negative</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value="calendar" className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  modifiers={{
                    hasMood: getDatesWithMoods(),
                  }}
                  modifiersClassNames={{
                    hasMood: "bg-primary/20 font-bold",
                  }}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>

            {selectedDate && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    {format(selectedDate, "PPPP")}
                  </h3>
                  {selectedDateEntries.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      No mood entries for this day
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {selectedDateEntries.map((entry) => (
                        <div
                          key={entry.id}
                          className="flex items-start gap-4 p-3 rounded-lg border"
                        >
                          <span className="text-3xl">{entry.mood_emoji}</span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{entry.mood_label}</h4>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(entry.created_at), "p")}
                              </span>
                            </div>
                            {entry.notes && (
                              <p className="text-sm text-muted-foreground">
                                {entry.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="list" className="space-y-3">
            {filteredEntries.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <div className="space-y-2">
                    <div className="text-4xl">😊</div>
                    <p>No mood entries found</p>
                    <p className="text-sm">
                      {filterCategory === "all" 
                        ? "Start tracking your moods!" 
                        : `No ${filterCategory} moods found`}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              filteredEntries.map((entry) => (
                <Card key={entry.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <span className="text-4xl">{entry.mood_emoji}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{entry.mood_label}</h3>
                          <Badge variant="outline" className={getCategoryColor(entry.mood_category || 'neutral')}>
                            {entry.mood_category}
                          </Badge>
                          <Badge variant="secondary">
                            {entry.mood_intensity || 3}/5
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <Clock className="h-3 w-3" />
                          {format(new Date(entry.created_at), "PPp")}
                        </div>
                        {entry.notes && (
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/50 p-2 rounded">
                            {entry.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      <BottomNavigation />
    </div>
  );
}
