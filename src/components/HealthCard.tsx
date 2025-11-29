import { ReactNode } from "react";
import { Card } from "@/components/ui/card";

interface HealthCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
}

export const HealthCard = ({
  title,
  value,
  unit,
  icon,
  trend,
  trendValue,
  className = "",
}: HealthCardProps) => {
  const trendColors = {
    up: "text-green-500",
    down: "text-red-500",
    neutral: "text-muted-foreground",
  };

  return (
    <Card className={`p-6 gradient-card shadow-soft hover:shadow-medium transition-smooth ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-full bg-purple-light">{icon}</div>
        {trend && trendValue && (
          <span className={`text-sm font-medium ${trendColors[trend]}`}>
            {trendValue}
          </span>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-3xl font-bold font-display">
          {value}
          {unit && <span className="text-lg text-muted-foreground ml-1">{unit}</span>}
        </p>
      </div>
    </Card>
  );
};
