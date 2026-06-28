import { Music4 } from "lucide-react-native";

import { WellnessHistoryList } from "../wellness";

type Props = {
  history: {
    title: string;
    therapyType: string;
    durationMinutes: number;
    time: string;
  }[];
};

export default function MusicHistoryCard({
  history,
}: Props) {
  return (
    <WellnessHistoryList
      icon={Music4}
      title="Today's Sessions"
      emptyText="No music therapy completed today."
      items={history.map((item, index) => ({
        id: `${index}`,
        title: item.title,
        subtitle: `${item.therapyType} • ${item.durationMinutes} min`,
        time: item.time,
      }))}
    />
  );
}