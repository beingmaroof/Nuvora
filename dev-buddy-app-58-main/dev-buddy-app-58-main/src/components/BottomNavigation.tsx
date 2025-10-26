import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Smile, PenTool, BarChart3, User, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

const navigationItems = [
  {
    path: "/",
    label: "Home",
    icon: Home,
  },
  {
    path: "/mood",
    label: "Mood",
    icon: Smile,
  },

  {
    path: "/quotes",
    label: "Quotes",
    icon: Quote,
  },
  {
    path: "/profile",
    label: "Profile",
    icon: User,
  },
];

export const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-2 z-50">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Button
              key={item.path}
              variant="ghost"
              size="sm"
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center gap-1 h-auto py-2 px-3 min-w-0 flex-1",
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};