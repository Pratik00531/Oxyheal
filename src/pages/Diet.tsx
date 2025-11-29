import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { MobileNav } from "@/components/MobileNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Apple, 
  Coffee, 
  Salad, 
  Pizza, 
  CheckCircle2, 
  XCircle, 
  Lightbulb, 
  ChefHat,
  Lock,
  ClipboardList,
  Loader2,
  ArrowRight
} from "lucide-react";
import { dietApi } from "@/lib/dietApi";
import { useToast } from "@/hooks/use-toast";
import type { DietPlan, DietEligibility } from "@/types/diet";
import oxyMascot from "@/assets/oxy-mascot.png";

const Diet = () => {
  const [eligibility, setEligibility] = useState<DietEligibility | null>(null);
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkEligibility();
  }, []);

  const checkEligibility = async () => {
    setLoading(true);
    const response = await dietApi.checkEligibility();
    
    if (response.data) {
      setEligibility(response.data);
      
      if (response.data.eligible) {
        // User has completed screening, fetch diet plan
        loadDietPlan();
      } else {
        setLoading(false);
      }
    } else {
      toast({
        title: "Error",
        description: response.error || "Failed to check eligibility",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const loadDietPlan = async () => {
    setGenerating(true);
    const response = await dietApi.getDietPlan();
    
    if (response.data) {
      setDietPlan(response.data);
      toast({
        title: "Diet Plan Ready!",
        description: "Your personalized meal plan has been generated",
      });
    } else {
      toast({
        title: "Error",
        description: response.error || "Failed to load diet plan",
        variant: "destructive",
      });
    }
    
    setGenerating(false);
    setLoading(false);
  };

  const getMealIcon = (mealType: string) => {
    switch (mealType.toLowerCase()) {
      case 'breakfast': return Coffee;
      case 'lunch': return Salad;
      case 'snack': return Apple;
      case 'dinner': return Pizza;
      default: return ChefHat;
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

  // Not eligible - show locked state
  if (!eligibility?.eligible) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <MobileNav />
        
        <main className="md:ml-20 p-6 md:p-8 pb-24 md:pb-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="space-y-2">
              <h1 className="text-4xl font-display font-bold">Diet & Nutrition</h1>
              <p className="text-muted-foreground text-lg">Your personalized meal plan for better lung health</p>
            </div>

            {/* Locked State Card */}
            <Card className="p-8 gradient-primary shadow-medium">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                  <div className="p-4 rounded-full bg-white/20 w-fit">
                    <Lock className="w-12 h-12" />
                  </div>
                  <h2 className="text-3xl font-display font-bold">Complete Screening First</h2>
                  <p className="text-lg">
                    To unlock your personalized diet plan, please complete the lung cancer screening assessment. 
                    We'll analyze your results and generate a custom meal plan tailored to your specific needs.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <p>Personalized 7-day meal plans</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <p>Foods tailored to your screening results</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <p>Lung-healthy nutrition guidance</p>
                    </div>
                  </div>
                  <Button 
                    size="lg"
                    onClick={() => navigate('/lung-cancer/new')}
                    className="rounded-full bg-white text-primary hover:bg-white/90 shadow-soft"
                  >
                    <ArrowRight className="mr-2 w-5 h-5" />
                    Start Screening
                  </Button>
                </div>
                <div className="flex justify-center">
                  <img src={oxyMascot} alt="Oxy" className="w-64 h-64 animate-float" />
                </div>
              </div>
            </Card>

            {/* General Tips (always visible) */}
            <Card className="p-6 gradient-card shadow-soft">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 rounded-full bg-purple-light">
                  <Apple className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-2xl font-display font-bold">General Lung-Healthy Foods</h2>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-purple-light/50">
                  <h4 className="font-semibold mb-2">Antioxidant Rich</h4>
                  <p className="text-sm text-muted-foreground">Berries, tomatoes, leafy greens, broccoli</p>
                </div>
                <div className="p-4 rounded-xl bg-purple-light/50">
                  <h4 className="font-semibold mb-2">Omega-3 Sources</h4>
                  <p className="text-sm text-muted-foreground">Walnuts, flaxseeds, chia seeds</p>
                </div>
                <div className="p-4 rounded-xl bg-purple-light/50">
                  <h4 className="font-semibold mb-2">Vitamin C</h4>
                  <p className="text-sm text-muted-foreground">Oranges, kiwi, peppers, amla</p>
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // Eligible and have diet plan
  if (!dietPlan) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <MobileNav />
        <main className="md:ml-20 p-6 md:p-8 pb-24 md:pb-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
              <p className="text-muted-foreground">Generating your personalized diet plan...</p>
            </div>
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
            <h1 className="text-4xl font-display font-bold">Diet & Nutrition</h1>
            <p className="text-muted-foreground text-lg">Your personalized meal plan for better lung health</p>
          </div>

          {/* Conditions Badge */}
          <Card className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-2 border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
              <div>
                <p className="font-semibold text-green-900 dark:text-green-100">Plan Generated For</p>
                <p className="text-sm text-green-700 dark:text-green-300 capitalize">{dietPlan.generated_for}</p>
              </div>
            </div>
          </Card>

          {/* Recommended & Avoid Foods Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Recommended Foods */}
            <Card className="p-6 gradient-card shadow-soft">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
                  <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-xl font-display font-bold">Recommended Foods</h2>
              </div>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {dietPlan.recommended_foods.map((food, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
                    <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{food}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Foods to Avoid */}
            <Card className="p-6 gradient-card shadow-soft">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/30">
                  <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-xl font-display font-bold">Foods to Avoid</h2>
              </div>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {dietPlan.foods_to_avoid.map((food, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{food}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Health Tips */}
          <Card className="p-6 gradient-card shadow-soft">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                <Lightbulb className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h2 className="text-xl font-display font-bold">Health Tips</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              {dietPlan.health_tips.map((tip, idx) => (
                <div key={idx} className="flex items-start gap-2 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                  <Lightbulb className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{tip}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Weekly Meal Plan */}
          <div className="space-y-4">
            <h2 className="text-2xl font-display font-bold">7-Day Meal Plan</h2>
            {dietPlan.week_plan.map((dayPlan, index) => {
              const meals = [
                { type: 'breakfast', data: dayPlan.breakfast },
                { type: 'lunch', data: dayPlan.lunch },
                { type: 'snack', data: dayPlan.snack },
                { type: 'dinner', data: dayPlan.dinner },
              ];

              return (
                <Card key={index} className="p-6 gradient-card shadow-soft hover:shadow-medium transition-smooth">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-display font-bold text-primary">{dayPlan.day}</h3>
                      <p className="text-sm text-muted-foreground">Complete nutrition guide for the day</p>
                    </div>
                    <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                      Day {index + 1}
                    </Badge>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    {meals.map(({ type, data }, mealIndex) => {
                      const Icon = getMealIcon(type);
                      return (
                        <div key={mealIndex} className="p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="p-2 rounded-full bg-purple-light">
                              <Icon className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-muted-foreground capitalize">{type}</p>
                              <p className="font-semibold">{data.name}</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <p className="text-xs text-muted-foreground">⏰ {data.time}</p>
                            <ul className="space-y-1">
                              {data.items.map((item, i) => (
                                <li key={i} className="text-sm flex items-start gap-1">
                                  <span className="text-primary">•</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                            <p className="text-xs text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-2 rounded">
                              💡 {data.benefits}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Diet;
