import { useAppTranslation } from "../../i18n/useAppTranslation";
import { MoonStar } from "lucide-react-native";

import { WellnessHistoryList } from "../wellness";

type Props = {
  history: {
    durationMinutes: number;
    quality: string;
    time: string;
  }[];
};

export default function SleepHistoryCard({ history }: Props) {
  const { t } = useAppTranslation();
  return (
    <WellnessHistoryList
      icon={MoonStar}
      title={t("sleep.history")}
      emptyText={t("sleep.empty")}
      items={history.map((item, index) => ({
        id: `${index}`,
        title: t("sleep.hours", { hours: (item.durationMinutes / 60).toFixed(1) }),
        subtitle: t(`sleep.${item.quality}`, { defaultValue: item.quality }),
        time: item.time,
      }))}
    />
  );
}