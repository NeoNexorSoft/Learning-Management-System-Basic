import {
  FileText,
  Clock,
  BarChart2,
  Target,
  Globe,
  Lightbulb,
  Image as ImageIcon,
} from "lucide-react";

interface OverviewItem {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}

interface QuizOverviewProps {
  title?: string;
  items: OverviewItem[];
  tip?: string;
}

export default function QuizOverview({
  title = "Quiz Overview",
  items,
  tip,
}: QuizOverviewProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
      <h3 className="font-semibold text-slate-800 text-sm">{title}</h3>

      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              {item.icon}
              <span>{item.label}</span>
            </div>
            <span className="text-sm font-semibold text-slate-800">
              {item.value}
            </span>
          </div>
        ))}
      </div>

      {tip && (
        <div className="bg-indigo-50 rounded-lg p-3 flex gap-2.5">
          <Lightbulb className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-indigo-700 mb-0.5">Tip</p>
            <p className="text-xs text-indigo-600 leading-relaxed">{tip}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Pre-built overview items helpers
export const overviewIcons = {
  questions: <FileText className="w-4 h-4" />,
  time: <Clock className="w-4 h-4" />,
  difficulty: <BarChart2 className="w-4 h-4" />,
  bloom: <Target className="w-4 h-4" />,
  language: <Globe className="w-4 h-4" />,
  type: <FileText className="w-4 h-4" />,
  image: <ImageIcon className="w-4 h-4" />,
};