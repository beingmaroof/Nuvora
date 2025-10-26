import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Smile, PenTool, BarChart3, Quote, Calendar, TrendingUp, Heart, Plus } from "lucide-react";
import { format, isToday } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { MoodEntry } from "@/types/mood";
import { QUOTES } from "@/types/quotes";

const Index = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [currentQuote] = useState(QUOTES[0]); // In a real app, this would rotate daily
  const [streak, setStreak] = useState(0); // Will calculate actual streak
  const [todayEntries, setTodayEntries] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTodayEntries();
    calculateStreak();
  }, [user]);

  const loadTodayEntries = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));
      
      const { data, error } = await supabase
        .from("mood_entries")
        .select("*")
        .eq("user_id", user.id)
        .gte("created_at", startOfDay.toISOString())
        .lte("created_at", endOfDay.toISOString())
        .order("created_at", { ascending: true });

      if (error) throw error;
      setTodayEntries(data || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateStreak = async () => {
    if (!user) return;
    
    try {
      // Get all mood entries ordered by date ascending (oldest first)
      const { data, error } = await supabase
        .from("mood_entries")
        .select("created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      
      if (!data || data.length === 0) {
        setStreak(0);
        return;
      }

      // Convert to unique dates and sort
      const uniqueDates = Array.from(
        new Set(data.map(entry => {
          const date = new Date(entry.created_at);
          date.setHours(0, 0, 0, 0);
          return date.getTime();
        }))
      ).map(time => new Date(time))
        .sort((a, b) => a.getTime() - b.getTime());

      // Calculate streak from today backwards
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let streak = 0;
      let currentDate = today;
      
      // Check if we have entries for today or yesterday to start the streak
      const hasEntryToday = uniqueDates.some(date => date.getTime() === currentDate.getTime());
      
      if (hasEntryToday) {
        // Start streak from today
        streak = 1;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        // Check yesterday
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const hasEntryYesterday = uniqueDates.some(date => date.getTime() === yesterday.getTime());
        
        if (hasEntryYesterday) {
          streak = 1;
          currentDate = yesterday;
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          // No recent entries, streak is 0
          setStreak(0);
          return;
        }
      }
      
      // Continue counting backwards
      while (uniqueDates.some(date => date.getTime() === currentDate.getTime())) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      }
      
      setStreak(streak);
    } catch (error: any) {
      console.error("Error calculating streak:", error);
      toast.error("Failed to calculate streak");
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const quickActions = [
    {
      title: "Log Mood",
      description: "How are you feeling?",
      icon: Smile,
      path: "/mood",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },

    {
      title: "View Analytics",
      description: "Track your progress",
      icon: BarChart3,
      path: "/analytics",
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 pb-20">
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="pt-4">
          <h1 className="text-2xl font-accent font-bold text-primary">
            {getGreeting()}, {profile?.display_name || "there"}!
          </h1>
          <p className="text-muted-foreground">
            {format(new Date(), "EEEE, MMMM do, yyyy")}
          </p>
        </div>

        {/* Streak Card */}
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">Daily Streak</h3>
                <p className="text-3xl font-bold text-primary">{streak} days</p>
                <p className="text-sm text-muted-foreground">Keep it up!</p>
              </div>
              <div className="flex gap-1">
                {Array.from({ length: Math.max(7, streak) }, (_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full ${
                      i < streak ? "bg-primary" : "bg-muted"
                    }`}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today's Mood Tracker */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between gap-2 text-lg">
              <div className="flex items-center gap-2">
                <Smile className="h-5 w-5 text-primary" />
                Today's Mood
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate("/mood")}
                className="text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : todayEntries.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-3">No mood entries yet today</p>
                <Button 
                  onClick={() => navigate("/mood")}
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Log Your Mood
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {todayEntries.map((entry) => (
                    <div 
                      key={entry.id} 
                      className="flex items-center gap-2 bg-muted/50 rounded-full px-3 py-1.5"
                    >
                      <span className="text-lg">{entry.mood_emoji}</span>
                      <span className="text-sm">{entry.mood_label}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(entry.created_at), "h:mm a")}
                      </span>
                    </div>
                  ))}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate("/mood")}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Mood
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Today's Quote */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between gap-2 text-lg">
              <div className="flex items-center gap-2">
                <Quote className="h-5 w-5 text-primary" />
                Daily Inspiration
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate("/quotes")}
                className="text-xs p-0 h-auto"
              >
                <Heart className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <blockquote className="text-lg italic leading-relaxed mb-3 line-clamp-3">
              "{currentQuote.text}"
            </blockquote>
            <p className="text-sm text-muted-foreground">
              — {currentQuote.author}
            </p>
            <div className="flex gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/quotes")}
              >
                View More Quotes
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Card
                  key={action.path}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(action.path)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${action.bgColor}`}>
                        <Icon className={`h-6 w-6 ${action.color}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{action.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {action.description}
                        </p>
                      </div>
                      <div className="text-muted-foreground">
                        →
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Smile className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Mood logged</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
                <Badge variant="secondary">Happy</Badge>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="p-2 bg-secondary/10 rounded-lg">
                  <PenTool className="h-4 w-4 text-secondary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Reflection completed</p>
                  <p className="text-xs text-muted-foreground">Yesterday</p>
                </div>
                <Badge variant="outline">Gratitude</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Index;