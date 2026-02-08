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
import { RiLoader4Line } from "@remixicon/react";
import { authLoginFormSchema as loginSchema } from "@/features/auth/schemas/auth.schema";
import { type LoginFormValues } from "@/features/auth/types";
import { useLogin } from "@/features/auth/hooks/useLogin";
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
      const parsed = loginSchema.safeParse(value);
      if (!parsed.success) return;

      await loginMutation.mutateAsync(parsed.data);
      router.navigate({ to: "/dashboard", replace: true });
    },
  });

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="mx-auto w-full max-w-md">
        <CardContent className="p-6 md:p-8">
          <form
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
                    if (!result.success) {
                      return result.error.issues[0]?.message
                        ? t(result.error.issues[0].message)
                        : undefined;
                    }
                    return undefined;
                  },
                }}
              >
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
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
                        onBlur={field.handleBlur}
                        autoComplete="email"
                        aria-invalid={isInvalid}
                      />
                      {isInvalid && field.state.meta.errors?.length ? (
                        <FieldError>{field.state.meta.errors[0]}</FieldError>
                      ) : null}
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field
                name="password"
                validators={{
                  onChange: ({ value }) => {
                    const result = loginSchema.shape.password.safeParse(value);
                    if (!result.success) {
                      return result.error.issues[0]?.message
                        ? t(result.error.issues[0].message)
                        : undefined;
                    }
                    return undefined;
                  },
                }}
              >
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
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
                              {t(
                                "auth.forgotPassword",
                                "Forgot your password?"
                              )}
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
                        onBlur={field.handleBlur}
                        autoComplete="current-password"
                        aria-invalid={isInvalid}
                      />
                      {isInvalid && field.state.meta.errors?.length ? (
                        <FieldError>{field.state.meta.errors[0]}</FieldError>
                      ) : null}
                    </Field>
                  );
                }}
              </form.Field>

              <Field>
                <Button type="submit" disabled={loginMutation.isPending}>
                  {loginMutation.isPending ? (
                    <>
                      <RiLoader4Line className="mr-2 h-4 w-4 animate-spin" />
                      {t("auth.submit")}
                    </>
                  ) : (
                    t("auth.submit")
                  )}
                </Button>
              </Field>
            </FieldGroup>
          </form>
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
