interface DayTabsProps {
  activeDay: string;
  onDayChange: (day: string) => void;
  days?: string[];
}

const DEFAULT_DAYS = [
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi',
  'Dimanche',
];

export default function DayTabs({
  activeDay,
  onDayChange,
  days = DEFAULT_DAYS,
}: DayTabsProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-8 border-b border-[#34D399]/20 pb-4">
      {days.map((day) => (
        <button
          key={day}
          type="button"
          onClick={() => onDayChange(day)}
          className={`px-4 py-2 rounded-lg font-bold transition ${
            activeDay === day
              ? 'bg-gradient-to-r from-[#FF6B35] to-orange-600 text-white shadow-lg shadow-[#FF6B35]/30'
              : 'bg-[#1A1A1A] text-[#A0A0A0] border border-[#34D399]/20 hover:border-[#34D399]/50 hover:text-white'
          }`}
        >
          {day}
        </button>
      ))}
    </div>
  );
}
