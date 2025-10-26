import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SyncService } from "@/services/syncService";

export interface UserProfile {
  id: string;
  display_name: string;
  avatar_url?: string;
  theme_preference: 'light' | 'dark' | 'system';
  notification_settings: {
    mood_reminders: boolean;
    reflection_reminders: boolean;
    weekly_insights: boolean;
  };
  privacy_settings?: {
    share_data: boolean;
    public_profile: boolean;
    allow_analytics: boolean;
    notes: string;
  };
  onboarding_completed?: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  updateProfile: async () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        // If profile doesn't exist, create one
        if (error.code === 'PGRST116') {
          await createUserProfile();
        } else {
          throw error;
        }
      } else {
        // Parse JSON fields back to objects
        if (data.notification_settings && typeof data.notification_settings === 'string') {
          data.notification_settings = JSON.parse(data.notification_settings);
        }
        
        if (data.privacy_settings && typeof data.privacy_settings === 'string') {
          data.privacy_settings = JSON.parse(data.privacy_settings);
        }
        
        setProfile(data);
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    }
  };

  const createUserProfile = async () => {
    if (!user) return;

    try {
      const newProfile: any = {
        id: user.id,
        display_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        avatar_url: user.user_metadata?.avatar_url || null,
        theme_preference: 'system',
        notification_settings: JSON.stringify({
          mood_reminders: true,
          reflection_reminders: false,
          weekly_insights: true,
        }),
        onboarding_completed: false,
      };

      const { data, error } = await supabase
        .from('user_profiles')
        .insert(newProfile)
        .select()
        .single();

      if (error) throw error;
      
      // Parse JSON fields back to objects
      if (data.notification_settings && typeof data.notification_settings === 'string') {
        data.notification_settings = JSON.parse(data.notification_settings);
      }
      
      setProfile(data);
    } catch (error: any) {
      console.error('Error creating profile:', error);
      toast.error('Failed to create profile');
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !profile) return;

    console.log('Updating profile with:', updates);
    
    // Handle JSON columns properly
    const updateData: any = {
      ...updates,
      updated_at: new Date().toISOString(),
    };
    
    // Convert JSON objects to strings for database storage
    if (updates.notification_settings) {
      updateData.notification_settings = JSON.stringify(updates.notification_settings);
    }
    
    if (updates.privacy_settings) {
      updateData.privacy_settings = JSON.stringify(updates.privacy_settings);
    }
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('id', user.id)
        .select()
        .single();

      console.log('Profile update response:', { data, error });
      if (error) throw error;
      
      // Parse JSON fields back to objects
      if (data.notification_settings && typeof data.notification_settings === 'string') {
        data.notification_settings = JSON.parse(data.notification_settings);
      }
      
      if (data.privacy_settings && typeof data.privacy_settings === 'string') {
        data.privacy_settings = JSON.parse(data.privacy_settings);
      }
      
      setProfile(data);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile: ' + error.message);
    }
  };

  const signOut = async () => {
    try {
      // Cleanup sync service
      SyncService.cleanup();
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setSession(null);
      setProfile(null);
      toast.success('Signed out successfully');
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Initialize sync service when user logs in
          SyncService.initialize(session.user.id);
          await refreshProfile();
        } else {
          // Cleanup when user logs out
          SyncService.cleanup();
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Initialize sync service when user logs in
        SyncService.initialize(session.user.id);
        await refreshProfile();
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
      // Cleanup sync service
      SyncService.cleanup();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      profile, 
      loading, 
      signOut, 
      updateProfile, 
      refreshProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
};