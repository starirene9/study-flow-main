import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, LogIn, UserPlus, LogOut, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ThemeToggle from "@/components/ThemeToggle";
import { supabase } from "@/lib/supabase";

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const { user, signIn, signUp, signOut, isAuthLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState<string>("");

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
      setConfirmPassword("");
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
        navigate("/");
      } else {
        // 비밀번호 일치 검사
        if (password !== confirmPassword) {
          setError("Passwords do not match. Please try again.");
          setIsSubmitting(false);
          return;
        }

        // Sign up and check if email verification is needed
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (error) {
          throw error;
        }
        
        // If session is null, email verification is required
        if (!data.session) {
          setVerificationEmail(email);
          setShowEmailVerification(true);
          setEmail("");
          setPassword("");
          setConfirmPassword("");
        } else {
          // If session exists, user is automatically logged in
          navigate("/");
        }
      }
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

  // 이메일 인증 안내 페이지
  if (showEmailVerification) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md glass-card rounded-2xl p-6 sm:p-8 space-y-5 sm:space-y-6 animate-scale-in relative">
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
          <ThemeToggle />
        </div>
        <div className="text-center space-y-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary-soft mx-auto flex items-center justify-center">
            <Mail className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-bold">Check your email</h1>
              <p className="text-sm text-muted-foreground">
                We've sent a verification link to
              </p>
              <p className="text-sm font-medium text-primary">{verificationEmail}</p>
            </div>
            <div className="space-y-4 pt-4">
              <div className="bg-muted rounded-lg p-4 space-y-3 text-left">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Next steps:</p>
                    <ol className="text-xs text-muted-foreground mt-1 space-y-1 list-decimal list-inside">
                      <li>Open your email inbox</li>
                      <li>Click the verification link in the email</li>
                      <li>Return here and sign in</li>
                    </ol>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Didn't receive the email? Check your spam folder or try signing up again.
              </p>
            </div>
            <div className="pt-4 space-y-3">
              <Button
                onClick={() => {
                  setShowEmailVerification(false);
                  setVerificationEmail("");
                  setMode("signin");
                }}
                className="w-full h-11 sm:h-12 text-sm font-semibold touch-manipulation"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Go to Sign In
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowEmailVerification(false);
                  setVerificationEmail("");
                  setMode("signup");
                }}
                className="w-full h-11 sm:h-12 text-sm touch-manipulation"
              >
                Try signing up again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-6 sm:py-8">
      <div className="w-full max-w-md glass-card rounded-2xl p-6 sm:p-8 space-y-5 sm:space-y-6 animate-scale-in relative">
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
          <ThemeToggle />
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-xl sm:text-2xl font-bold">StudyFlow Account</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Sign in or create an account to sync your sessions across devices.
          </p>
        </div>

        <Tabs
          defaultValue="signin"
          onValueChange={(value) => {
            setMode(value as "signin" | "signup");
            // 탭 전환 시 필드 초기화
            setPassword("");
            setConfirmPassword("");
            setError(null);
          }}
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
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              {error && (
                <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
                  {error}
                </p>
              )}
              <Button
                type="submit"
                disabled={isSubmitting || isAuthLoading}
                className="w-full h-11 sm:h-12 text-sm font-semibold flex items-center justify-center gap-2 touch-manipulation"
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
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                  Confirm Password
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-destructive">
                    Passwords do not match
                  </p>
                )}
                {confirmPassword && password === confirmPassword && password.length >= 6 && (
                  <p className="text-xs text-green-600 dark:text-green-400">
                    Passwords match
                  </p>
                )}
              </div>
              {error && (
                <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
                  {error}
                </p>
              )}
              <Button
                type="submit"
                disabled={isSubmitting || isAuthLoading || password !== confirmPassword || password.length < 6}
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


