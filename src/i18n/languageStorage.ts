import AsyncStorage from "@react-native-async-storage/async-storage";

export type AppLanguage = "en" | "hi";

const LANGUAGE_KEY = "viora_app_language";

export async function getStoredLanguage(): Promise<AppLanguage | null> {
  const value = await AsyncStorage.getItem(LANGUAGE_KEY);

  if (value === "en" || value === "hi") {
    return value;
  }

  return null;
}

export async function saveStoredLanguage(language: AppLanguage) {
  await AsyncStorage.setItem(LANGUAGE_KEY, language);
}