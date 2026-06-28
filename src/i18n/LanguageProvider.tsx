import { ReactNode, useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";

import { AppLanguage, i18n, initializeI18n } from ".";
import { saveStoredLanguage } from "./languageStorage";

type LanguageProviderProps = {
  children: ReactNode;
};

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initializeI18n().finally(() => setReady(true));
  }, []);

  if (!ready) return null;

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}

export async function changeAppLanguage(language: AppLanguage) {
  await saveStoredLanguage(language);
  await i18n.changeLanguage(language);
}