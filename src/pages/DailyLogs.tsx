import { Navigation } from "@/components/Navigation";
import { MobileNav } from "@/components/MobileNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Smile, 
  Meh, 
  Frown, 
  Wind, 
  Droplets, 
  Footprints, 
  Zap,
  Moon,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Award,
  Activity,
  Loader2,
  CheckCircle2
} from "lucide-react";
import { useEffect, useState } from "react";
import { dailyLogsApi } from "@/lib/dailyLogsApi";
import { useToast } from "@/hooks/use-toast";
import type { DailyLog, DailyLogCreate, DailyLogStats } from "@/types/dailyLogs";

const DailyLogs = () => {
  const [mood, setMood] = useState<'great' | 'okay' | 'not_good'>('okay');
  const [breathingQuality, setBreathingQuality] = useState([7]);
  const [coughFrequency, setCoughFrequency] = useState([3]);
  const [waterIntake, setWaterIntake] = useState([6]);
  const [steps, setSteps] = useState([8000]);
  const [energyLevel, setEnergyLevel] = useState([7]);
  const [sleepQuality, setSleepQuality] = useState([7]);
  const [notes, setNotes] = useState("");
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [todayLog, setTodayLog] = useState<DailyLog | null>(null);
  const [stats, setStats] = useState<DailyLogStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const symptomOptions = [
    'Cough',
    'Breathlessness',
    'Fatigue',
    'Chest Pain',
    'Wheezing',
    'Mucus',
    'Headache',
    'Dizziness'
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    
    // Load today's log
    const todayResponse = await dailyLogsApi.getTodayLog();
    if (todayResponse.data) {
      setTodayLog(todayResponse.data);
      loadExistingLog(todayResponse.data);
    }
    
    // Load stats
    const statsResponse = await dailyLogsApi.getStats();
    if (statsResponse.data) {
      setStats(statsResponse.data);
    }
    
    setLoading(false);
  };

  const loadExistingLog = (log: DailyLog) => {
    setMood(log.mood);
    setBreathingQuality([log.breathing_quality]);
    setCoughFrequency([log.cough_frequency]);
    setWaterIntake([log.water_intake]);
    setSteps([log.steps]);
    setEnergyLevel([log.energy_level]);
    setSleepQuality([log.sleep_quality]);
    setNotes(log.notes || "");
    setSymptoms(log.symptoms || []);
  };

  const handleSave = async () => {
    setSaving(true);

    const logData: DailyLogCreate = {
      mood,
      breathing_quality: breathingQuality[0],
      cough_frequency: coughFrequency[0],
      water_intake: waterIntake[0],
      steps: steps[0],
      energy_level: energyLevel[0],
      sleep_quality: sleepQuality[0],
      symptoms,
      medications_taken: [],
      notes: notes || undefined,
    };

    const response = await dailyLogsApi.saveLog(logData);

    if (response.data) {
      toast({
        title: "Log Saved!",
        description: "Your daily health metrics have been recorded.",
      });
      // Reload data to update stats
      await loadData();
    } else {
      toast({
        title: "Save Failed",
        description: response.error || "Could not save log",
        variant: "destructive",
      });
    }

    setSaving(false);
  };

  const toggleSymptom = (symptom: string) => {
    setSymptoms(prev => 
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'declining': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <Minus className="w-4 h-4 text-gray-600" />;
    }
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <MobileNav />
      
      <main className="md:ml-20 p-6 md:p-8 pb-24 md:pb-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-display font-bold">Daily Logs</h1>
            <p className="text-muted-foreground text-lg">Track your daily wellness metrics</p>
          </div>

          {/* Stats Overview */}
          {stats && stats.total_logs > 0 && (
            <div className="grid md:grid-cols-4 gap-4">
              <Card className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-2 border-purple-200 dark:border-purple-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Streak</p>
                    <p className="text-2xl font-bold text-primary">{stats.current_streak}</p>
                  </div>
                  <Award className="w-8 h-8 text-primary" />
                </div>
              </Card>

              <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Breathing</p>
                    <p className="text-2xl font-bold text-green-600">{stats.avg_breathing_quality}/10</p>
                  </div>
                  <Wind className="w-8 h-8 text-green-600" />
                </div>
              </Card>

              <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-2 border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Water</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.avg_water_intake}</p>
                  </div>
                  <Droplets className="w-8 h-8 text-blue-600" />
                </div>
              </Card>

              <Card className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-2 border-orange-200 dark:border-orange-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Steps</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.avg_steps.toLocaleString()}</p>
                  </div>
                  <Footprints className="w-8 h-8 text-orange-600" />
                </div>
              </Card>
            </div>
          )}

          {/* Today's Status */}
          {todayLog && (
            <Card className="p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-semibold text-green-900 dark:text-green-100">Today's Log Already Saved</p>
                  <p className="text-sm text-green-700 dark:text-green-300">You can update your metrics below</p>
                </div>
              </div>
            </Card>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Mood Tracker */}
              <Card className="p-6 gradient-card shadow-soft">
                <h3 className="text-xl font-display font-bold mb-6">How are you feeling today?</h3>
                <div className="grid grid-cols-3 gap-4">
                  <button 
                    onClick={() => setMood('great')}
                    className={`p-6 rounded-2xl transition-smooth text-center ${
                      mood === 'great' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-purple-light hover:bg-primary/20'
                    }`}
                  >
                    <Smile className="w-12 h-12 mx-auto mb-2" />
                    <p className="font-medium">Great</p>
                  </button>
                  <button 
                    onClick={() => setMood('okay')}
                    className={`p-6 rounded-2xl transition-smooth text-center ${
                      mood === 'okay' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-purple-light hover:bg-primary/20'
                    }`}
                  >
                    <Meh className="w-12 h-12 mx-auto mb-2" />
                    <p className="font-medium">Okay</p>
                  </button>
                  <button 
                    onClick={() => setMood('not_good')}
                    className={`p-6 rounded-2xl transition-smooth text-center ${
                      mood === 'not_good' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-purple-light hover:bg-primary/20'
                    }`}
                  >
                    <Frown className="w-12 h-12 mx-auto mb-2" />
                    <p className="font-medium">Not Good</p>
                  </button>
                </div>
              </Card>

              {/* Breathing Quality */}
              <Card className="p-6 gradient-card shadow-soft">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-3 rounded-full bg-purple-light">
                    <Wind className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-display font-bold">Breathing Quality</h3>
                    <p className="text-sm text-muted-foreground">Rate your breathing today (1-10)</p>
                  </div>
                  {stats && getTrendIcon(stats.recent_trends.breathing_trend)}
                </div>
                <div className="space-y-4">
                  <Slider
                    value={breathingQuality}
                    onValueChange={setBreathingQuality}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="text-center">
                    <span className="text-3xl font-bold font-display text-primary">{breathingQuality[0]}</span>
                    <span className="text-muted-foreground">/10</span>
                  </div>
                </div>
              </Card>

              {/* Cough Frequency */}
              <Card className="p-6 gradient-card shadow-soft">
                <h3 className="text-xl font-display font-bold mb-4">Cough Episodes Today</h3>
                <div className="space-y-4">
                  <Slider
                    value={coughFrequency}
                    onValueChange={setCoughFrequency}
                    max={20}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                  <div className="text-center">
                    <span className="text-3xl font-bold font-display text-primary">{coughFrequency[0]}</span>
                    <span className="text-muted-foreground"> times</span>
                  </div>
                </div>
              </Card>

              {/* Water Intake */}
              <Card className="p-6 gradient-card shadow-soft">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-3 rounded-full bg-purple-light">
                    <Droplets className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-bold">Water Intake</h3>
                    <p className="text-sm text-muted-foreground">Glasses of water today</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <Slider
                    value={waterIntake}
                    onValueChange={setWaterIntake}
                    max={12}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                  <div className="text-center">
                    <span className="text-3xl font-bold font-display text-primary">{waterIntake[0]}</span>
                    <span className="text-muted-foreground"> glasses</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Steps */}
              <Card className="p-6 gradient-card shadow-soft">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-3 rounded-full bg-purple-light">
                    <Footprints className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-bold">Steps Today</h3>
                    <p className="text-sm text-muted-foreground">Track your daily movement</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <Slider
                    value={steps}
                    onValueChange={setSteps}
                    max={15000}
                    min={0}
                    step={100}
                    className="w-full"
                  />
                  <div className="text-center">
                    <span className="text-3xl font-bold font-display text-primary">{steps[0].toLocaleString()}</span>
                    <span className="text-muted-foreground"> steps</span>
                  </div>
                </div>
              </Card>

              {/* Energy Level */}
              <Card className="p-6 gradient-card shadow-soft">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-3 rounded-full bg-purple-light">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-bold">Energy Level</h3>
                    <p className="text-sm text-muted-foreground">How energetic do you feel? (1-10)</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <Slider
                    value={energyLevel}
                    onValueChange={setEnergyLevel}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="text-center">
                    <span className="text-3xl font-bold font-display text-primary">{energyLevel[0]}</span>
                    <span className="text-muted-foreground">/10</span>
                  </div>
                </div>
              </Card>

              {/* Sleep Quality */}
              <Card className="p-6 gradient-card shadow-soft">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-3 rounded-full bg-purple-light">
                    <Moon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-bold">Sleep Quality</h3>
                    <p className="text-sm text-muted-foreground">Last night's sleep (1-10)</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <Slider
                    value={sleepQuality}
                    onValueChange={setSleepQuality}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="text-center">
                    <span className="text-3xl font-bold font-display text-primary">{sleepQuality[0]}</span>
                    <span className="text-muted-foreground">/10</span>
                  </div>
                </div>
              </Card>

              {/* Symptoms */}
              <Card className="p-6 gradient-card shadow-soft">
                <h3 className="text-xl font-display font-bold mb-4">Symptoms Experienced</h3>
                <div className="flex flex-wrap gap-2">
                  {symptomOptions.map(symptom => (
                    <Badge
                      key={symptom}
                      onClick={() => toggleSymptom(symptom)}
                      className={`cursor-pointer transition-colors ${
                        symptoms.includes(symptom)
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                          : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200'
                      }`}
                    >
                      {symptom}
                    </Badge>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          {/* Notes */}
          <Card className="p-6 gradient-card shadow-soft">
            <h3 className="text-xl font-display font-bold mb-4">Additional Notes</h3>
            <Textarea
              placeholder="Any additional observations about your health today..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px]"
            />
          </Card>

          {/* Save Button */}
          <Button 
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-full bg-primary hover:bg-primary/90 shadow-soft" 
            size="lg"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 w-5 h-5" />
                Save Today's Log
              </>
            )}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default DailyLogs;
