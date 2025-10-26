import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Heart, Share2, Quote as QuoteIcon } from "lucide-react";
import { toast } from "sonner";
import { QUOTES, Quote } from "@/types/quotes";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { BottomNavigation } from "@/components/BottomNavigation";
import type { Tables } from "@/integrations/supabase/types";

type UserFavorite = Tables<"user_favorites">;

export default function QuoteFavorites() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, [user]);

  const loadFavorites = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("user_favorites")
        .select("quote_id")
        .eq("user_id", user.id)
        .eq("type", "quote");

      if (error) throw error;
      
      const favoriteIds = data.map(item => item.quote_id);
      const favoriteQuotes = QUOTES.filter(quote => favoriteIds.includes(quote.id));
      setFavorites(favoriteQuotes);
    } catch (error: any) {
      console.error("Error loading favorites:", error);
      // Fallback to localStorage
      const savedFavorites = localStorage.getItem("nuvora-favorites");
      if (savedFavorites) {
        try {
          const ids = JSON.parse(savedFavorites) as string[];
          const favoriteQuotes = QUOTES.filter(quote => ids.includes(quote.id));
          setFavorites(favoriteQuotes);
        } catch (e) {
          console.error("Failed to parse favorites", e);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (id: string) => {
    if (!user) {
      toast.error("Please sign in to manage favorites");
      return;
    }

    try {
      const { error } = await supabase
        .from("user_favorites")
        .delete()
        .match({ user_id: user.id, quote_id: id, type: "quote" });

      if (error) throw error;
      
      // Update displayed favorites
      const updatedFavorites = favorites.filter(quote => quote.id !== id);
      setFavorites(updatedFavorites);
      
      toast.success("Removed from favorites");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleShare = async (quote: Quote) => {
    const shareText = `"${quote.text}" - ${quote.author}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Favorite Quote",
          text: shareText,
        });
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(shareText);
        toast.success("Quote copied to clipboard!");
      }
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success("Quote copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 p-4 pb-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 p-4 pb-20">
      <div className="max-w-4xl mx-auto py-8 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/quotes")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-accent font-bold text-primary">
            Favorite Quotes
          </h1>
        </div>

        <div className="space-y-4">
          {favorites.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <div className="space-y-2">
                  <Heart className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p>No favorite quotes yet</p>
                  <p className="text-sm">Start adding some from the quotes page!</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => navigate("/quotes")}
                  >
                    Browse Quotes
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {favorites.map((quote) => (
                <Card key={quote.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <QuoteIcon className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <blockquote className="text-lg italic leading-relaxed mb-3">
                          "{quote.text}"
                        </blockquote>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-muted-foreground">
                              — {quote.author}
                            </p>
                            <Badge variant="secondary" className="mt-2">
                              {quote.category}
                            </Badge>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleRemoveFavorite(quote.id)}
                              className="text-red-500 hover:text-red-600"
                            >
                              <Heart className="h-4 w-4" fill="currentColor" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleShare(quote)}
                            >
                              <Share2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
}