import { Navigation } from "@/components/Navigation";
import { MobileNav } from "@/components/MobileNav";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";

const History = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <MobileNav />
      
      <main className="md:ml-20 p-6 md:p-8 pb-24 md:pb-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-display font-bold">Health History</h1>
            <p className="text-muted-foreground text-lg">View your wellness journey over time</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Calendar */}
            <Card className="p-6 gradient-card shadow-soft lg:col-span-1">
              <h2 className="text-xl font-display font-bold mb-4">Activity Calendar</h2>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md"
              />
            </Card>

            {/* Stats */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6 gradient-card shadow-soft">
                <h2 className="text-xl font-display font-bold mb-6">Monthly Overview</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-purple-light/50">
                    <p className="text-sm text-muted-foreground mb-1">Avg Breathing Score</p>
                    <p className="text-2xl font-bold font-display text-primary">82/100</p>
                  </div>
                  <div className="p-4 rounded-xl bg-purple-light/50">
                    <p className="text-sm text-muted-foreground mb-1">Total Exercises</p>
                    <p className="text-2xl font-bold font-display text-primary">24</p>
                  </div>
                  <div className="p-4 rounded-xl bg-purple-light/50">
                    <p className="text-sm text-muted-foreground mb-1">Water Intake Avg</p>
                    <p className="text-2xl font-bold font-display text-primary">7 glasses</p>
                  </div>
                  <div className="p-4 rounded-xl bg-purple-light/50">
                    <p className="text-sm text-muted-foreground mb-1">Daily Steps Avg</p>
                    <p className="text-2xl font-bold font-display text-primary">8,245</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 gradient-card shadow-soft">
                <h2 className="text-xl font-display font-bold mb-4">Recent Activity</h2>
                <div className="space-y-3">
                  {[
                    { date: "Today", activity: "Completed Deep Breathing exercise", time: "2 hours ago" },
                    { date: "Yesterday", activity: "Logged daily metrics", time: "1 day ago" },
                    { date: "2 days ago", activity: "Uploaded chest X-ray report", time: "2 days ago" },
                    { date: "3 days ago", activity: "Completed Box Breathing exercise", time: "3 days ago" },
                  ].map((item, index) => (
                    <div key={index} className="flex items-start space-x-4 p-4 rounded-xl bg-purple-light/50">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className="font-medium">{item.activity}</p>
                          <span className="text-xs text-muted-foreground">{item.time}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default History;
