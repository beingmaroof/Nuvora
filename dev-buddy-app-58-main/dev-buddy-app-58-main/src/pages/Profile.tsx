import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { BottomNavigation } from "@/components/BottomNavigation";
import { User, ArrowLeft, Settings, Save, LogOut, Moon, Sun, Monitor, Bell, Download, Upload, Trash2, Shield } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { BackupService } from "@/services/backupService";

const Profile = () => {
  const navigate = useNavigate();
  const { user, profile, updateProfile, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [saving, setSaving] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    mood_reminders: true,
    reflection_reminders: false,
    weekly_insights: true,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setNotificationSettings(profile.notification_settings || {
        mood_reminders: true,
        reflection_reminders: false,
        weekly_insights: true,
      });
    }
  }, [profile]);

  const handleSave = async () => {
    if (!profile) return;
    
    setSaving(true);
    try {
      await updateProfile({
        display_name: displayName,
        theme_preference: theme,
        notification_settings: notificationSettings,
      });
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotificationSettings = async () => {
    if (!profile) return;
    
    console.log('Saving notification settings:', notificationSettings);
    setSaving(true);
    try {
      await updateProfile({
        notification_settings: notificationSettings,
      });
      toast.success("Notification settings updated successfully");
    } catch (error) {
      console.error('Failed to update notification settings:', error);
      toast.error("Failed to update notification settings: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/auth");
    } catch (error) {
      toast.error("Failed to sign out");
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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 p-4 pb-20">
      <div className="max-w-2xl mx-auto py-8 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-accent font-bold text-primary">
            Profile
          </h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile?.avatar_url || ""} />
                <AvatarFallback className="text-lg">
                  {getInitials(profile?.display_name || user?.email || "U")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-2">
                    <Label htmlFor="display-name">Display Name</Label>
                    <Input
                      id="display-name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Enter your display name"
                    />
                  </div>
                ) : (
                  <div>
                    <h3 className="text-xl font-semibold">{profile?.display_name || "User"}</h3>
                    <p className="text-muted-foreground">{user?.email}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">User ID</Label>
                <p className="text-sm font-mono text-muted-foreground break-all">{user?.id}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Member Since</Label>
                <p className="text-sm text-muted-foreground">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button onClick={handleSave} disabled={saving}>
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsEditing(false);
                      setDisplayName(profile?.display_name || "");
                    }}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {theme === "dark" ? <Moon className="h-5 w-5" /> : theme === "light" ? <Sun className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
              Theme Preferences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Current Theme</Label>
                <p className="text-sm text-muted-foreground">
                  {theme === "dark" ? "Dark Mode" : theme === "light" ? "Light Mode" : "System"}
                </p>
              </div>
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
                  <Monitor className="mr-2 h-4 w-4" />
                  System
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Mood Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Daily notifications to log your mood
                </p>
              </div>
              <Switch
                checked={notificationSettings.mood_reminders}
                onCheckedChange={(checked) => 
                  setNotificationSettings({...notificationSettings, mood_reminders: checked})
                }
              />
            </div>
            

            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Weekly Insights</Label>
                <p className="text-sm text-muted-foreground">
                  Weekly mood analytics summary
                </p>
              </div>
              <Switch
                checked={notificationSettings.weekly_insights}
                onCheckedChange={(checked) => 
                  setNotificationSettings({...notificationSettings, weekly_insights: checked})
                }
              />
            </div>
            
            <Button 
              onClick={handleSaveNotificationSettings}
              disabled={saving}
              className="w-full"
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Save Notification Settings"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Data Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={handleExportData}
              >
                <Download className="mr-2 h-4 w-4" />
                Export My Data
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={handleCreateBackup}
              >
                <Download className="mr-2 h-4 w-4" />
                Create Backup
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={handleRestoreBackup}
              >
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
            <p className="text-xs text-muted-foreground">
              Export your data, create backups, or restore from previous backups.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy & Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start text-destructive hover:text-destructive"
              onClick={handleDeleteAccount}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Account
            </Button>
            <p className="text-xs text-muted-foreground">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate("/settings")}
            >
              <Settings className="mr-2 h-4 w-4" />
              App Settings
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start text-destructive hover:text-destructive"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
      <BottomNavigation />
    </div>
  );
};

export default Profile;