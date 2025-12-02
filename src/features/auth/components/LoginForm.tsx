import { useForm } from "@tanstack/react-form";
import { useRouter } from "@tanstack/react-router";
import { Loader2, LockKeyhole, Mail } from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { FormField } from "@/shared/components/form/FormField";
import { useLogin } from "@/features/auth/api/useLogin";
import { type LoginFormValues } from "@/features/auth/types";
import { useAuthStore } from "@/store/auth.store";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { t } = useTranslation();
  const loginMutation = useLogin();
  const router = useRouter();
  const { user, isInitializing } = useAuthStore();

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

  return (
    <div
      className={cn(
        "min-h-screen bg-gradient-to-br from-primary/10 via-background to-background px-4 py-10 flex items-center justify-center",
        className,
      )}
      {...props}
    >
      <Card className="w-full max-w-5xl overflow-hidden border-none shadow-xl">
        <div className="grid md:grid-cols-[1.1fr_1fr]">
          <div className="relative bg-primary/10 p-8 sm:p-10 flex flex-col gap-6 justify-between">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/5 to-transparent" />
            <div className="relative space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-sm font-medium text-primary">
                <LockKeyhole className="h-4 w-4" />
                {t("appName")}
              </span>
              <CardTitle className="text-3xl font-bold text-foreground">
                {t("auth.title")}
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                {t("welcome")}
              </CardDescription>
            </div>
            <div className="relative rounded-lg border border-primary/20 bg-white/60 p-4 text-sm text-muted-foreground shadow-sm backdrop-blur">
              {t("dashboard.quickStats")}
            </div>
          </div>

          <CardContent className="p-6 sm:p-8">
            <form
              className="space-y-6"
              onSubmit={(event) => {
                event.preventDefault();
                void form.handleSubmit();
              }}
            >
              <div className="space-y-2">
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
                      <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-ring">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <Input
                          id={field.name}
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder={t("auth.email")}
                          className="border-0 px-0 shadow-none focus-visible:ring-0"
                          type="email"
                          autoComplete="email"
                        />
                      </div>
                    </FormField>
                  )}
                </form.Field>
              </div>

              <div className="space-y-2">
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
                      <Input
                        id={field.name}
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder={t("auth.password")}
                        type="password"
                        autoComplete="current-password"
                      />
                    </FormField>
                  )}
                </form.Field>
              </div>

              <Button
                type="submit"
                className="w-full gap-2"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                {t("auth.submit")}
              </Button>
            </form>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}
