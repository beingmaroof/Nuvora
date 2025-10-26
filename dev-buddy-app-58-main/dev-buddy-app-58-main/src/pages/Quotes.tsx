import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Heart, Share2, RefreshCw, Quote as QuoteIcon } from "lucide-react";
import { toast } from "sonner";
import { QUOTES, Quote } from "@/types/quotes";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { BottomNavigation } from "@/components/BottomNavigation";
import type { Tables } from "@/integrations/supabase/types";

type UserFavorite = Tables<"user_favorites">;

export default function Quotes() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    loadFavorites();
  }, [user]);

  const loadFavorites = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("user_favorites")
        .select("quote_id")
        .eq("user_id", user.id)
        .eq("type", "quote");

      if (error) throw error;
      
      const favoriteIds = data.map(item => item.quote_id);
      setFavorites(favoriteIds);
    } catch (error: any) {
      console.error("Error loading favorites:", error);
      // Fallback to localStorage
      const savedFavorites = localStorage.getItem("nuvora-favorites");
      if (savedFavorites) {
        try {
          setFavorites(JSON.parse(savedFavorites));
        } catch (e) {
          console.error("Failed to parse favorites", e);
        }
      }
    }
  };

  const handleFavorite = async (quoteId: string) => {
    if (!user) {
      toast.error("Please sign in to favorite quotes");
      return;
    }

    try {
      if (favorites.includes(quoteId)) {
        // Remove from favorites
        const { error } = await supabase
          .from("user_favorites")
          .delete()
          .match({ user_id: user.id, quote_id: quoteId, type: "quote" });

        if (error) throw error;
        
        setFavorites(favorites.filter(id => id !== quoteId));
        toast.success("Removed from favorites");
      } else {
        // Add to favorites
        const { error } = await supabase
          .from("user_favorites")
          .insert({
            user_id: user.id,
            quote_id: quoteId,
            type: "quote"
          });

        if (error) throw error;
        
        setFavorites([...favorites, quoteId]);
        toast.success("Added to favorites");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleShare = async (quote: Quote) => {
    const shareText = `"${quote.text}" - ${quote.author}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Daily Inspiration",
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

  const handleNewQuote = () => {
    setCurrentQuoteIndex((prev) => (prev + 1) % QUOTES.length);
  };

  const getCategoryQuotes = (category: string) => {
    return QUOTES.filter(quote => quote.category === category);
  };

  const currentQuote = QUOTES[currentQuoteIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 p-4 pb-20">
      <div className="max-w-2xl mx-auto py-8 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-accent font-bold text-primary">
            Daily Quotes
          </h1>
        </div>

        <Card className="min-h-64">
          <CardHeader>
            <CardTitle className="text-center">Today's Inspiration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <blockquote className="text-lg italic text-center leading-relaxed">
              "{currentQuote.text}"
            </blockquote>
            <p className="text-center text-muted-foreground">
              — {currentQuote.author}
            </p>
            
            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleFavorite(currentQuote.id)}
                className={favorites.includes(currentQuote.id) ? "text-red-500" : ""}
              >
                <Heart className="h-4 w-4" fill={favorites.includes(currentQuote.id) ? "currentColor" : "none"} />
              </Button>
              <Button variant="outline" size="icon" onClick={() => handleShare(currentQuote)}>
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleNewQuote}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quote Categories */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Quotes</TabsTrigger>
            <TabsTrigger value="motivation">Motivation</TabsTrigger>
            <TabsTrigger value="mindfulness">Mindfulness</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            <div className="grid gap-4">
              {QUOTES.slice(0, 5).map((quote) => (
                <Card 
                  key={quote.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => {
                    const index = QUOTES.findIndex(q => q.id === quote.id);
                    if (index !== -1) setCurrentQuoteIndex(index);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <QuoteIcon className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm italic mb-2 line-clamp-2">"{quote.text}"</p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">— {quote.author}</p>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFavorite(quote.id);
                            }}
                          >
                            <Heart 
                              className="h-4 w-4" 
                              fill={favorites.includes(quote.id) ? "currentColor" : "none"} 
                            />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="motivation" className="space-y-4">
            <div className="grid gap-4">
              {getCategoryQuotes("motivation").slice(0, 5).map((quote) => (
                <Card 
                  key={quote.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => {
                    const index = QUOTES.findIndex(q => q.id === quote.id);
                    if (index !== -1) setCurrentQuoteIndex(index);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <QuoteIcon className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm italic mb-2 line-clamp-2">"{quote.text}"</p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">— {quote.author}</p>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFavorite(quote.id);
                            }}
                          >
                            <Heart 
                              className="h-4 w-4" 
                              fill={favorites.includes(quote.id) ? "currentColor" : "none"} 
                            />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="mindfulness" className="space-y-4">
            <div className="grid gap-4">
              {getCategoryQuotes("mindfulness").slice(0, 5).map((quote) => (
                <Card 
                  key={quote.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => {
                    const index = QUOTES.findIndex(q => q.id === quote.id);
                    if (index !== -1) setCurrentQuoteIndex(index);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <QuoteIcon className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm italic mb-2 line-clamp-2">"{quote.text}"</p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">— {quote.author}</p>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFavorite(quote.id);
                            }}
                          >
                            <Heart 
                              className="h-4 w-4" 
                              fill={favorites.includes(quote.id) ? "currentColor" : "none"} 
                            />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="text-center">
          <Button variant="outline" onClick={() => navigate("/quotes/favorites")}>
            View All Favorites
          </Button>
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
}