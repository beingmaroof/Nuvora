import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Smile, 
  PenTool, 
  BarChart3, 
  Quote, 
  CheckCircle, 
  ArrowRight, 
  Sparkles,
  Heart,
  Target,
  BookOpen
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const ONBOARDING_STEPS = [
  {
    id: 1,
    title: "Welcome to Nuvora",
    description: "Your journey to emotional wellness starts here",
    icon: Sparkles,
    content: (
      <div className="text-center space-y-4">
        <div className="mx-auto bg-primary/10 rounded-full p-4 w-16 h-16 flex items-center justify-center">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <p className="text-muted-foreground">
          Nuvora helps you track your emotions, engage in meaningful self-reflection, 
          and foster personal growth through daily journaling practices.
        </p>
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Smile className="h-3 w-3" />
            Mood Tracking
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <PenTool className="h-3 w-3" />
            Reflections
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <BarChart3 className="h-3 w-3" />
            Analytics
          </Badge>
        </div>
      </div>
    )
  },
  {
    id: 2,
    title: "Track Your Mood",
    description: "Quickly log how you're feeling throughout the day",
    icon: Smile,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Use our intuitive emoji-based system to log your current mood in seconds.
        </p>
        <div className="grid grid-cols-4 gap-2">
          {["😊", "😄", "😍", "🤗", "😎", "😌", "😐", "🤔", "😔", "😰", "😡", "😢"].map((emoji, index) => (
            <div 
              key={index} 
              className="p-3 bg-muted rounded-lg text-center text-2xl hover:bg-muted/80 transition-colors cursor-pointer"
            >
              {emoji}
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          Add optional notes to provide context for your mood entries.
        </p>
      </div>
    )
  },
  {
    id: 3,
    title: "Daily Reflections",
    description: "Engage in meaningful self-reflection with guided prompts",
    icon: PenTool,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Our rotating daily questions help you explore your emotions, gratitude, 
          challenges, and personal growth.
        </p>
        <div className="space-y-3">
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="font-medium">"What are you grateful for today?"</p>
            <Badge variant="secondary" className="mt-2">Gratitude</Badge>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="font-medium">"What challenged you today and what did you learn?"</p>
            <Badge variant="secondary" className="mt-2">Growth</Badge>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="font-medium">"How are you feeling right now and why?"</p>
            <Badge variant="secondary" className="mt-2">Emotions</Badge>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 4,
    title: "Gain Insights",
    description: "Visualize your emotional patterns and track your progress",
    icon: BarChart3,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Discover trends in your emotional wellness through interactive charts 
          and personalized insights.
        </p>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <div className="flex-1">
              <p className="text-sm">Positive Days</p>
              <p className="text-xs text-muted-foreground">65% of the time</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="flex-1">
              <p className="text-sm">Weekly Average</p>
              <p className="text-xs text-muted-foreground">3.8/5 mood score</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <div className="flex-1">
              <p className="text-sm">Current Streak</p>
              <p className="text-xs text-muted-foreground">7 days</p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 5,
    title: "Daily Inspiration",
    description: "Stay motivated with fresh quotes each day",
    icon: Quote,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Start each day with inspiring quotes that promote mindfulness, 
          growth, and positivity.
        </p>
        <div className="p-4 bg-primary/5 rounded-lg">
          <p className="italic text-lg">"The only way to do great work is to love what you do."</p>
          <p className="text-right text-sm text-muted-foreground mt-2">— Steve Jobs</p>
        </div>
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm">
            <Heart className="h-4 w-4 mr-1" />
            Favorite
          </Button>
          <Button variant="outline" size="sm">
            <ArrowRight className="h-4 w-4 ml-1" />
            Next Quote
          </Button>
        </div>
      </div>
    )
  },
  {
    id: 6,
    title: "You're All Set!",
    description: "Ready to begin your emotional wellness journey",
    icon: CheckCircle,
    content: (
      <div className="text-center space-y-4">
        <div className="mx-auto bg-green-500/10 rounded-full p-4 w-16 h-16 flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-green-500" />
        </div>
        <p className="text-muted-foreground">
          You're now ready to start tracking your moods, reflecting on your day, 
          and gaining insights into your emotional wellness.
        </p>
        <div className="p-4 bg-primary/5 rounded-lg">
          <p className="font-medium">First steps:</p>
          <ul className="text-left text-sm text-muted-foreground mt-2 space-y-1">
            <li>• Log your first mood entry</li>
            <li>• Complete today's reflection prompt</li>
            <li>• Explore your analytics dashboard</li>
          </ul>
        </div>
      </div>
    )
  }
];

export const Onboarding = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = async () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      if (user) {
        try {
          await updateProfile({
            onboarding_completed: true,
          });
        } catch (error) {
          console.error("Failed to update onboarding status:", error);
        }
      }
      navigate("/");
    }
  };

  const handleSkip = async () => {
    // Skip onboarding
    if (user) {
      try {
        await updateProfile({
          onboarding_completed: true,
        });
      } catch (error) {
        console.error("Failed to update onboarding status:", error);
      }
    }
    navigate("/");
  };

  const Icon = ONBOARDING_STEPS[currentStep].icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Icon className="h-12 w-12 text-primary mx-auto" />
          </div>
          <CardTitle className="text-2xl">
            {ONBOARDING_STEPS[currentStep].title}
          </CardTitle>
          <CardDescription>
            {ONBOARDING_STEPS[currentStep].description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {ONBOARDING_STEPS[currentStep].content}
          
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="flex gap-1">
                {ONBOARDING_STEPS.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index === currentStep ? "bg-primary" : "bg-muted"
                    }`}
                  />
                ))}
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={handleSkip}
                className="flex-1"
              >
                Skip
              </Button>
              <Button 
                onClick={handleNext}
                className="flex-1"
              >
                {currentStep === ONBOARDING_STEPS.length - 1 ? "Get Started" : "Next"}
                {currentStep !== ONBOARDING_STEPS.length - 1 && (
                  <ArrowRight className="ml-2 h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};