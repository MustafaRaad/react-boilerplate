import { useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { useRouter } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import { loginSchema, type LoginFormValues } from "@/core/schemas/auth.schema";
import { useLogin } from "@/features/auth/api/useLogin";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import {
  Field,
  FieldDescription,
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
                      : result.error.issues[0]?.message;
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
                      <FieldDescription className="text-destructive">
                        {field.state.meta.errors[0]}
                      </FieldDescription>
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
                      : result.error.issues[0]?.message;
                  },
                }}
              >
                {(field) => (
                  <Field>
                    <div className="flex items-center">
                      <FieldLabel htmlFor={field.name}>
                        {t("auth.password")}
                      </FieldLabel>
                      <a
                        href="#"
                        className="ml-auto text-sm underline-offset-2 hover:underline"
                      >
                        {t("auth.forgotPassword", "Forgot your password?")}
                      </a>
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
                      <FieldDescription className="text-destructive">
                        {field.state.meta.errors[0]}
                      </FieldDescription>
                    ) : null}
                  </Field>
                )}
              </form.Field>

              <Field>
                <Button type="submit" disabled={loginMutation.isPending}>
                  {loginMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("auth.submit")}
                    </>
                  ) : (
                    t("auth.submit")
                  )}
                </Button>
              </Field>
            </FieldGroup>
          </form>

          <div className="bg-muted relative hidden md:block">
            <img
              src="/placeholder.svg"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
      <FieldDescription className="mt-auto px-6 text-center">
        {t("auth.tosPrefix", "By clicking continue, you agree to our")}{" "}
        <a href="#">{t("auth.terms", "Terms of Service")}</a>{" "}
        {t("auth.and", "and")}{" "}
        <a href="#">{t("auth.privacy", "Privacy Policy")}</a>.
      </FieldDescription>
    </div>
  );
}
