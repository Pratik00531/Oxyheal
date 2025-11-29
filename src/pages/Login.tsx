import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import oxyMascot from "@/assets/oxy-mascot.png";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await api.login(email, password);
    
    if (result.error) {
      toast({
        title: "Login Failed",
        description: result.error,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    toast({
      title: "Welcome back!",
      description: "You've successfully logged in.",
    });

    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-light via-background to-accent flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 gradient-card shadow-medium">
        <div className="text-center mb-8">
          <img src={oxyMascot} alt="Oxy" className="w-20 h-20 mx-auto mb-4" />
          <h1 className="text-3xl font-display font-bold text-primary mb-2">Welcome Back!</h1>
          <p className="text-muted-foreground">Log in to continue your wellness journey</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              className="rounded-xl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="rounded-xl"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button 
            type="submit"
            className="w-full rounded-full bg-primary hover:bg-primary/90 shadow-soft"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Log In"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary hover:underline font-medium">
              Sign Up
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Login;
