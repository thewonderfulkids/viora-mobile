export type PremiumReminderCategory =
  | "hydration"
  | "meditation"
  | "sleep"
  | "workout"
  | "steps"
  | "habit"
  | "morning"
  | "night";

export type PremiumReminder = {
  id: string;
  category: PremiumReminderCategory;
  title: string;
  body: string;
  hour: number;
  minute: number;
  enabled: boolean;
  weekdays: number[];
  deepLink: string;
  sound: boolean;
  vibration: boolean;
  createdAt: string;
  notificationIds: string[];
};

export type PremiumNotificationSettings = {
  quietHoursEnabled: boolean;
  quietStartHour: number;
  quietEndHour: number;
};

export type ReminderDeliveryRecord = {
  id: string;
  reminderId: string;
  category: PremiumReminderCategory;
  scheduledFor: string;
  status: "scheduled" | "opened" | "cancelled";
};
