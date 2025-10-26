import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export class BackupService {
  static readonly BACKUP_STORAGE_KEY = "nuvora-backup-data";
  
  // Create a backup of all user data
  static async createBackup(userId: string) {
    if (!userId) {
      toast.error("User not authenticated");
      return { success: false, error: "User not authenticated" };
    }
    
    try {
      toast.info("Creating backup...");
      
      // Fetch all user data concurrently
      const [moodData, reflectionData, favoritesData, userProfile] = await Promise.all([
        supabase.from("mood_entries").select("*").eq("user_id", userId),
        supabase.from("reflection_entries").select("*").eq("user_id", userId),
        supabase.from("user_favorites").select("*").eq("user_id", userId),
        supabase.from("user_profiles").select("*").eq("id", userId).single(),
      ]);
      
      // Check for errors
      if (moodData.error) throw new Error("Failed to fetch mood data: " + moodData.error.message);
      if (reflectionData.error) throw new Error("Failed to fetch reflection data: " + reflectionData.error.message);
      if (favoritesData.error) throw new Error("Failed to fetch favorites data: " + favoritesData.error.message);
      if (userProfile.error) throw new Error("Failed to fetch profile data: " + userProfile.error.message);
      
      const backupData = {
        user: {
          id: userId,
          // Note: We don't include email for privacy reasons
        },
        profile: userProfile.data,
        mood_entries: moodData.data || [],
        reflection_entries: reflectionData.data || [],
        favorites: favoritesData.data || [],
        backup_date: new Date().toISOString(),
        backup_version: "1.0",
      };
      
      // Save to localStorage as a fallback
      localStorage.setItem(this.BACKUP_STORAGE_KEY, JSON.stringify(backupData));
      
      // In a real implementation, you might also save to cloud storage
      // For now, we'll just return the data for download
      
      toast.success("Backup created successfully!");
      return { success: true, data: backupData };
    } catch (error) {
      console.error("Backup creation error:", error);
      toast.error("Failed to create backup. Please try again.");
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  }
  
  // Restore data from a backup file
  static async restoreFromBackup(userId: string, backupFile: File) {
    if (!userId) {
      toast.error("User not authenticated");
      return { success: false, error: "User not authenticated" };
    }
    
    try {
      toast.info("Restoring from backup...");
      
      // Read the backup file
      const fileContent = await backupFile.text();
      const backupData = JSON.parse(fileContent);
      
      // Validate backup data
      if (!backupData.backup_version || !backupData.mood_entries || !backupData.reflection_entries) {
        throw new Error("Invalid backup file format");
      }
      
      // Restore mood entries
      if (backupData.mood_entries.length > 0) {
        // Add user_id to each entry
        const moodEntriesWithUserId = backupData.mood_entries.map((entry: any) => ({
          ...entry,
          user_id: userId
        }));
        
        const { error: moodError } = await supabase
          .from("mood_entries")
          .insert(moodEntriesWithUserId);
          
        if (moodError) throw new Error("Failed to restore mood entries: " + moodError.message);
      }
      
      // Restore reflection entries
      if (backupData.reflection_entries.length > 0) {
        // Add user_id to each entry
        const reflectionEntriesWithUserId = backupData.reflection_entries.map((entry: any) => ({
          ...entry,
          user_id: userId
        }));
        
        const { error: reflectionError } = await supabase
          .from("reflection_entries")
          .insert(reflectionEntriesWithUserId);
          
        if (reflectionError) throw new Error("Failed to restore reflection entries: " + reflectionError.message);
      }
      
      // Restore favorites
      if (backupData.favorites.length > 0) {
        // Add user_id to each entry
        const favoritesWithUserId = backupData.favorites.map((entry: any) => ({
          ...entry,
          user_id: userId
        }));
        
        const { error: favoritesError } = await supabase
          .from("user_favorites")
          .insert(favoritesWithUserId);
          
        if (favoritesError) throw new Error("Failed to restore favorites: " + favoritesError.message);
      }
      
      // Restore profile (optional - be careful with this)
      // For now, we won't restore the profile to avoid overwriting current settings
      
      toast.success("Data restored successfully!");
      return { success: true };
    } catch (error) {
      console.error("Backup restoration error:", error);
      toast.error("Failed to restore from backup. Please try again.");
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  }
  
  // Get local backup (if available)
  static getLocalBackup() {
    try {
      const backupData = localStorage.getItem(this.BACKUP_STORAGE_KEY);
      return backupData ? JSON.parse(backupData) : null;
    } catch (error) {
      console.error("Failed to get local backup:", error);
      return null;
    }
  }
  
  // Clear local backup
  static clearLocalBackup() {
    try {
      localStorage.removeItem(this.BACKUP_STORAGE_KEY);
      return { success: true };
    } catch (error) {
      console.error("Failed to clear local backup:", error);
      return { success: false, error };
    }
  }
}