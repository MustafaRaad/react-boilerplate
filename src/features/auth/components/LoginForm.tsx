import { useForm } from "@tanstack/react-form";
import { useRouter } from "@tanstack/react-router";
import { Loader2, Mail, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { loginSchema, type LoginFormValues } from "@/core/schemas/auth.schema";
import { useLogin } from "@/features/auth/api/useLogin";
import { FormField } from "@/components/form/FormField";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";

export const LoginForm = () => {
  const { t, i18n } = useTranslation();
  const loginMutation = useLogin();
  const router = useRouter();
  const { user, isInitializing } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!isInitializing && user) {
      router.navigate({ to: "/dashboard", replace: true });
    }
  }, [isInitializing, user, router]);

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    } satisfies LoginFormValues,
    validators: {
      onSubmit: ({ value }) => {
        const result = loginSchema.safeParse(value);
        if (!result.success) {
          return result.error.format();
        }
        return undefined;
      },
    },
    onSubmit: async ({ value }) => {
      await loginMutation.mutateAsync(value);
      router.navigate({ to: "/dashboard", replace: true });
    },
  });

  // UI adapted from provided sample while keeping existing logic
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-primary/10 via-background to-background px-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-semibold">
            {t("auth.title")}
          </CardTitle>
          <CardDescription>{t("welcome")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void form.handleSubmit();
            }}
            className="space-y-5"
          >
            {/* Email Field */}
            <form.Field
              name="email"
              validators={{
                onChange: ({ value }) => {
                  const result = loginSchema.shape.email.safeParse(value);
                  return result.success
                    ? undefined
                    : result.error.issues[0]?.message;
                },
              }}
            >
              {(field) => (
                <FormField field={field} label={t("auth.email")}>
                  <div className="relative flex items-center gap-2 rounded-md border border-border/70 bg-background/30 px-3 py-2 shadow-sm transition focus-within:ring-2 focus-within:ring-ring">
                    <Mail
                      className="h-4 w-4 text-muted-foreground"
                      aria-hidden
                    />
                    <Input
                      id={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder={t("auth.email")}
                      autoComplete="email"
                      inputMode="email"
                      type="email"
                      className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                    />
                  </div>
                </FormField>
              )}
            </form.Field>

            {/* Password Field with visibility toggle */}
            <form.Field
              name="password"
              validators={{
                onChange: ({ value }) => {
                  const result = loginSchema.shape.password.safeParse(value);
                  return result.success
                    ? undefined
                    : result.error.issues[0]?.message;
                },
              }}
            >
              {(field) => (
                <FormField field={field} label={t("auth.password")}>
                  <div className="relative">
                    <Input
                      id={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="••••••••"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      className="pr-10"
                    />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() => setShowPassword((s) => !s)}
                          aria-label={
                            showPassword
                              ? t("auth.password")
                              : t("auth.password")
                          }
                          className={cn(
                            "absolute inset-y-0 my-auto flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                            i18n.language === "ar" ? "left-1" : "right-1"
                          )}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" aria-hidden />
                          ) : (
                            <Eye className="h-4 w-4" aria-hidden />
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent
                        side={i18n.language === "ar" ? "left" : "right"}
                      >
                        <span className="text-xs">
                          {showPassword ? "Hide" : "Show"}
                        </span>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </FormField>
              )}
            </form.Field>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full gap-2"
              disabled={loginMutation.isPending}
              aria-busy={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <ArrowRight
                  className={cn(
                    "h-4 w-4",
                    i18n.language === "ar" && "rotate-180"
                  )}
                  aria-hidden
                />
              )}
              <span>{t("auth.submit")}</span>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
