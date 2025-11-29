import { NavLink } from "@/components/NavLink";
import { Home, Calendar, Utensils, Wind, User } from "lucide-react";

export const MobileNav = () => {
  const navItems = [
    { to: "/dashboard", icon: Home, label: "Home" },
    { to: "/daily-logs", icon: Calendar, label: "Logs" },
    { to: "/diet", icon: Utensils, label: "Diet" },
    { to: "/breathing", icon: Wind, label: "Breathe" },
    { to: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card shadow-medium z-50 md:hidden">
      <div className="flex justify-around items-center py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className="flex flex-col items-center p-2 rounded-xl hover:bg-purple-light transition-smooth"
            activeClassName="bg-primary text-primary-foreground"
          >
            <item.icon className="w-5 h-5 mb-1" />
            <span className="text-xs">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
