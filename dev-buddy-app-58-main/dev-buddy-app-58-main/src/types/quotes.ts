export interface Quote {
  id: string;
  text: string;
  author: string;
  category: 'motivation' | 'mindfulness' | 'growth' | 'positivity' | 'wisdom' | 'creativity';
  tags: string[];
  favorited?: boolean;
  createdAt?: string;
}

export const QUOTES: Quote[] = [
  // Motivation
  {
    id: "mot-1",
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
    category: "motivation",
    tags: ["work", "passion", "excellence"]
  },
  {
    id: "mot-2",
    text: "Believe you can and you're halfway there.",
    author: "Theodore Roosevelt",
    category: "motivation",
    tags: ["belief", "confidence", "persistence"]
  },
  {
    id: "mot-3",
    text: "It does not matter how slowly you go as long as you do not stop.",
    author: "Confucius",
    category: "motivation",
    tags: ["persistence", "progress", "journey"]
  },
  {
    id: "mot-4",
    text: "Success is not final, failure is not fatal: It is the courage to continue that counts.",
    author: "Winston Churchill",
    category: "motivation",
    tags: ["success", "failure", "courage"]
  },
  {
    id: "mot-5",
    text: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt",
    category: "motivation",
    tags: ["future", "dreams", "belief"]
  },

  // Mindfulness
  {
    id: "mind-1",
    text: "Be yourself; everyone else is already taken.",
    author: "Oscar Wilde",
    category: "mindfulness",
    tags: ["authenticity", "individuality", "self"]
  },
  {
    id: "mind-2",
    text: "The present moment is filled with joy and happiness. If you are attentive, you will see it.",
    author: "Thich Nhat Hanh",
    category: "mindfulness",
    tags: ["present", "joy", "awareness"]
  },
  {
    id: "mind-3",
    text: "Yesterday is history, tomorrow is a mystery, today is a gift. That is why it is called the present.",
    author: "Eleanor Roosevelt",
    category: "mindfulness",
    tags: ["present", "time", "gratitude"]
  },
  {
    id: "mind-4",
    text: "Wherever you go, go with all your heart.",
    author: "Confucius",
    category: "mindfulness",
    tags: ["heart", "intention", "presence"]
  },
  {
    id: "mind-5",
    text: "The quieter you become, the more you can hear.",
    author: "Ram Dass",
    category: "mindfulness",
    tags: ["quiet", "listening", "awareness"]
  },

  // Growth
  {
    id: "grow-1",
    text: "The only way to make sense out of change is to plunge into it, move with it, and join the dance.",
    author: "Alan Watts",
    category: "growth",
    tags: ["change", "adaptation", "growth"]
  },
  {
    id: "grow-2",
    text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.",
    author: "Ralph Waldo Emerson",
    category: "growth",
    tags: ["inner strength", "character", "resilience"]
  },
  {
    id: "grow-3",
    text: "The best way to predict the future is to create it.",
    author: "Peter Drucker",
    category: "growth",
    tags: ["future", "creation", "agency"]
  },
  {
    id: "grow-4",
    text: "Growth begins at the end of your comfort zone.",
    author: "Neale Donald Walsch",
    category: "growth",
    tags: ["growth", "comfort zone", "challenge"]
  },
  {
    id: "grow-5",
    text: "The bamboo that bends is stronger than the oak that resists.",
    author: "Japanese Proverb",
    category: "growth",
    tags: ["flexibility", "strength", "adaptation"]
  },

  // Positivity
  {
    id: "pos-1",
    text: "Keep your face always toward the sunshine—and shadows will fall behind you.",
    author: "Walt Whitman",
    category: "positivity",
    tags: ["positivity", "sunshine", "optimism"]
  },
  {
    id: "pos-2",
    text: "In every day, there are 1,440 minutes. That means we have 1,440 daily opportunities to make a positive impact.",
    author: "Les Brown",
    category: "positivity",
    tags: ["opportunity", "impact", "daily"]
  },
  {
    id: "pos-3",
    text: "Positive thinking will let you do everything better than negative thinking will.",
    author: "Zig Ziglar",
    category: "positivity",
    tags: ["thinking", "attitude", "performance"]
  },
  {
    id: "pos-4",
    text: "The greatest glory in living lies not in never falling, but in rising every time we fall.",
    author: "Nelson Mandela",
    category: "positivity",
    tags: ["resilience", "perseverance", "strength"]
  },
  {
    id: "pos-5",
    text: "Happiness is not something ready made. It comes from your own actions.",
    author: "Dalai Lama",
    category: "positivity",
    tags: ["happiness", "actions", "agency"]
  }
];