import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { AppLanguage, getStoredLanguage } from "./languageStorage";
import en from "./resources/en";
import hi from "./resources/hi";
export { T } from "./translationKeys";

const resources = {
  en: { translation: en },
  hi: { translation: hi },
};

function getDeviceLanguage(): AppLanguage {
  const languageCode = Localization.getLocales()[0]?.languageCode;

  return languageCode === "hi" ? "hi" : "en";
}

export async function initializeI18n() {
  const storedLanguage = await getStoredLanguage();
  const language = storedLanguage ?? getDeviceLanguage();

  if (!i18n.isInitialized) {
    await i18n.use(initReactI18next).init({
      compatibilityJSON: "v4",
      resources,
      lng: language,
      fallbackLng: "en",
      interpolation: {
        escapeValue: false,
      },
    });
  }

  return i18n;
}

export { i18n };
export type { AppLanguage };

