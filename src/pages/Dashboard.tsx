import { Navigation } from "@/components/Navigation";
import { MobileNav } from "@/components/MobileNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  Droplets, 
  Wind, 
  Footprints,
  ClipboardList,
  Apple,
  Moon,
  Zap,
  TrendingUp,
  Award,
  Calendar,
  ArrowRight,
  Loader2,
  Plus
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { dailyLogsApi } from "@/lib/dailyLogsApi";
import { breathingApi } from "@/lib/breathingApi";
import { dietApi } from "@/lib/dietApi";
import { lungCancerApi } from "@/lib/lungCancerApi";
import type { DailyLog, DailyLogStats } from "@/types/dailyLogs";
import oxyMascot from "@/assets/oxy-mascot.png";

const Dashboard = () => {
  const [userName, setUserName] = useState<string>('');
  const [todayLog, setTodayLog] = useState<DailyLog | null>(null);
  const [logStats, setLogStats] = useState<DailyLogStats | null>(null);
  const [breathingStats, setBreathingStats] = useState<any>(null);
  const [hasDietPlan, setHasDietPlan] = useState(false);
  const [hasAssessment, setHasAssessment] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);

    // Load user data
    const userResult = await api.getCurrentUser();
    if (userResult.data) {
      setUserName(userResult.data.name || 'User');
    }

    // Load today's log
    const logResult = await dailyLogsApi.getTodayLog();
    if (logResult.data) {
      setTodayLog(logResult.data);
    }

    // Load log stats
    const statsResult = await dailyLogsApi.getStats();
    if (statsResult.data) {
      setLogStats(statsResult.data);
    }

    // Load breathing stats
    const breathingResult = await breathingApi.getStats();
    if (breathingResult.data) {
      setBreathingStats(breathingResult.data);
    }

    // Check diet eligibility
    const dietResult = await dietApi.checkEligibility();
    if (dietResult.data) {
      setHasDietPlan(dietResult.data.eligible);
    }

    // Check if has assessment
    const assessmentResult = await lungCancerApi.getAssessments();
    if (assessmentResult.data && assessmentResult.data.length > 0) {
      setHasAssessment(true);
    }

    setLoading(false);
  };

  const getMoodEmoji = (mood: string) => {
    switch (mood) {
      case 'great': return '😊';
      case 'okay': return '😐';
      case 'not_good': return '😟';
      default: return '😐';
    }
  };

  const calculateOverallScore = () => {
    if (!todayLog) return 0;
    
    // Calculate based on today's metrics
    const breathingScore = (todayLog.breathing_quality / 10) * 25;
    const energyScore = (todayLog.energy_level / 10) * 25;
    const sleepScore = (todayLog.sleep_quality / 10) * 25;
    const waterScore = Math.min((todayLog.water_intake / 8) * 25, 25); // 8 glasses target
    
    return Math.round(breathingScore + energyScore + sleepScore + waterScore);
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

  const overallScore = calculateOverallScore();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <MobileNav />
      
      <main className="md:ml-20 p-6 md:p-8 pb-24 md:pb-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-4xl font-display font-bold">
              Welcome {userName}!
            </h1>
            <p className="text-muted-foreground text-lg">Here's your wellness overview for today</p>
          </div>

          {/* Main Overview Card */}
          <Card className="p-8 gradient-primary shadow-medium">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-display font-bold mb-2">
                    {todayLog ? 'Today\'s Health Score' : 'Start Your Day'}
                  </h2>
                  {todayLog ? (
                    <p className="text-lg opacity-90">
                      Great progress! You're at {overallScore}% today {getMoodEmoji(todayLog.mood)}
                    </p>
                  ) : (
                    <p className="text-lg opacity-90">
                      Log your daily metrics to track your wellness journey
                    </p>
                  )}
                </div>

                {todayLog ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Breathing Quality</span>
                        <span className="font-semibold">{todayLog.breathing_quality}/10</span>
                      </div>
                      <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-white rounded-full transition-all"
                          style={{ width: `${(todayLog.breathing_quality / 10) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Energy Level</span>
                        <span className="font-semibold">{todayLog.energy_level}/10</span>
                      </div>
                      <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-white rounded-full transition-all"
                          style={{ width: `${(todayLog.energy_level / 10) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <Button 
                      onClick={() => navigate('/daily-logs')}
                      className="w-full bg-white text-primary hover:bg-white/90"
                      size="lg"
                    >
                      Update Today's Log
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </div>
                ) : (
                  <Button 
                    onClick={() => navigate('/daily-logs')}
                    className="w-full bg-white text-primary hover:bg-white/90"
                    size="lg"
                  >
                    <Plus className="mr-2 w-5 h-5" />
                    Log Today's Metrics
                  </Button>
                )}
              </div>

              <div className="flex justify-center">
                <img src={oxyMascot} alt="Oxy Mascot" className="w-64 h-64 animate-float" />
              </div>
            </div>
          </Card>

          {/* Today's Metrics */}
          {todayLog && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4 gradient-card shadow-soft">
                <div className="flex items-center justify-between mb-2">
                  <Wind className="w-5 h-5 text-primary" />
                  <Badge variant="outline" className="text-xs">
                    {todayLog.breathing_quality >= 7 ? 'Good' : todayLog.breathing_quality >= 5 ? 'Fair' : 'Low'}
                  </Badge>
                </div>
                <p className="text-2xl font-bold">{todayLog.breathing_quality}/10</p>
                <p className="text-xs text-muted-foreground">Breathing</p>
              </Card>

              <Card className="p-4 gradient-card shadow-soft">
                <div className="flex items-center justify-between mb-2">
                  <Droplets className="w-5 h-5 text-blue-600" />
                  <Badge variant="outline" className="text-xs">
                    {todayLog.water_intake >= 8 ? 'Great' : todayLog.water_intake >= 6 ? 'Good' : 'Low'}
                  </Badge>
                </div>
                <p className="text-2xl font-bold">{todayLog.water_intake}</p>
                <p className="text-xs text-muted-foreground">Glasses</p>
              </Card>

              <Card className="p-4 gradient-card shadow-soft">
                <div className="flex items-center justify-between mb-2">
                  <Footprints className="w-5 h-5 text-orange-600" />
                  <Badge variant="outline" className="text-xs">
                    {todayLog.steps >= 10000 ? 'Excellent' : todayLog.steps >= 5000 ? 'Good' : 'Low'}
                  </Badge>
                </div>
                <p className="text-2xl font-bold">{todayLog.steps.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Steps</p>
              </Card>

              <Card className="p-4 gradient-card shadow-soft">
                <div className="flex items-center justify-between mb-2">
                  <Moon className="w-5 h-5 text-purple-600" />
                  <Badge variant="outline" className="text-xs">
                    {todayLog.sleep_quality >= 7 ? 'Good' : todayLog.sleep_quality >= 5 ? 'Fair' : 'Poor'}
                  </Badge>
                </div>
                <p className="text-2xl font-bold">{todayLog.sleep_quality}/10</p>
                <p className="text-xs text-muted-foreground">Sleep</p>
              </Card>
            </div>
          )}

          {/* Stats Overview */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Logging Stats */}
            {logStats && logStats.total_logs > 0 && (
              <Card className="p-6 gradient-card shadow-soft">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-full bg-purple-light">
                    <Award className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg">Logging Streak</h3>
                    <p className="text-sm text-muted-foreground">Keep it up!</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Current Streak</span>
                    <span className="text-2xl font-bold text-primary">{logStats.current_streak} days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Logs</span>
                    <span className="font-semibold">{logStats.total_logs}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Most Common Mood</span>
                    <span className="font-semibold capitalize">{logStats.most_common_mood}</span>
                  </div>
                </div>
              </Card>
            )}

            {/* Breathing Exercises */}
            {breathingStats && (
              <Card className="p-6 gradient-card shadow-soft">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-full bg-purple-light">
                    <Wind className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg">Breathing Practice</h3>
                    <p className="text-sm text-muted-foreground">Your progress</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Sessions</span>
                    <span className="text-2xl font-bold text-primary">{breathingStats.total_sessions}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Duration</span>
                    <span className="font-semibold">{Math.round(breathingStats.total_duration / 60)} min</span>
                  </div>
                  {breathingStats.favorite_exercise && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground">Favorite</p>
                      <p className="text-sm font-semibold">{breathingStats.favorite_exercise}</p>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Quick Actions */}
            <Card className="p-6 gradient-card shadow-soft">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-full bg-purple-light">
                  <Activity className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg">Quick Actions</h3>
                  <p className="text-sm text-muted-foreground">What you can do</p>
                </div>
              </div>
              <div className="space-y-2">
                <Button 
                  onClick={() => navigate('/breathing')}
                  variant="outline" 
                  className="w-full justify-start"
                >
                  <Wind className="mr-2 w-4 h-4" />
                  Practice Breathing
                </Button>
                <Button 
                  onClick={() => navigate('/diet')}
                  variant="outline" 
                  className="w-full justify-start"
                  disabled={!hasDietPlan}
                >
                  <Apple className="mr-2 w-4 h-4" />
                  View Diet Plan
                </Button>
                <Button 
                  onClick={() => navigate('/lung-cancer/new')}
                  variant="outline" 
                  className="w-full justify-start"
                >
                  <ClipboardList className="mr-2 w-4 h-4" />
                  {hasAssessment ? 'View Assessment' : 'Take Assessment'}
                </Button>
              </div>
            </Card>
          </div>

          {/* Health Tips */}
          <Card className="p-6 gradient-card shadow-soft">
            <h3 className="text-xl font-display font-bold mb-4">Today's Wellness Tips</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-start space-x-3 p-4 rounded-xl bg-purple-light/50">
                <Wind className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold mb-1">Breathing Exercise</p>
                  <p className="text-sm text-muted-foreground">
                    Practice 4-7-8 breathing for 5 minutes to improve oxygen flow
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-4 rounded-xl bg-purple-light/50">
                <Droplets className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold mb-1">Stay Hydrated</p>
                  <p className="text-sm text-muted-foreground">
                    Drink 8-10 glasses of water daily to maintain lung health
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-4 rounded-xl bg-purple-light/50">
                <Footprints className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold mb-1">Daily Movement</p>
                  <p className="text-sm text-muted-foreground">
                    Take a 15-minute walk to boost lung capacity and circulation
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
