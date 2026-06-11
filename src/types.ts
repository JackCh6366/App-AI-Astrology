export interface Constellation {
  name: string;
  enName: string;
  symbol: string;
  dateRange: string;
  element: "火" | "土" | "風" | "水";
  planet: string;
  motto: string;
  strengths: string[];
  weaknesses: string[];
  color: string;
  accentClass: string; // Tailwind background or border colors
  glowingClass: string; // Glowing shadow classes
}

export interface FortuneResult {
  overall: number; // 1-5
  love: number; // 1-5
  career: number; // 1-5
  wealth: number; // 1-5
  luckyNumber: number;
  luckyColor: string;
  luckyDirection: string;
  luckyTime: string;
  luckyGem: string;
  summary: string;
  loveAdvice: string;
  careerAdvice: string;
  wealthAdvice: string;
}

export interface MatchResult {
  score: number;
  title: string;
  brief: string;
  harmony: string;
  friction: string;
  tip: string;
}

export interface DivineResponse {
  success: boolean;
  insight: string;
  timestamp: string;
  error?: string;
}
