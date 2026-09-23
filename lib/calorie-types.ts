export type VisualAid = "body-condition";

export type CalorieTurn = {
  role: "assistant" | "user";
  content: string;
  visualAid?: VisualAid;
};

export type CatEnvironment = "indoor" | "outdoor" | "both";

export type CatProfile = {
  breed: string;
  ageYears: number;
  ageMonths: number;
  environment: CatEnvironment;
};

export type CalorieRequest = {
  profile: CatProfile;
  history: CalorieTurn[];
};

export type CalorieQuestionResponse = {
  type: "question";
  question: string;
  visualAid?: VisualAid;
};

export type FoodSuggestion = {
  brand: string;
  productType: string;
  form: "dry" | "wet";
  dailyPortion: string;
  note: string;
};

export type CalorieResultResponse = {
  type: "result";
  dailyCalories: number;
  lifeStage: string;
  basis: string;
  activityRecommendation: string;
  feedingGuidelines: string[];
  nutrientNotes: string[];
  foodSuggestions: FoodSuggestion[];
  cautions: string[];
};

export type CalorieResponse = CalorieQuestionResponse | CalorieResultResponse;

// AI 固定依序問完這些項目（每題一項）才給結果，題數就是這個清單的長度
export const QUESTION_TOPICS = [
  "體重（公斤）",
  "是否已絕育",
  "體態評估",
  "活動量",
  "目前飲食方式",
  "特殊健康狀況（如腎臟病、糖尿病、甲狀腺疾病等）",
] as const;

export const TOTAL_QUESTIONS = QUESTION_TOPICS.length;

export const ENVIRONMENT_LABELS: Record<CatEnvironment, string> = {
  indoor: "純室內飼養",
  outdoor: "可自由外出",
  both: "室內外皆可",
};
