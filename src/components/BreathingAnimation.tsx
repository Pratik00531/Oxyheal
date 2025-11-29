// Animated breathing circle component

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import type { BreathingPattern } from '@/types/breathing';

interface BreathingAnimationProps {
  pattern: BreathingPattern;
  isActive: boolean;
  onCycleComplete?: () => void;
}

type Phase = 'inhale' | 'hold_in' | 'exhale' | 'hold_out';

export const BreathingAnimation = ({ pattern, isActive, onCycleComplete }: BreathingAnimationProps) => {
  const [phase, setPhase] = useState<Phase>('inhale');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setPhase('inhale');
      setProgress(0);
      return;
    }

    const getCurrentPhaseDuration = () => {
      switch (phase) {
        case 'inhale': return pattern.inhale;
        case 'hold_in': return pattern.hold_in || 0;
        case 'exhale': return pattern.exhale;
        case 'hold_out': return pattern.hold_out || 0;
      }
    };

    const duration = getCurrentPhaseDuration();
    
    if (duration === 0) {
      // Skip phases with 0 duration
      moveToNextPhase();
      return;
    }

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      
      setProgress(newProgress);

      if (newProgress >= 100) {
        moveToNextPhase();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [phase, isActive, pattern]);

  const moveToNextPhase = () => {
    setProgress(0);
    
    switch (phase) {
      case 'inhale':
        setPhase((pattern.hold_in || 0) > 0 ? 'hold_in' : 'exhale');
        break;
      case 'hold_in':
        setPhase('exhale');
        break;
      case 'exhale':
        setPhase((pattern.hold_out || 0) > 0 ? 'hold_out' : 'inhale');
        break;
      case 'hold_out':
        setPhase('inhale');
        if (onCycleComplete) onCycleComplete();
        break;
    }
  };

  const getPhaseText = () => {
    switch (phase) {
      case 'inhale': return 'Breathe In';
      case 'hold_in': return 'Hold';
      case 'exhale': return 'Breathe Out';
      case 'hold_out': return 'Hold';
    }
  };

  const getPhaseColor = () => {
    switch (phase) {
      case 'inhale': return 'from-blue-400 to-blue-600';
      case 'hold_in': return 'from-purple-400 to-purple-600';
      case 'exhale': return 'from-green-400 to-green-600';
      case 'hold_out': return 'from-yellow-400 to-yellow-600';
    }
  };

  // Calculate scale based on phase
  const getScale = () => {
    if (phase === 'inhale') {
      return 0.5 + (progress / 100) * 0.5; // 0.5 to 1.0
    } else if (phase === 'exhale') {
      return 1.0 - (progress / 100) * 0.5; // 1.0 to 0.5
    }
    return phase === 'hold_in' ? 1.0 : 0.5; // Stay at size during hold
  };

  const getCurrentDuration = () => {
    switch (phase) {
      case 'inhale': return pattern.inhale;
      case 'hold_in': return pattern.hold_in || 0;
      case 'exhale': return pattern.exhale;
      case 'hold_out': return pattern.hold_out || 0;
    }
  };

  return (
    <Card className="relative w-full aspect-square max-w-md mx-auto bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-2 border-purple-200 dark:border-purple-800 overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Animated circle */}
        <div
          className={`relative rounded-full bg-gradient-to-br ${getPhaseColor()} shadow-2xl transition-all duration-300 ease-in-out`}
          style={{
            width: '80%',
            height: '80%',
            transform: `scale(${getScale()})`,
            transition: `transform ${getCurrentDuration()}s ease-in-out`,
          }}
        >
          {/* Pulse rings */}
          {isActive && (
            <>
              <div className="absolute inset-0 rounded-full bg-white/20 animate-ping"></div>
              <div className="absolute inset-0 rounded-full bg-white/10 animate-pulse"></div>
            </>
          )}

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
            <p className="text-3xl md:text-4xl font-bold mb-2 drop-shadow-lg">
              {getPhaseText()}
            </p>
            <p className="text-xl md:text-2xl font-medium opacity-90">
              {Math.ceil(getCurrentDuration() * (1 - progress / 100))}s
            </p>
          </div>
        </div>

        {/* Progress ring */}
        {isActive && (
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="45%"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="text-purple-200 dark:text-purple-800"
            />
            <circle
              cx="50%"
              cy="50%"
              r="45%"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="text-purple-600 dark:text-purple-400"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
              style={{ transition: 'stroke-dashoffset 0.3s ease-in-out' }}
            />
          </svg>
        )}
      </div>
    </Card>
  );
};
