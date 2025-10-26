import { supabase } from "@/integrations/supabase/client";
import type { MoodEntry } from "@/types/mood";
import type { ReflectionEntry } from "@/types/reflection";
import { toast } from "sonner";

export class SyncService {
  static readonly LOCAL_STORAGE_KEY = "nuvora-offline-data";
  static userId: string | null = null;
  
  // Initialize the sync service with user ID
  static initialize(userId: string) {
    this.userId = userId;
    
    // Set up event listeners
    if (typeof window !== "undefined") {
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
    }
    
    // If already online, try to sync
    if (this.isOnline()) {
      this.syncAllOfflineData(userId);
    }
  }
  
  // Clean up event listeners
  static cleanup() {
    if (typeof window !== "undefined") {
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
    }
    this.userId = null;
  }
  
  // Handle online event
  static handleOnline = async () => {
    console.log('Browser is online');
    if (this.userId) {
      toast.info("You're back online! Syncing data...");
      const result = await this.syncAllOfflineData(this.userId);
      if (result.success) {
        toast.success(`Synced ${result.synced} offline entries!`);
      } else {
        toast.error("Failed to sync offline data. Please try again.");
      }
    }
  };
  
  // Handle offline event
  static handleOffline = () => {
    console.log('Browser is offline');
    toast.info("You're offline. Data will be saved locally and synced when you're back online.");
  };
  
