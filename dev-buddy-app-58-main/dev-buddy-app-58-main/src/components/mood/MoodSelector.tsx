import { useState, useEffect } from "react";
import { MOOD_OPTIONS, MoodType } from "@/types/mood";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2, Smile, Heart, Meh, Wifi, WifiOff } from "lucide-react";
import { SyncService } from "@/services/syncService";

interface MoodSelectorProps {
  onMoodLogged?: () => void;
}

export const MoodSelector = ({ onMoodLogged }: MoodSelectorProps) => {
  const { user } = useAuth();
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'positive' | 'neutral' | 'negative'>('positive');
  const [isOnline, setIsOnline] = useState(SyncService.isOnline());

  // Update online status when it changes
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.info("You're back online!");
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast.info("You're offline. Data will be saved locally.");
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSaveMood = async () => {
    if (!selectedMood || !user) return;

    setSaving(true);
    try {
      if (isOnline) {
        // Save to server
        const { error } = await supabase.from("mood_entries").insert({
          user_id: user.id,
          mood_emoji: selectedMood.emoji,
          mood_label: selectedMood.label,
          mood_category: selectedMood.category,
          mood_intensity: selectedMood.intensity,
          notes: notes.trim() || null,
        });

        if (error) throw error;
        toast.success("Mood logged successfully!");
      } else {
        // Save offline
        const result = SyncService.saveMoodEntryOffline({
          mood_emoji: selectedMood.emoji,
          mood_label: selectedMood.label,
          mood_category: selectedMood.category,
          mood_intensity: selectedMood.intensity,
          notes: notes.trim() || null,
          created_at: new Date().toISOString(),
        });
        
        if (!result.success) {
          throw new Error("Failed to save mood entry offline");
        }
      }

      setSelectedMood(null);
      setNotes("");
      onMoodLogged?.();
    } catch (error: any) {
      toast.error(error.message || "Failed to save mood entry");
    } finally {
      setSaving(false);
    }
  };

  const getMoodsByCategory = (category: 'positive' | 'neutral' | 'negative') => {
    return MOOD_OPTIONS.filter(mood => mood.category === category);
  };

  const getCategoryIcon = (category: 'positive' | 'neutral' | 'negative') => {
    switch (category) {
      case 'positive': return <Smile className="h-4 w-4" />;
      case 'neutral': return <Meh className="h-4 w-4" />;
      case 'negative': return <Heart className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: 'positive' | 'neutral' | 'negative') => {
    switch (category) {
      case 'positive': return 'text-green-600 bg-green-50 border-green-200';
      case 'neutral': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'negative': return 'text-red-600 bg-red-50 border-red-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smile className="h-5 w-5 text-primary" />
          How are you feeling?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Online Status Indicator */}
        <div className={`flex items-center gap-2 p-2 rounded-lg ${isOnline ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
          <span className="text-sm">
            {isOnline ? 'Online - Data will save to cloud' : 'Offline - Data will save locally'}
          </span>
        </div>

        <Tabs value={activeCategory} onValueChange={(value) => setActiveCategory(value as 'positive' | 'neutral' | 'negative')}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="positive" className="flex items-center gap-2">
              <Smile className="h-4 w-4" />
              Positive
            </TabsTrigger>
            <TabsTrigger value="neutral" className="flex items-center gap-2">
              <Meh className="h-4 w-4" />
              Neutral
            </TabsTrigger>
            <TabsTrigger value="negative" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Negative
            </TabsTrigger>
          </TabsList>

          {(['positive', 'neutral', 'negative'] as const).map((category) => (
            <TabsContent key={category} value={category} className="space-y-4">
              <div className="grid grid-cols-4 gap-3">
                {getMoodsByCategory(category).map((mood) => (
                  <button
                    key={mood.label}
                    onClick={() => setSelectedMood(mood)}
                    className={`
                      p-4 rounded-xl border-2 transition-all hover:scale-105
                      flex flex-col items-center gap-2 relative
                      ${
                        selectedMood?.label === mood.label
                          ? "border-primary bg-primary/10 shadow-lg"
                          : "border-border hover:border-primary/50"
                      }
                    `}
                  >
                    <span className="text-4xl">{mood.emoji}</span>
                    <span className="text-xs font-medium text-center">{mood.label}</span>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${getCategoryColor(category)}`}
                    >
                      {mood.intensity}/5
                    </Badge>
                  </button>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {selectedMood && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedMood.emoji}</span>
                <div>
                  <h4 className="font-semibold">{selectedMood.label}</h4>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getCategoryColor(selectedMood.category)}>
                      {selectedMood.category}
                    </Badge>
                    <Badge variant="secondary">
                      Intensity: {selectedMood.intensity}/5
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mood-notes">Add a note (optional)</Label>
              <Textarea
                id="mood-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What's on your mind? Share more details about how you're feeling..."
                className="min-h-24 resize-none"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground text-right">
                {notes.length}/500
              </p>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleSaveMood} disabled={saving} className="flex-1">
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Mood"
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedMood(null);
                  setNotes("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};