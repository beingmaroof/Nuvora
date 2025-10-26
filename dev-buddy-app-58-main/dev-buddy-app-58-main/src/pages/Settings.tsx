import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Bell, Moon, Sun, Download, Upload, Trash2, Info, Shield, Palette, Clock, Lock, Eye, Share2 } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { BottomNavigation } from "@/components/BottomNavigation";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { NotificationService } from "@/services/notificationService";
import { BackupService } from "@/services/backupService";

export default function Settings() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { user, profile, updateProfile } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [moodReminders, setMoodReminders] = useState(true);
  const [weeklyInsights, setWeeklyInsights] = useState(true);
  const [reminderTime, setReminderTime] = useState("19:00");
  const [saving, setSaving] = useState(false);
  const [dataRetention, setDataRetention] = useState("forever");
  const [shareData, setShareData] = useState(false);
  const [publicProfile, setPublicProfile] = useState(false);
  const [allowAnalytics, setAllowAnalytics] = useState(true);
  const [privacyNotes, setPrivacyNotes] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setMoodReminders(profile.notification_settings.mood_reminders);

      setWeeklyInsights(profile.notification_settings.weekly_insights);
      
      // Load privacy settings from profile if they exist
      if (profile.privacy_settings) {
        setShareData(profile.privacy_settings.share_data || false);
        setPublicProfile(profile.privacy_settings.public_profile || false);
        setAllowAnalytics(profile.privacy_settings.allow_analytics || true);
        setPrivacyNotes(profile.privacy_settings.notes || "");
      }
    }
    
    // Load stored reminder time
    const reminders = NotificationService.getStoredReminders();
    if (reminders.mood) {
      setReminderTime(reminders.mood);
    }
  }, [profile]);

  const handleSaveSettings = async () => {
    if (!profile) return;
    
    setSaving(true);
    try {
      // Prepare privacy settings object
      const privacySettings = {
        share_data: shareData,
        public_profile: publicProfile,
        allow_analytics: allowAnalytics,
        notes: privacyNotes,
      };
      
      await updateProfile({
        notification_settings: {
          mood_reminders: moodReminders,
          reflection_reminders: false,
          weekly_insights: weeklyInsights,
        },
        theme_preference: theme,
        privacy_settings: privacySettings,
      });
      
      // Handle notification scheduling
      if (moodReminders) {
        await NotificationService.scheduleDailyReminder(reminderTime, 'mood');
      } else {
        await NotificationService.cancelReminder('mood');
      }
      

      
      toast.success("Settings saved successfully");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    if (!user) return;
    
    try {
      toast.info("Exporting your data...");
      
      // Fetch all user data concurrently
      const [moodData, favoritesData, userProfile] = await Promise.all([
        supabase.from("mood_entries").select("*").eq("user_id", user.id),
        supabase.from("user_favorites").select("*").eq("user_id", user.id),
        supabase.from("user_profiles").select("*").eq("id", user.id).single(),
      ]);
      
      // Check for errors
      if (moodData.error) throw new Error("Failed to fetch mood data: " + moodData.error.message);
      if (favoritesData.error) throw new Error("Failed to fetch favorites data: " + favoritesData.error.message);
      if (userProfile.error) throw new Error("Failed to fetch profile data: " + userProfile.error.message);
      
      const exportData = {
        user: {
          id: user.id,
          email: user.email,
          created_at: user.created_at,
        },
        profile: userProfile.data,
        mood_entries: moodData.data || [],
        favorites: favoritesData.data || [],
        export_date: new Date().toISOString(),
        export_version: "1.0",
      };
      
      // Create and download file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `nuvora-data-export-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      document.body.appendChild(linkElement); // Required for Firefox
      linkElement.click();
      document.body.removeChild(linkElement);
      
      toast.success("Data exported successfully! Check your downloads folder.");
    } catch (error: any) {
      console.error("Export error:", error);
      toast.error(error.message || "Failed to export data. Please try again.");
    }
  };

  const handleCreateBackup = async () => {
    if (!user) return;
    
    try {
      const result = await BackupService.createBackup(user.id);
      if (result.success && result.data) {
        // Create and download backup file
        const dataStr = JSON.stringify(result.data, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const backupFileDefaultName = `nuvora-backup-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', backupFileDefaultName);
        document.body.appendChild(linkElement);
        linkElement.click();
        document.body.removeChild(linkElement);
        
        toast.success("Backup created and downloaded successfully!");
      } else {
        throw new Error(result.error as string);
      }
    } catch (error: any) {
      console.error("Backup error:", error);
      toast.error(error.message || "Failed to create backup. Please try again.");
    }
  };

  const handleRestoreBackup = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !user) return;
    
    const file = files[0];
    if (!file.name.endsWith('.json')) {
      toast.error("Please select a valid JSON backup file");
      return;
    }
    
    const confirmed = window.confirm(
      "Are you sure you want to restore from this backup? This will add the backup data to your current data and may create duplicates."
    );
    
    if (!confirmed) return;
    
    try {
      const result = await BackupService.restoreFromBackup(user.id, file);
      if (result.success) {
        toast.success("Data restored successfully! You may need to refresh the page to see all changes.");
      } else {
        throw new Error(result.error as string);
      }
    } catch (error: any) {
      console.error("Restore error:", error);
      toast.error(error.message || "Failed to restore data. Please try again.");
    } finally {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone. All your data will be permanently deleted."
    );
    
    if (!confirmed) return;
    
    try {
      toast.info("Deleting your account...");
      
      // Delete all user data first
      const results = await Promise.allSettled([
        supabase.from("mood_entries").delete().eq("user_id", user.id),
        supabase.from("user_favorites").delete().eq("user_id", user.id),
        supabase.from("user_profiles").delete().eq("id", user.id),
      ]);
      
      // Check for any errors
      const errors = results
        .filter(result => result.status === "rejected" || (result.status === "fulfilled" && result.value.error))
        .map(result => result.status === "rejected" ? result.reason : result.value.error);
      
      if (errors.length > 0) {
        console.error("Deletion errors:", errors);
        toast.error("Some data could not be deleted. Please contact support.");
        return;
      }
      
      // Delete user account
      const { error } = await supabase.auth.admin.deleteUser(user.id);
      
      if (error) throw error;
      
      toast.success("Account deleted successfully");
      navigate("/auth");
    } catch (error: any) {
      console.error("Account deletion error:", error);
      toast.error(error.message || "Failed to delete account. Please try again.");
    }
  };

  const handleDataRetentionChange = async (value: string) => {
    setDataRetention(value);
    
    // If user selects a retention period shorter than forever, show a warning
    if (value !== "forever") {
      toast.warning(`Data will be automatically deleted after ${value === "30days" ? "30 days" : value === "6months" ? "6 months" : "1 year"}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 p-4 pb-20">
      <div className="max-w-2xl mx-auto py-8 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/profile")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-accent font-bold text-primary">
            Settings
          </h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications">All Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Enable or disable all app notifications
                </p>
              </div>
              <Switch
                id="notifications"
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="mood-reminders">Mood Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Daily reminders to log your mood
                </p>
              </div>
              <Switch
                id="mood-reminders"
                checked={moodReminders}
                onCheckedChange={setMoodReminders}
                disabled={!notifications}
              />
            </div>



            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="weekly-insights">Weekly Insights</Label>
                <p className="text-sm text-muted-foreground">
                  Weekly mood analytics and insights
                </p>
              </div>
              <Switch
                id="weekly-insights"
                checked={weeklyInsights}
                onCheckedChange={setWeeklyInsights}
                disabled={!notifications}
              />
            </div>
            
            {moodReminders && (
              <div className="flex items-center justify-between pt-2">
                <div className="space-y-0.5">
                  <Label htmlFor="reminder-time">Reminder Time</Label>
                  <p className="text-sm text-muted-foreground">
                    When you'd like to receive daily reminders
                  </p>
                </div>
                <Input
                  id="reminder-time"
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="w-32"
                />
              </div>
            )}
            
            <div className="pt-4 border-t">
              <Button onClick={handleSaveSettings} disabled={saving} className="w-full">
                {saving ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Theme</Label>
                <div className="flex gap-2">
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("light")}
                  >
                    <Sun className="mr-2 h-4 w-4" />
                    Light
                  </Button>
                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("dark")}
                  >
                    <Moon className="mr-2 h-4 w-4" />
                    Dark
                  </Button>
                  <Button
                    variant={theme === "system" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("system")}
                  >
                    System
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy & Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="data-retention">Data Retention</Label>
                <Select value={dataRetention} onValueChange={handleDataRetentionChange}>
                  <SelectTrigger id="data-retention">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="forever">Keep Forever</SelectItem>
                    <SelectItem value="1year">1 Year</SelectItem>
                    <SelectItem value="6months">6 Months</SelectItem>
                    <SelectItem value="30days">30 Days</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  How long to keep your data on our servers
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="share-data">Share Anonymous Data</Label>
                  <p className="text-sm text-muted-foreground">
                    Help improve Nuvora by sharing anonymized usage data
                  </p>
                </div>
                <Switch
                  id="share-data"
                  checked={shareData}
                  onCheckedChange={setShareData}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="public-profile">Public Profile</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow others to view your profile (name only)
                  </p>
                </div>
                <Switch
                  id="public-profile"
                  checked={publicProfile}
                  onCheckedChange={setPublicProfile}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="allow-analytics">Analytics Tracking</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow us to collect usage analytics to improve the app
                  </p>
                </div>
                <Switch
                  id="allow-analytics"
                  checked={allowAnalytics}
                  onCheckedChange={setAllowAnalytics}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="privacy-notes">Privacy Notes</Label>
                <Textarea
                  id="privacy-notes"
                  value={privacyNotes}
                  onChange={(e) => setPrivacyNotes(e.target.value)}
                  placeholder="Add any special privacy requests or notes..."
                  className="min-h-24"
                />
                <p className="text-sm text-muted-foreground">
                  Any special requests regarding your data privacy
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Data Export & Backup</Label>
                  <p className="text-sm text-muted-foreground">
                    Manage your data exports and backups
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Button variant="outline" onClick={handleExportData} size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export Data
                </Button>
                <Button variant="outline" onClick={handleCreateBackup} size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Create Backup
                </Button>
                <Button variant="outline" onClick={handleRestoreBackup} size="sm">
                  <Upload className="mr-2 h-4 w-4" />
                  Restore Backup
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".json"
                  className="hidden"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="space-y-0.5">
                <Label className="text-destructive">Delete Account</Label>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all data
                </p>
              </div>
              <Button variant="destructive" onClick={handleDeleteAccount}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              About
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">Nuvora Mood Journal</span> - Version 1.0.0
              </p>
              <p className="text-sm text-muted-foreground">
                A minimalist and intuitive mood journal and daily reflection app designed to help you track your emotions, engage in meaningful self-reflection, and foster personal growth.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      <BottomNavigation />
    </div>
  );
}