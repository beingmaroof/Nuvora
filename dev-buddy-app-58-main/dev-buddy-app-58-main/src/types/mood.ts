export interface MoodType {
  emoji: string;
  label: string;
  color: string;
  category: 'positive' | 'neutral' | 'negative';
  intensity: number; // 1-5 scale
}

export const MOOD_OPTIONS: MoodType[] = [
  // Positive moods
  { emoji: "😊", label: "Happy", color: "hsl(45, 93%, 70%)", category: 'positive', intensity: 4 },
  { emoji: "😄", label: "Excited", color: "hsl(60, 80%, 60%)", category: 'positive', intensity: 5 },
  { emoji: "😍", label: "Loved", color: "hsl(340, 82%, 70%)", category: 'positive', intensity: 5 },
  { emoji: "🤗", label: "Grateful", color: "hsl(120, 50%, 60%)", category: 'positive', intensity: 4 },
  { emoji: "😎", label: "Confident", color: "hsl(280, 60%, 70%)", category: 'positive', intensity: 4 },
  { emoji: "😌", label: "Peaceful", color: "hsl(200, 60%, 70%)", category: 'positive', intensity: 3 },
  { emoji: "🥰", label: "Blissful", color: "hsl(320, 70%, 70%)", category: 'positive', intensity: 5 },
  { emoji: "😇", label: "Content", color: "hsl(150, 50%, 60%)", category: 'positive', intensity: 3 },
  
  // Neutral moods
  { emoji: "😐", label: "Neutral", color: "hsl(216, 20%, 70%)", category: 'neutral', intensity: 3 },
  { emoji: "🤔", label: "Thoughtful", color: "hsl(240, 30%, 60%)", category: 'neutral', intensity: 3 },
  { emoji: "😑", label: "Indifferent", color: "hsl(200, 15%, 50%)", category: 'neutral', intensity: 2 },
  { emoji: "😶", label: "Quiet", color: "hsl(220, 25%, 60%)", category: 'neutral', intensity: 2 },
  
  // Negative moods
  { emoji: "😔", label: "Sad", color: "hsl(220, 50%, 60%)", category: 'negative', intensity: 2 },
  { emoji: "😰", label: "Anxious", color: "hsl(30, 80%, 60%)", category: 'negative', intensity: 2 },
  { emoji: "😡", label: "Angry", color: "hsl(0, 84%, 60%)", category: 'negative', intensity: 1 },
  { emoji: "😢", label: "Upset", color: "hsl(210, 50%, 60%)", category: 'negative', intensity: 2 },
  { emoji: "😴", label: "Tired", color: "hsl(220, 15%, 50%)", category: 'negative', intensity: 2 },
  { emoji: "😕", label: "Frustrated", color: "hsl(25, 70%, 60%)", category: 'negative', intensity: 2 },
  { emoji: "😞", label: "Disappointed", color: "hsl(200, 40%, 50%)", category: 'negative', intensity: 2 },
  { emoji: "😟", label: "Worried", color: "hsl(45, 60%, 50%)", category: 'negative', intensity: 2 },
];

export interface MoodEntry {
  id: string;
  user_id: string;
  mood_emoji: string;
  mood_label: string;
  mood_category: 'positive' | 'neutral' | 'negative';
  mood_intensity: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}