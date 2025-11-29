import { useEffect, useState } from "react";
import oxyMascot from "@/assets/oxy-mascot.png";

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  showMascot?: boolean;
}

export const ProgressRing = ({
  progress,
  size = 200,
  strokeWidth = 12,
  showMascot = true,
}: ProgressRingProps) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (animatedProgress / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedProgress(progress), 100);
    return () => clearTimeout(timer);
  }, [progress]);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--primary))"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showMascot && (
          <img
            src={oxyMascot}
            alt="Oxy Mascot"
            className="w-20 h-20 mb-2 animate-float"
          />
        )}
        <span className="text-2xl font-bold font-display">{Math.round(animatedProgress)}%</span>
      </div>
    </div>
  );
};