  // Save offline data to localStorage
  static saveOfflineData(data: any) {
    try {
      const existingData = this.getOfflineData();
      const updatedData = { ...existingData, ...data };
      localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(updatedData));
      return { success: true };
    } catch (error) {
      console.error("Failed to save offline data:", error);
      return { success: false, error };
    }
  }
  
  // Get offline data from localStorage
  static getOfflineData() {
    try {
      const data = localStorage.getItem(this.LOCAL_STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error("Failed to get offline data:", error);
      return {};
    }
  }
  
  // Clear offline data
  static clearOfflineData() {
    try {
      localStorage.removeItem(this.LOCAL_STORAGE_KEY);
      return { success: true };
    } catch (error) {
      console.error("Failed to clear offline data:", error);
      return { success: false, error };
    }
  }
  
  // Check if online
  static isOnline(): boolean {
    return navigator.onLine;
  }
  
  // Sync offline mood entries to server
  static async syncMoodEntries(userId: string, entries: Partial<MoodEntry>[]) {
    if (!userId || entries.length === 0) return { success: true, synced: 0 };
    
    try {
      // Filter out entries that don't have required fields
      const validEntries = entries.filter((entry): entry is MoodEntry => 
        entry.mood_emoji !== undefined && 
        entry.mood_label !== undefined && 
        entry.mood_category !== undefined && 
        entry.mood_intensity !== undefined &&
        typeof entry.mood_emoji === 'string' &&
        typeof entry.mood_label === 'string' &&
        typeof entry.mood_category === 'string' &&
        typeof entry.mood_intensity === 'number'
      );
      
      if (validEntries.length === 0) {
        return { success: true, synced: 0 };
      }
      
      // Add user_id to each entry
      const entriesWithUserId = validEntries.map(entry => ({
        ...entry,
        user_id: userId
      }));
      
      const { data, error } = await supabase
        .from("mood_entries")
        .insert(entriesWithUserId);
      
      if (error) throw error;
      
      return { success: true, synced: validEntries.length, data };
    } catch (error) {
      console.error("Failed to sync mood entries:", error);
      return { success: false, synced: 0, error };
    }
  }
  
  // Sync offline reflection entries to server
  static async syncReflectionEntries(userId: string, entries: Partial<ReflectionEntry>[]) {
    if (!userId || entries.length === 0) return { success: true, synced: 0 };
    
    try {
      // Filter out entries that don't have required fields
      const validEntries = entries.filter((entry): entry is ReflectionEntry => 
        entry.prompt_id !== undefined && 
        entry.prompt_text !== undefined && 
        entry.prompt_category !== undefined && 
        entry.content !== undefined && 
        entry.word_count !== undefined &&
        typeof entry.prompt_id === 'string' &&
        typeof entry.prompt_text === 'string' &&
        typeof entry.prompt_category === 'string' &&
        typeof entry.content === 'string' &&
        typeof entry.word_count === 'number'
      );
      
      if (validEntries.length === 0) {
        return { success: true, synced: 0 };
      }
      
      // Add user_id to each entry
      const entriesWithUserId = validEntries.map(entry => ({
        ...entry,
        user_id: userId
      }));
      
      const { data, error } = await supabase
        .from("reflection_entries")
        .insert(entriesWithUserId);
      
      if (error) throw error;
      
      return { success: true, synced: validEntries.length, data };
    } catch (error) {
      console.error("Failed to sync reflection entries:", error);
      return { success: false, synced: 0, error };
    }
  }
  
  // Sync all offline data
  static async syncAllOfflineData(userId: string) {
    if (!userId) return { success: false, message: "User ID required" };
    
    try {
      const offlineData = this.getOfflineData();
      let totalSynced = 0;
      let errors: string[] = [];
      
      // Sync mood entries
      if (offlineData.moodEntries && offlineData.moodEntries.length > 0) {
        const result = await this.syncMoodEntries(userId, offlineData.moodEntries);
        if (result.success) {
          totalSynced += result.synced;
        } else {
          errors.push("Failed to sync mood entries: " + (result.error as Error).message);
        }
      }
      
      // Sync reflection entries
      if (offlineData.reflectionEntries && offlineData.reflectionEntries.length > 0) {
        const result = await this.syncReflectionEntries(userId, offlineData.reflectionEntries);
        if (result.success) {
          totalSynced += result.synced;
        } else {
          errors.push("Failed to sync reflection entries: " + (result.error as Error).message);
        }
      }
      
      // Clear offline data if sync was successful
      if (errors.length === 0 && totalSynced > 0) {
        const clearResult = this.clearOfflineData();
        if (!clearResult.success) {
          errors.push("Failed to clear offline data after sync");
        } else {
          console.log(`Successfully synced ${totalSynced} offline entries`);
        }
      }
      
      return {
        success: errors.length === 0,
        synced: totalSynced,
        errors
      };
    } catch (error) {
      console.error("Failed to sync offline data:", error);
      return { success: false, synced: 0, errors: ["Sync failed: " + (error as Error).message] };
    }
  }
  
  // Save mood entry offline
  static saveMoodEntryOffline(entry: Partial<MoodEntry>) {
    try {
      const offlineData = this.getOfflineData();
      const moodEntries = offlineData.moodEntries || [];
      moodEntries.push({ 
        ...entry, 
        id: `offline-${Date.now()}-${Math.random()}`,
        created_at: new Date().toISOString()
      });
      
      const result = this.saveOfflineData({
        ...offlineData,
        moodEntries
      });
      
      if (result.success) {
        toast.info("Mood entry saved offline. Will sync when online.");
      }
      
      return result;
    } catch (error) {
      console.error("Failed to save mood entry offline:", error);
      toast.error("Failed to save mood entry offline.");
      return { success: false, error };
    }
  }
  
  // Save reflection entry offline
  static saveReflectionEntryOffline(entry: Partial<ReflectionEntry>) {
    try {
      const offlineData = this.getOfflineData();
      const reflectionEntries = offlineData.reflectionEntries || [];
      reflectionEntries.push({ 
        ...entry, 
        id: `offline-${Date.now()}-${Math.random()}`,
        created_at: new Date().toISOString()
      });
      
      const result = this.saveOfflineData({
        ...offlineData,
        reflectionEntries
      });
      
      if (result.success) {
        toast.info("Reflection saved offline. Will sync when online.");
      }
      
      return result;
    } catch (error) {
      console.error("Failed to save reflection entry offline:", error);
      toast.error("Failed to save reflection offline.");
      return { success: false, error };
    }
  }
}