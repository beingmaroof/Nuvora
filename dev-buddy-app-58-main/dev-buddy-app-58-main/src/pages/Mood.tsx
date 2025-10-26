import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { MoodSelector } from "@/components/mood/MoodSelector";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, TrendingUp, Clock, Plus, Smile, Wifi, WifiOff } from "lucide-react";
import { toast } from "sonner";
import { format, isToday } from "date-fns";
import type { MoodEntry } from "@/types/mood";
import { SyncService } from "@/services/syncService";

export default function Mood() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [recentEntries, setRecentEntries] = useState<MoodEntry[]>([]);
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(SyncService.isOnline());
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    loadRecentEntries();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('mood-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mood_entries',
          filter: `user_id=eq.${user?.id}`
        },
        () => {
          loadRecentEntries();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const loadRecentEntries = async () => {
    try {
      const { data, error } = await supabase
        .from("mood_entries")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setRecentEntries(data || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("mood_entries")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Mood entry deleted");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'positive': return 'text-green-600 bg-green-50 border-green-200';
      case 'neutral': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'negative': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Group entries by date
  const groupedEntries = recentEntries.reduce((acc, entry) => {
    const date = format(new Date(entry.created_at), "yyyy-MM-dd");
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(entry);
    return acc;
  }, {} as Record<string, MoodEntry[]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 pb-20">
      <div className="p-4 space-y-6">
        <div className="pt-4">
          <h1 className="text-2xl font-accent font-bold text-primary mb-2">
            Mood Tracker
          </h1>
          <p className="text-muted-foreground">
            Log your current mood and track how you're feeling over time
          </p>
        </div>

        {/* Online Status Indicator */}
        <div className={`flex items-center gap-2 p-2 rounded-lg ${isOnline ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
          <span className="text-sm">
            {isOnline ? 'Online - Data will sync automatically' : 'Offline - Data saved locally'}
          </span>
        </div>

        {!showMoodSelector ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="mx-auto bg-primary/10 rounded-full p-4 w-16 h-16 flex items-center justify-center mb-4">
                  <Smile className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">How are you feeling today?</h3>
                <p className="text-muted-foreground mb-4">
                  Track your emotions throughout the day to better understand your mood patterns
                </p>
                <Button 
                  onClick={() => setShowMoodSelector(true)}
                  className="w-full max-w-xs mx-auto"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Log Mood
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <MoodSelector onMoodLogged={() => {
            loadRecentEntries();
            setShowMoodSelector(false);
          }} />
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Entries</h2>
            <Button variant="outline" size="sm" onClick={() => navigate("/mood/history")}>
              <Calendar className="mr-2 h-4 w-4" />
              View All
            </Button>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : recentEntries.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <div className="space-y-2">
                  <div className="text-4xl">😊</div>
                  <p>No mood entries yet</p>
                  <p className="text-sm">Log your first mood above to get started!</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedEntries).map(([date, entries]) => (
                <div key={date} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">
                      {isToday(new Date(date)) ? "Today" : format(new Date(date), "EEEE, MMMM d")}
                    </h3>
                    <Badge variant="secondary">{entries.length} entries</Badge>
                  </div>
                  <div className="space-y-3">
                    {entries.map((entry) => (
                      <Card key={entry.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <span className="text-4xl">{entry.mood_emoji}</span>
                            <div className="flex-1 min-w-0">
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
                                {format(new Date(entry.created_at), "h:mm a")}
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
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {recentEntries.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {recentEntries.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Entries</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {recentEntries.filter(e => e.mood_category === 'positive').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Positive Days</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}