/**
 * @copyright Copyright (c) 2025 Mustafa Raad Mutashar
 * @license MIT
 * @contact mustf.raad@gmail.com
 */
import TermsDialog from "./TermsDialog";
import PrivacyPolicyDialog from "./PrivacyPolicyDialog";
import PasswordResetDialog from "@/features/auth/components/PasswordResetDialog";
import { useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { useRouter } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Loader } from "lucide-react";
import { authLoginFormSchema as loginSchema } from "@/features/auth/schemas/auth.schema";
import { type LoginFormValues } from "@/features/auth/types";
import { useLogin } from "@/features/auth/hooks/useLogin";
import { OptimizedImage } from "@/shared/components/ui/optimized-image";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { useAuthStore } from "@/store/auth.store";

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
          const formatted = result.error.format();
          // Translate validation message keys
          return Object.fromEntries(
            Object.entries(formatted).map(([key, errors]) => [
              key,
              Array.isArray(errors) && errors.length > 0
                ? errors.map((msg: string) =>
                    typeof msg === "string" ? t(msg) : msg
                  )
                : errors,
            ])
          );
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
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form
            className="p-6 md:p-8"
            onSubmit={(event) => {
              event.preventDefault();
              void form.handleSubmit();
            }}
          >
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">{t("auth.title")}</h1>
                <p className="text-muted-foreground text-balance">
                  {t("welcome")}
                </p>
              </div>

              <form.Field
                name="email"
                validators={{
                  onChange: ({ value }) => {
                    const result = loginSchema.shape.email.safeParse(value);
                    return result.success
                      ? undefined
                      : t(result.error.issues[0]?.message || "");
                  },
                }}
              >
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>
                      {t("auth.email")}
                    </FieldLabel>
                    <Input
                      id={field.name}
                      type="email"
                      placeholder="m@example.com"
                      required
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      autoComplete="email"
                    />
                    {field.state.meta.errors?.length ? (
                      <FieldError>{field.state.meta.errors[0]}</FieldError>
                    ) : null}
                  </Field>
                )}
              </form.Field>

              <form.Field
                name="password"
                validators={{
                  onChange: ({ value }) => {
                    const result = loginSchema.shape.password.safeParse(value);
                    return result.success
                      ? undefined
                      : t(result.error.issues[0]?.message || "");
                  },
                }}
              >
                {(field) => (
                  <Field>
                    <div className="flex items-center">
                      <FieldLabel htmlFor={field.name}>
                        {t("auth.password")}
                      </FieldLabel>
                      <PasswordResetDialog
                        trigger={
                          <button
                            type="button"
                            className="ms-auto text-sm underline-offset-2 hover:underline"
                          >
                            {t("auth.forgotPassword", "Forgot your password?")}
                          </button>
                        }
                      />
                    </div>
                    <Input
                      id={field.name}
                      type="password"
                      required
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      autoComplete="current-password"
                    />
                    {field.state.meta.errors?.length ? (
                      <FieldError>{field.state.meta.errors[0]}</FieldError>
                    ) : null}
                  </Field>
                )}
              </form.Field>

              <Field>
                <Button type="submit" disabled={loginMutation.isPending}>
                  {loginMutation.isPending ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      {t("auth.submit")}
                    </>
                  ) : (
                    t("auth.submit")
                  )}
                </Button>
              </Field>
            </FieldGroup>
          </form>

          <div className="relative hidden md:block bg-linear-to-br from-primary/15 via-secondary/15 to-background px-6 py-8 dark:from-primary/20 dark:via-secondary/20 dark:to-background">
            <div className="absolute inset-0 opacity-70">
              <div className="bg-primary/20 dark:bg-primary/15 absolute -left-10 -top-10 h-40 w-40 rounded-full blur-3xl" />
              <div className="bg-secondary/25 dark:bg-secondary/15 absolute bottom-0 right-4 h-48 w-48 rounded-full blur-3xl" />
            </div>
            <div className="relative flex h-full items-center justify-center">
              <div>
                <OptimizedImage
                  src="/logo.svg"
                  alt={t("app.title", "App logo")}
                  width={120}
                  height={120}
                  priority
                  className="m-auto h-30 w-30"
                />
                <div className="mt-4 text-center">
                  <p className="text-lg font-semibold text-foreground">
                    {t("app.title", "Mustafa Raad Dashboard")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t(
                      "app.description",
                      "Secure access to your workspace with confidence."
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <FieldDescription className="mt-auto px-6 text-center">
        {t("auth.tosPrefix", "By clicking continue, you agree to our")}{" "}
        <TermsDialog
          trigger={
            <button type="button" className="underline text-primary">
              {t("auth.terms", "Terms of Service")}
            </button>
          }
        />{" "}
        {t("auth.and", "and")}{" "}
        <PrivacyPolicyDialog
          trigger={
            <button type="button" className="underline text-primary">
              {t("auth.privacy", "Privacy Policy")}
            </button>
          }
        />
        .
      </FieldDescription>
    </div>
  );
}
