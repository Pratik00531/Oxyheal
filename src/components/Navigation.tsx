import { NavLink } from "@/components/NavLink";
import { Home, Calendar, Utensils, Wind, Upload, History, User } from "lucide-react";
import oxyMascot from "@/assets/oxy-mascot.png";

export const Navigation = () => {
  const navItems = [
    { to: "/dashboard", icon: Home, label: "Dashboard" },
    { to: "/daily-logs", icon: Calendar, label: "Daily Logs" },
    { to: "/diet", icon: Utensils, label: "Diet" },
    { to: "/breathing", icon: Wind, label: "Breathing" },
    { to: "/report", icon: Upload, label: "Reports" },
    { to: "/history", icon: History, label: "History" },
    { to: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed left-0 top-0 h-screen w-20 bg-card shadow-medium z-50 hidden md:flex flex-col items-center py-6 space-y-6">
      <div className="mb-4">
        <img src={oxyMascot} alt="OxyHeal" className="w-12 h-12" />
      </div>
      <div className="flex-1 flex flex-col space-y-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className="p-3 rounded-xl hover:bg-purple-light transition-smooth group"
            activeClassName="bg-primary text-primary-foreground"
          >
            <item.icon className="w-6 h-6" />
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
