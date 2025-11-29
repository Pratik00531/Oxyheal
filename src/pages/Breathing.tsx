import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { MobileNav } from "@/components/MobileNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BreathingAnimation } from "@/components/BreathingAnimation";
import { Play, Wind, Clock, Target, ArrowLeft, CheckCircle2, Pause, RotateCcw } from "lucide-react";
import oxyMascot from "@/assets/oxy-mascot.png";
import { breathingApi } from "@/lib/breathingApi";
import type { BreathingExercise } from "@/types/breathing";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

type View = 'list' | 'active' | 'complete';

const Breathing = () => {
  const [exercises, setExercises] = useState<BreathingExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>('list');
  const [selectedExercise, setSelectedExercise] = useState<BreathingExercise | null>(null);
  const [isExerciseActive, setIsExerciseActive] = useState(false);
  const [currentCycle, setCurrentCycle] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    setLoading(true);
    const response = await breathingApi.getExercises();
    if (response.data) {
      setExercises(response.data);
    } else {
      toast({
        title: "Error",
        description: response.error || "Failed to load exercises",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const startExercise = (exercise: BreathingExercise) => {
    setSelectedExercise(exercise);
    setCurrentCycle(0);
    setSessionStartTime(new Date());
    setView('active');
    setIsExerciseActive(true);
  };

  const pauseExercise = () => {
    setIsExerciseActive(false);
  };

  const resumeExercise = () => {
    setIsExerciseActive(true);
  };

  const handleCycleComplete = () => {
    const newCycle = currentCycle + 1;
    setCurrentCycle(newCycle);

    if (selectedExercise && newCycle >= selectedExercise.cycles) {
      // Exercise complete
      setIsExerciseActive(false);
      setView('complete');
    }
  };

  const saveSession = async () => {
    if (!selectedExercise || !sessionStartTime) return;

    const duration = Math.floor((Date.now() - sessionStartTime.getTime()) / 1000);
    
    const response = await breathingApi.createSession({
      exercise_id: selectedExercise.id,
      duration,
      cycles_completed: currentCycle,
      completion_status: currentCycle >= selectedExercise.cycles ? 'completed' : 'incomplete',
      notes: "",
    });

    if (response.data) {
      toast({
        title: "Session Saved!",
        description: `Great work! You completed ${currentCycle} cycles.`,
      });
      resetExercise();
    } else {
      toast({
        title: "Save Failed",
        description: response.error || "Could not save session",
        variant: "destructive",
      });
    }
  };

  const resetExercise = () => {
    setView('list');
    setSelectedExercise(null);
    setCurrentCycle(0);
    setSessionStartTime(null);
    setIsExerciseActive(false);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} minute${mins !== 1 ? 's' : ''}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <MobileNav />
        <main className="md:ml-20 p-6 md:p-8 pb-24 md:pb-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </main>
      </div>
    );
  }

  // Active Exercise View
  if (view === 'active' && selectedExercise) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <MobileNav />
        <main className="md:ml-20 p-6 md:p-8 pb-24 md:pb-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <Button
              variant="ghost"
              onClick={resetExercise}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back to Exercises
            </Button>

            <div className="text-center space-y-2">
              <h1 className="text-3xl font-display font-bold">{selectedExercise.name}</h1>
              <div className="flex items-center justify-center gap-4 text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Target className="w-4 h-4" />
                  Cycle {currentCycle + 1} of {selectedExercise.cycles}
                </span>
              </div>
            </div>

            {/* Animation Component */}
            <BreathingAnimation
              pattern={selectedExercise.pattern}
              isActive={isExerciseActive}
              onCycleComplete={handleCycleComplete}
            />

            {/* Controls */}
            <div className="flex justify-center gap-4">
              {isExerciseActive ? (
                <Button
                  size="lg"
                  variant="outline"
                  onClick={pauseExercise}
                  className="rounded-full"
                >
                  <Pause className="mr-2 w-5 h-5" />
                  Pause
                </Button>
              ) : (
                <Button
                  size="lg"
                  onClick={resumeExercise}
                  className="rounded-full bg-primary hover:bg-primary/90"
                >
                  <Play className="mr-2 w-5 h-5" />
                  Resume
                </Button>
              )}
              <Button
                size="lg"
                variant="outline"
                onClick={resetExercise}
                className="rounded-full"
              >
                <RotateCcw className="mr-2 w-5 h-5" />
                End Session
              </Button>
            </div>

            {/* Instructions */}
            <Card className="p-6">
              <h3 className="font-semibold mb-3">Instructions</h3>
              <ol className="space-y-2">
                {selectedExercise.instructions.map((instruction, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground">
                    {idx + 1}. {instruction}
                  </li>
                ))}
              </ol>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // Complete View
  if (view === 'complete' && selectedExercise) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <MobileNav />
        <main className="md:ml-20 p-6 md:p-8 pb-24 md:pb-8">
          <div className="max-w-2xl mx-auto space-y-8">
            <Card className="p-8 text-center space-y-6">
              <div className="flex justify-center">
                <div className="p-4 rounded-full bg-green-100 dark:bg-green-900/30">
                  <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
                </div>
              </div>
              
              <div className="space-y-2">
                <h1 className="text-3xl font-display font-bold">Exercise Complete!</h1>
                <p className="text-muted-foreground">
                  Great work completing {selectedExercise.name}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 py-6">
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-primary">{currentCycle}</p>
                  <p className="text-sm text-muted-foreground">Cycles Completed</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-primary">
                    {sessionStartTime ? Math.floor((Date.now() - sessionStartTime.getTime()) / 60000) : 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Minutes</p>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  size="lg"
                  onClick={saveSession}
                  className="w-full rounded-full bg-primary hover:bg-primary/90"
                >
                  Save Session
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={resetExercise}
                  className="w-full rounded-full"
                >
                  Back to Exercises
                </Button>
              </div>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // List View (Default)
  const featuredExercise = exercises.find(e => e.id === '478-breathing') || exercises[0];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <MobileNav />
      
      <main className="md:ml-20 p-6 md:p-8 pb-24 md:pb-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-display font-bold">Breathing Exercises</h1>
            <p className="text-muted-foreground text-lg">Guided exercises to improve your lung health</p>
          </div>

          {/* Featured Exercise */}
          {featuredExercise && (
            <Card className="p-8 gradient-primary shadow-medium">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                  <Badge className="bg-white/20 text-white hover:bg-white/30">
                    Featured Exercise
                  </Badge>
                  <h2 className="text-3xl font-display font-bold">{featuredExercise.name}</h2>
                  <p className="text-lg">
                    {featuredExercise.benefits[0]}. {featuredExercise.benefits[1]}.
                  </p>
                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-5 h-5" />
                      <span className="text-sm">{formatDuration(featuredExercise.duration)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Target className="w-5 h-5" />
                      <span className="text-sm capitalize">{featuredExercise.difficulty}</span>
                    </div>
                  </div>
                  <Button 
                    size="lg" 
                    onClick={() => startExercise(featuredExercise)}
                    className="rounded-full bg-white text-primary hover:bg-white/90 shadow-soft"
                  >
                    <Play className="mr-2 w-5 h-5" />
                    Start Exercise
                  </Button>
                </div>
                <div className="flex justify-center">
                  <img src={oxyMascot} alt="Oxy" className="w-64 h-64 animate-float" />
                </div>
              </div>
            </Card>
          )}

          {/* Exercise List */}
          <div className="space-y-4">
            <h2 className="text-2xl font-display font-bold">All Exercises</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {exercises.map((exercise) => (
                <Card key={exercise.id} className="p-6 gradient-card shadow-soft hover:shadow-medium transition-smooth">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-full bg-purple-light">
                      <Wind className="w-6 h-6 text-primary" />
                    </div>
                    <Badge className={getDifficultyColor(exercise.difficulty)}>
                      {exercise.difficulty}
                    </Badge>
                  </div>
                  <h3 className="text-xl font-display font-bold mb-2">{exercise.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {exercise.instructions[0]}
                  </p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm">
                      <Clock className="w-4 h-4 mr-2 text-primary" />
                      <span>{formatDuration(exercise.duration)} • {exercise.cycles} cycles</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <strong>Benefits:</strong> {exercise.benefits.slice(0, 2).join(', ')}
                    </p>
                  </div>
                  <Button 
                    onClick={() => startExercise(exercise)}
                    className="w-full rounded-full bg-primary hover:bg-primary/90"
                  >
                    <Play className="mr-2 w-4 h-4" />
                    Start
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Breathing;
