import { Waves } from "lucide-react-native";

import { WellnessHistoryList } from "../wellness";

type Props = {
  history: {
    title: string;
    durationMinutes: number;
    caloriesBurned: number;
    difficulty: string;
    time: string;
  }[];
};

export default function YogaHistoryCard({ history }: Props) {
  return (
    <WellnessHistoryList
      icon={Waves}
      title="Movement History"
      emptyText="No yoga or exercise completed today."
      items={history.map((item, index) => ({
        id: `${index}`,
        title: item.title,
        subtitle: `${item.durationMinutes} min • ${item.caloriesBurned} kcal • ${item.difficulty}`,
        time: item.time,
      }))}
    />
  );
}