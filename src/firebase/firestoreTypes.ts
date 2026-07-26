export type WellnessGoal =
  | "Lose Weight"
  | "Stay Active"
  | "Improve Sleep"
  | "Stress Relief"
  | "Healthy Lifestyle";

export type Gender = "Male" | "Female" | "Other";

export type Lifestyle =
  | "Office"
  | "WFH"
  | "Hybrid"
  | "Business"
  | "Student";

export type SubscriptionPlan = "Free" | "Plus" | "Pro";

export type SubscriptionStatus =
  | "Trial"
  | "Active"
  | "Expired"
  | "Cancelled";

export type BaseFirestoreDoc = {
  uid: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type UserAccessRole = "user" | "admin" | "super_admin";

export type UserDoc = BaseFirestoreDoc & {
  fullName: string;
  email: string;
  accessRole?: UserAccessRole;
  mobile?: string;
  photoURL?: string;

  onboardingCompleted: boolean;

  gender?: Gender;
  dob?: string;
  age?: number;

  height?: number;
  weight?: number;
  targetWeight?: number;

  goal?: WellnessGoal;
  lifestyle?: Lifestyle;

  dailyTimeCommitment?: string;
  stressLevel?: "Low" | "Moderate" | "High" | "Very High";
  aiCoachEnabled?: boolean;
  notificationsEnabled?: boolean;

  officeStart?: string;
  officeEnd?: string;

  wakeupTime?: string;
  sleepTime?: string;

  waterGoalMl: number;

  language: string;
  country: string;
  timezone: string;

  plan: SubscriptionPlan;
  subscriptionStatus: SubscriptionStatus;
};

export type DailyStatsDoc = BaseFirestoreDoc & {
  dateKey: string;
  waterMl: number;
  sleepMinutes: number;
  yogaMinutes: number;
  yogaSessions?: number;
  musicMinutes: number;
  moodScore?: number;
  aiScore?: number;
};

export type HydrationLogSource =
  | "manual"
  | "quick_add"
  | "ai"
  | "reminder"
  | "voice";

export type HydrationLogDoc = BaseFirestoreDoc & {
  dateKey: string;
  amountMl: number;
  source: HydrationLogSource;
  device: "mobile" | "web" | "watch";
  loggedAt: string;
};

export type SleepQuality = "Poor" | "Average" | "Good" | "Excellent";

export type SleepLogSource = "manual" | "ai" | "reminder";

export type SleepLogDoc = BaseFirestoreDoc & {
  dateKey: string;
  sleepStart: string;
  sleepEnd: string;
  durationMinutes: number;
  quality: SleepQuality;
  source: SleepLogSource;
  device: "mobile" | "web" | "watch";
  loggedAt: string;
};

export type YogaDifficulty =
  | "Beginner"
  | "Intermediate"
  | "Advanced";

export type YogaType =
  | "Yoga"
  | "Stretching"
  | "Workout"
  | "Walking"
  | "Breathing";

export type YogaSource =
  | "manual"
  | "ai"
  | "plan";

export type YogaSessionDoc = BaseFirestoreDoc & {
  dateKey: string;

  title: string;

  yogaType: YogaType;

  difficulty: YogaDifficulty;

  durationMinutes: number;

  caloriesBurned: number;

  completed: boolean;

  source: YogaSource;

  loggedAt: string;

  device: "mobile" | "web" | "watch";
};

export type MusicTherapyType =
  | "Relax"
  | "Sleep"
  | "Focus"
  | "Meditation"
  | "Nature"
  | "Anxiety Relief"
  | "Study"
  | "Office";

export type MusicSource =
  | "manual"
  | "ai"
  | "recommended";

export type MusicSessionDoc = BaseFirestoreDoc & {
  dateKey: string;

  title: string;

  therapyType: MusicTherapyType;

  durationMinutes: number;

  completed: boolean;

  source: MusicSource;

  moodBefore?: number;

  moodAfter?: number;

  playedAt: string;

  device?: string;
};

export type AIMessageRole =
  | "user"
  | "assistant"
  | "system";

export type AIMode =
  | "wellness"
  | "mental"
  | "nutrition"
  | "sleep";

export type AIConversationContext = {
  waterMl?: number;
  sleepMinutes?: number;
  yogaMinutes?: number;
  musicMinutes?: number;
  wellnessScore?: number;
  stressLevel?: string;
  goal?: string;
};

export type AIConversationDoc = BaseFirestoreDoc & {
  conversationId: string;

  mode: AIMode;

  role: AIMessageRole;

  message: string;

  summary?: string;

  context?: AIConversationContext;

  tokens?: number;

  model?: string;
};

export type JournalEntryDoc = BaseFirestoreDoc & {
  dateKey: string;
  mood: string;
  note: string;
  aiReflection?: string;
};

export type SubscriptionDoc = BaseFirestoreDoc & {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  startedAt: string;
  expiresAt?: string;
  provider: "razorpay" | "apple" | "google" | "manual";
};

export type PaymentDoc = BaseFirestoreDoc & {
  amount: number;
  currency: "INR";
  provider: "razorpay" | "apple" | "google";
  status: "Created" | "Paid" | "Failed" | "Refunded";
  providerPaymentId?: string;
};

export type NotificationDoc = BaseFirestoreDoc & {
  title: string;
  message: string;
  type: "hydration" | "sleep" | "yoga" | "music" | "ai" | "system";
  read: boolean;
};