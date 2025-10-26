import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export class NotificationService {
  static async requestPermission() {
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications.");
      return false;
    }
    
    if (Notification.permission === "granted") {
      return true;
    }
    
    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }
    
    return false;
  }

  static showNotification(title: string, options?: NotificationOptions) {
    if (!("Notification" in window) || Notification.permission !== "granted") {
      // Fallback to toast notification
      toast(title, {
        description: options?.body,
        duration: 5000,
      });
      return;
    }
    
    new Notification(title, options);
  }

  static async scheduleDailyReminder(time: string, type: 'mood' | 'reflection') {
    // In a real implementation, this would integrate with the browser's 
    // background service workers or a backend notification service
    // For now, we'll use localStorage to track scheduled reminders
    
    try {
      const reminders = JSON.parse(localStorage.getItem("nuvora-reminders") || "{}");
      reminders[type] = time;
      localStorage.setItem("nuvora-reminders", JSON.stringify(reminders));
      
      console.log(`Scheduled ${type} reminder for ${time}`);
      return { success: true };
    } catch (error) {
      console.error("Failed to schedule reminder:", error);
      return { success: false, error };
    }
  }

  static async cancelReminder(type: 'mood' | 'reflection') {
    try {
      const reminders = JSON.parse(localStorage.getItem("nuvora-reminders") || "{}");
      delete reminders[type];
      localStorage.setItem("nuvora-reminders", JSON.stringify(reminders));
      
      console.log(`Cancelled ${type} reminder`);
      return { success: true };
    } catch (error) {
      console.error("Failed to cancel reminder:", error);
      return { success: false, error };
    }
  }

  static getStoredReminders() {
    try {
      return JSON.parse(localStorage.getItem("nuvora-reminders") || "{}");
    } catch (error) {
      console.error("Failed to get stored reminders:", error);
      return {};
    }
  }

  static async checkAndSendReminders() {
    // This function would typically run in a service worker or background process
    // For demo purposes, we'll check if it's time to send a reminder
    
    try {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const reminders = this.getStoredReminders();
      
      // Check if we should send a mood reminder
      if (reminders.mood && reminders.mood === currentTime) {
        this.showNotification("Nuvora Reminder", {
          body: "How are you feeling today? Take a moment to log your mood.",
          icon: "/favicon.ico",
          tag: "mood-reminder",
        });
      }
      
      // Check if we should send a reflection reminder
      if (reminders.reflection && reminders.reflection === currentTime) {
        this.showNotification("Nuvora Reminder", {
          body: "Time for your daily reflection. What's on your mind?",
          icon: "/favicon.ico",
          tag: "reflection-reminder",
        });
      }
      
      return { success: true };
    } catch (error) {
      console.error("Failed to check/send reminders:", error);
      return { success: false, error };
    }
  }
  
  static async initialize() {
    // Request notification permission on app start
    await this.requestPermission();
    
    // Set up periodic checking
    if (typeof window !== "undefined") {
      // Check for reminders every minute
      setInterval(() => {
        this.checkAndSendReminders();
      }, 60000);
      
      // Check immediately on initialization
      this.checkAndSendReminders();
    }
  }
}

// Initialize the notification service
NotificationService.initialize();