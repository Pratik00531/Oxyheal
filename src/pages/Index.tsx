import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Heart, Activity, TrendingUp } from "lucide-react";
import oxyMascot from "@/assets/oxy-mascot.png";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-light via-background to-accent">
      {/* Floating bubbles decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple/20 rounded-full blur-3xl animate-pulse-soft"></div>
        <div className="absolute top-40 right-20 w-40 h-40 bg-secondary/30 rounded-full blur-3xl animate-pulse-soft delay-1000"></div>
        <div className="absolute bottom-32 left-1/3 w-36 h-36 bg-primary/10 rounded-full blur-3xl animate-pulse-soft delay-2000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <img src={oxyMascot} alt="Oxy" className="w-12 h-12" />
          <span className="text-2xl font-display font-bold text-primary">OxyHeal</span>
        </div>
        <div className="space-x-4">
          <Link to="/login">
            <Button variant="ghost" className="rounded-full">
              Log In
            </Button>
          </Link>
          <Link to="/signup">
            <Button className="rounded-full bg-primary hover:bg-primary/90 shadow-soft">
              Sign Up
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <div className="inline-block px-4 py-2 bg-purple-light rounded-full text-sm font-medium text-primary">
                Your Personal Lung Wellness Companion
              </div>
              <h1 className="text-5xl md:text-6xl font-display font-bold leading-tight">
                Breathe Better,
                <br />
                <span className="text-primary">Live Better</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Track your lung health, monitor breathing patterns, and get personalized insights
                to improve your respiratory wellness every day.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/signup">
                  <Button size="lg" className="rounded-full bg-primary hover:bg-primary/90 shadow-medium group">
                    Get Started
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="rounded-full">
                    Learn More
                  </Button>
                </Link>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-4 pt-8">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 bg-purple-light rounded-full flex items-center justify-center">
                    <Heart className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-sm font-medium">Daily Tracking</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 bg-purple-light rounded-full flex items-center justify-center">
                    <Activity className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-sm font-medium">Smart Insights</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 bg-purple-light rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-sm font-medium">Progress Reports</p>
                </div>
              </div>
            </div>

            {/* Right Content - Mascot */}
            <div className="flex justify-center items-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-3xl"></div>
                <img
                  src={oxyMascot}
                  alt="Oxy Mascot"
                  className="relative w-96 h-96 object-contain animate-float drop-shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
