import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, LogIn, UserPlus, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ThemeToggle from "@/components/ThemeToggle";

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const { user, signIn, signUp, signOut, isAuthLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // 로그인된 상태면 메인으로 리다이렉트
  useEffect(() => {
    if (user && !isAuthLoading) {
      navigate("/");
    }
  }, [user, isAuthLoading, navigate]);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    setError(null);
    try {
      await signOut();
      // 로그아웃 후 폼 초기화
      setEmail("");
      setPassword("");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to sign out. Please try again.";
      setError(message);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      if (mode === "signin") {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
      navigate("/");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Authentication failed. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 로그인 중이면 로딩 표시
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md glass-card rounded-2xl p-8 space-y-6 animate-scale-in relative">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">StudyFlow Account</h1>
          <p className="text-sm text-muted-foreground">
            Sign in or create an account to sync your sessions across devices.
          </p>
        </div>

        <Tabs
          defaultValue="signin"
          onValueChange={(value) => setMode(value as "signin" | "signup")}
        >
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  Email
                </label>
                <Input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                  Password
                </label>
                <Input
                  type="password"
                  required
                  minLength={6}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              {error && (
                <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
                  {error}
                </p>
              )}
              <Button
                type="submit"
                disabled={isSubmitting || isAuthLoading}
                className="w-full h-11 text-sm font-semibold flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                {isSubmitting ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  Email
                </label>
                <Input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                  Password
                </label>
                <Input
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                />
              </div>
              {error && (
                <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
                  {error}
                </p>
              )}
              <Button
                type="submit"
                disabled={isSubmitting || isAuthLoading}
                className="w-full h-11 text-sm font-semibold flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                {isSubmitting ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <p className="text-xs text-muted-foreground text-center">
          Your data is stored securely in Supabase. You can log in from any device to continue your
          StudyFlow sessions.
        </p>

        {/* 로그인된 상태일 때 로그아웃 버튼 표시 (일반적으로는 표시되지 않지만, 혹시 모를 경우를 대비) */}
        {user && (
          <div className="pt-4 border-t border-border">
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground text-center">
                Signed in as <span className="font-medium text-foreground">{user.email}</span>
              </p>
              <Button
                onClick={handleSignOut}
                disabled={isLoggingOut}
                variant="outline"
                className="w-full h-11 text-sm font-semibold flex items-center justify-center gap-2 border-destructive/50 text-destructive hover:bg-destructive/10 hover:border-destructive"
              >
                <LogOut className="w-4 h-4" />
                {isLoggingOut ? "Signing out..." : "Sign Out"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;


