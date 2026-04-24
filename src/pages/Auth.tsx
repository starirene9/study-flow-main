import React, { useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, Lock, LogIn, Mail, UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import LanguageToggle from "@/components/LanguageToggle";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";

const Auth: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, signIn, signUp, requestPasswordReset, updatePassword, isAuthLoading } =
    useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState<string>("");
  const [showResetRequest, setShowResetRequest] = useState(false);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [resetEmail, setResetEmail] = useState("");

  const canSubmitPassword = useMemo(
    () => password.length >= 6 && password === confirmPassword,
    [password, confirmPassword],
  );

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.replace("#", ""));
    setIsRecoveryMode(hashParams.get("type") === "recovery");
  }, []);

  useEffect(() => {
    if (user && !isAuthLoading && !isRecoveryMode) {
      navigate("/");
    }
  }, [user, isAuthLoading, isRecoveryMode, navigate]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);
    try {
      if (isRecoveryMode) {
        if (!canSubmitPassword) {
          setError(t("auth.passwordsNotMatch"));
          return;
        }
        await updatePassword(password);
        setSuccessMessage(t("auth.passwordUpdated"));
        setPassword("");
        setConfirmPassword("");
        setIsRecoveryMode(false);
        window.history.replaceState({}, document.title, "/auth");
        return;
      }

      if (showResetRequest) {
        await requestPasswordReset(resetEmail);
        setSuccessMessage(t("auth.resetSent", { email: resetEmail }));
        return;
      }

      if (mode === "signin") {
        await signIn(email, password);
        navigate("/");
        return;
      }

      if (!canSubmitPassword) {
        setError(t("auth.passwordsNotMatch"));
        return;
      }

      const { needsEmailVerification } = await signUp(email, password);
      if (needsEmailVerification) {
        setVerificationEmail(email);
        setShowEmailVerification(true);
        setEmail("");
        setPassword("");
        setConfirmPassword("");
      } else {
        navigate("/");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : t("auth.authenticationFailed");
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
      </div>
    );
  }

  if (showEmailVerification) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-6 sm:py-8">
        <div className="w-full max-w-md glass-card rounded-2xl p-6 sm:p-8 space-y-5 sm:space-y-6 animate-scale-in relative">
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-xl sm:text-2xl font-bold">{t("auth.emailVerification")}</h1>
            <p className="text-sm text-muted-foreground">
              {t("auth.verificationSent", { email: verificationEmail })}
            </p>
            <p className="text-sm">{t("auth.checkEmail")}</p>
          </div>
          <Button
            className="w-full h-11 sm:h-12 text-sm font-semibold"
            onClick={() => {
              setShowEmailVerification(false);
              setVerificationEmail("");
              setMode("signin");
            }}
          >
            {t("auth.backToSignIn")}
          </Button>
        </div>
      </div>
    );
  }

  if (isRecoveryMode || showResetRequest) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-6 sm:py-8">
        <div className="w-full max-w-md glass-card rounded-2xl p-6 sm:p-8 space-y-5 sm:space-y-6 animate-scale-in relative">
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-xl sm:text-2xl font-bold">
              {isRecoveryMode ? t("auth.resetPasswordTitle") : t("auth.forgotPassword")}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {isRecoveryMode ? t("auth.enterNewPassword") : t("auth.resetPasswordDescription")}
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {isRecoveryMode ? (
              <>
                <Input
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("common.password")}
                />
                <Input
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t("common.confirmPassword")}
                />
              </>
            ) : (
              <Input
                type="email"
                required
                autoComplete="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="you@example.com"
              />
            )}

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
                {error}
              </p>
            )}
            {successMessage && (
              <p className="text-sm text-green-600 dark:text-green-400 bg-green-100/70 dark:bg-green-900/30 rounded-md px-3 py-2">
                {successMessage}
              </p>
            )}
            <Button
              type="submit"
              disabled={isSubmitting || (isRecoveryMode && !canSubmitPassword)}
              className="w-full h-11 sm:h-12 text-sm font-semibold"
            >
              {isRecoveryMode ? t("auth.updatePassword") : t("auth.sendResetLink")}
            </Button>
          </form>

          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => {
              setIsRecoveryMode(false);
              setShowResetRequest(false);
              setPassword("");
              setConfirmPassword("");
              setError(null);
              setSuccessMessage(null);
            }}
          >
            {t("auth.backToSignIn")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-6 sm:py-8">
      <div className="w-full max-w-md glass-card rounded-2xl p-6 sm:p-8 space-y-5 sm:space-y-6 animate-scale-in relative">
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-xl sm:text-2xl font-bold">StudyFlow Account</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {t("auth.signInTitle")} / {t("auth.signUpTitle")}
          </p>
        </div>
        <Tabs
          defaultValue="signin"
          onValueChange={(value) => {
            setMode(value as "signin" | "signup");
            setPassword("");
            setConfirmPassword("");
            setError(null);
          }}
        >
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="signin">{t("common.signIn")}</TabsTrigger>
            <TabsTrigger value="signup">{t("common.signUp")}</TabsTrigger>
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
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                {isSubmitting ? `${t("common.signIn")}...` : t("common.signIn")}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full text-sm"
                onClick={() => {
                  setShowResetRequest(true);
                  setResetEmail(email);
                  setError(null);
                  setSuccessMessage(null);
                }}
              >
                {t("auth.forgotPassword")}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  {t("common.email")}
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
                  {t("common.password")}
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
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                  {t("common.confirmPassword")}
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
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-destructive">{t("auth.passwordsNotMatch")}</p>
              )}
              <Button
                type="submit"
                disabled={isSubmitting || isAuthLoading || !canSubmitPassword}
                className="w-full h-11 text-sm font-semibold flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                {isSubmitting ? `${t("common.signUp")}...` : t("common.signUp")}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Auth;


