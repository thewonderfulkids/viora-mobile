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
  return (
    <WellnessHistoryList
      icon={MoonStar}
      title="Sleep History"
      emptyText="No sleep logged today."
      items={history.map((item, index) => ({
        id: `${index}`,
        title: `${(item.durationMinutes / 60).toFixed(1)} hrs`,
        subtitle: item.quality,
        time: item.time,
      }))}
    />
  );
}