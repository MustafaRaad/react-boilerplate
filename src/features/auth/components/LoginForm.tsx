/**
 * @copyright Copyright (c) 2025 Mustafa Raad Mutashar
 * @license MIT
 * @contact mustf.raad@gmail.com
 */
import TermsDialog from "./TermsDialog";
import PrivacyPolicyDialog from "./PrivacyPolicyDialog";
import PasswordResetDialog from "@/features/auth/components/PasswordResetDialog";
import { useEffect, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useRouter } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { 
  RiLoader4Line, 
  RiMailLine, 
  RiLockPasswordLine,
  RiLoginBoxLine,
  RiEyeLine,
  RiEyeOffLine,
  RiPhoneLine,
  RiUserLine
} from "@remixicon/react";
import { authLoginFormSchema as loginSchema } from "@/features/auth/schemas/auth.schema";
import { z } from "zod";
import { type LoginFormValues } from "@/features/auth/types";
import { useLogin } from "@/features/auth/hooks/useLogin";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/components/ui/tabs";
import { useAuthStore } from "@/store/auth.store";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { t } = useTranslation("common");
  const loginMutation = useLogin();
  const router = useRouter();
  const { user, isInitializing } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [loginType, setLoginType] = useState<"email" | "phone" | "username">("email");

  useEffect(() => {
    if (!isInitializing && user) {
      router.navigate({ to: "/dashboard", replace: true });
    }
  }, [isInitializing, user, router]);

  const form = useForm({
    defaultValues: {
      loginType: "email" as const,
      email: "",
      phone: "",
      username: "",
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
      const formData = {
        ...value,
        loginType,
      };
      const parsed = loginSchema.safeParse(formData);
      if (!parsed.success) return;

      await loginMutation.mutateAsync({
        ...parsed.data,
        loginType,
      });
      router.navigate({ to: "/dashboard", replace: true });
    },
  });

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="mx-auto w-full border-border/50 bg-card/80 backdrop-blur-sm shadow-lg dark:bg-card/90">
        <CardHeader className="flex flex-col items-center gap-3 pb-4">
          <div className="flex flex-col items-center gap-2 text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              {t("auth.welcomeTitle", "Welcome Back")}
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed text-balance">
              {t("auth.welcomeSubtitle", "Please enter your credentials to access your account")}
            </p>
          </div>
        </CardHeader>
        
        <CardContent className="pt-2">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void form.handleSubmit();
            }}
          >
            <FieldGroup className="gap-5">
              {/* Login Type Tabs */}
              <Tabs 
                value={loginType} 
                onValueChange={(value) => {
                  const newType = value as "email" | "phone" | "username";
                  setLoginType(newType);
                }} 
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="phone" className="flex items-center gap-2">
                    <RiPhoneLine className="h-4 w-4" />
                    <span className="hidden sm:inline">{t("auth.loginViaPhone", "Phone")}</span>
                  </TabsTrigger>
                  <TabsTrigger value="email" className="flex items-center gap-2">
                    <RiMailLine className="h-4 w-4" />
                    <span className="hidden sm:inline">{t("auth.loginViaEmail", "Email")}</span>
                  </TabsTrigger>
                  <TabsTrigger value="username" className="flex items-center gap-2">
                    <RiUserLine className="h-4 w-4" />
                    <span className="hidden sm:inline">{t("auth.loginViaUsername", "Username")}</span>
                  </TabsTrigger>
                </TabsList>

                {/* Phone Login */}
                <TabsContent value="phone" className="mt-4">
                  <form.Field
                    name="phone"
                    validators={{
                      onChange: ({ value }) => {
                        if (!value || value.trim().length === 0) {
                          return t("validation.phoneRequired", "Phone number is required");
                        }
                        const phoneRegex = /^(\+964|0)?7[0-9]{9}$/;
                        if (!phoneRegex.test(value.replace(/\s/g, ""))) {
                          return t("validation.phone.invalid", "Invalid Iraqi phone number format");
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
                          <FieldLabel htmlFor={field.name} className="text-sm font-semibold text-foreground">
                            {t("auth.phoneLabel", "Phone Number")}
                          </FieldLabel>
                          <div className="relative">
                            <RiPhoneLine className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                            <Input
                              id={field.name}
                              type="tel"
                              placeholder={t("auth.phonePlaceholder", "07XXXXXXXXX or +9647XXXXXXXXX")}
                              required
                              value={field.state.value}
                              onChange={(e) => field.handleChange(e.target.value)}
                              onBlur={field.handleBlur}
                              autoComplete="tel"
                              aria-invalid={isInvalid}
                              className={cn(
                                "pl-9 transition-all duration-200",
                                isInvalid && "border-destructive focus-visible:border-destructive"
                              )}
                            />
                          </div>
                          {isInvalid && field.state.meta.errors?.length ? (
                            <FieldError className="text-xs">{field.state.meta.errors[0]}</FieldError>
                          ) : null}
                        </Field>
                      );
                    }}
                  </form.Field>
                </TabsContent>

                {/* Email Login */}
                <TabsContent value="email" className="mt-4">
                  <form.Field
                    name="email"
                    validators={{
                      onChange: ({ value }) => {
                        if (!value || value.trim().length === 0) {
                          return t("validation.email.required", "Email is required");
                        }
                        const result = z.string().email().safeParse(value);
                        if (!result.success) {
                          return t("validation.email.invalid", "Invalid email address");
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
                          <FieldLabel htmlFor={field.name} className="text-sm font-semibold text-foreground">
                            {t("auth.emailLabel", "Email Address")}
                          </FieldLabel>
                          <div className="relative">
                            <RiMailLine className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                            <Input
                              id={field.name}
                              type="email"
                              placeholder={t("auth.emailPlaceholder", "Enter your email address")}
                              required
                              value={field.state.value}
                              onChange={(e) => field.handleChange(e.target.value)}
                              onBlur={field.handleBlur}
                              autoComplete="email"
                              aria-invalid={isInvalid}
                              className={cn(
                                "pl-9 transition-all duration-200",
                                isInvalid && "border-destructive focus-visible:border-destructive"
                              )}
                            />
                          </div>
                          {isInvalid && field.state.meta.errors?.length ? (
                            <FieldError className="text-xs">{field.state.meta.errors[0]}</FieldError>
                          ) : null}
                        </Field>
                      );
                    }}
                  </form.Field>
                </TabsContent>

                {/* Username Login */}
                <TabsContent value="username" className="mt-4">
                  <form.Field
                    name="username"
                    validators={{
                      onChange: ({ value }) => {
                        if (!value || value.trim().length === 0) {
                          return t("validation.usernameRequired", "Username is required");
                        }
                        if (value.trim().length < 3) {
                          return t("validation.usernameMinLength", "Username must be at least 3 characters");
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
                          <FieldLabel htmlFor={field.name} className="text-sm font-semibold text-foreground">
                            {t("auth.usernameLabel", "Username")}
                          </FieldLabel>
                          <div className="relative">
                            <RiUserLine className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                            <Input
                              id={field.name}
                              type="text"
                              placeholder={t("auth.usernamePlaceholder", "Enter your username")}
                              required
                              value={field.state.value}
                              onChange={(e) => field.handleChange(e.target.value)}
                              onBlur={field.handleBlur}
                              autoComplete="username"
                              aria-invalid={isInvalid}
                              className={cn(
                                "pl-9 transition-all duration-200",
                                isInvalid && "border-destructive focus-visible:border-destructive"
                              )}
                            />
                          </div>
                          {isInvalid && field.state.meta.errors?.length ? (
                            <FieldError className="text-xs">{field.state.meta.errors[0]}</FieldError>
                          ) : null}
                        </Field>
                      );
                    }}
                  </form.Field>
                </TabsContent>
              </Tabs>

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
                      <div className="flex items-center justify-between">
                        <FieldLabel htmlFor={field.name} className="text-sm font-semibold text-foreground">
                          {t("auth.passwordLabel", "Password")}
                        </FieldLabel>
                        <PasswordResetDialog
                          trigger={
                            <button
                              type="button"
                              className="text-xs font-medium text-primary underline-offset-4 transition-colors hover:underline"
                            >
                              {t(
                                "auth.forgotPassword",
                                "Forgot password?"
                              )}
                            </button>
                          }
                        />
                      </div>
                      <div className="relative">
                        <RiLockPasswordLine className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                        <Input
                          id={field.name}
                          type={showPassword ? "text" : "password"}
                          required
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          autoComplete="current-password"
                          aria-invalid={isInvalid}
                          className={cn(
                            "pl-9 pr-9 transition-all duration-200",
                            isInvalid && "border-destructive focus-visible:border-destructive"
                          )}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-muted-foreground hover:text-foreground absolute right-3 top-1/2 -translate-y-1/2 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm"
                          aria-label={showPassword ? t("auth.hidePassword", "Hide password") : t("auth.showPassword", "Show password")}
                        >
                          {showPassword ? (
                            <RiEyeOffLine className="h-4 w-4" />
                          ) : (
                            <RiEyeLine className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {isInvalid && field.state.meta.errors?.length ? (
                        <FieldError className="text-xs">{field.state.meta.errors[0]}</FieldError>
                      ) : null}
                    </Field>
                  );
                }}
              </form.Field>

              <Field className="pt-2">
                <Button 
                  type="submit" 
                  disabled={loginMutation.isPending}
                  className="w-full h-10 text-base font-semibold shadow-sm transition-all duration-200 hover:shadow-md"
                >
                  {loginMutation.isPending ? (
                    <>
                      <RiLoader4Line className="mr-2 h-4 w-4 animate-spin" />
                      {t("auth.submitting", "Authenticating...")}
                    </>
                  ) : (
                    <>
                      <RiLoginBoxLine className="mr-2 h-4 w-4" />
                      {t("auth.signIn", "Sign In")}
                    </>
                  )}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      <FieldDescription className="mt-2 px-6 text-center text-xs leading-relaxed text-muted-foreground">
        {t("auth.tosPrefix", "By proceeding, you acknowledge and agree to our")}{" "}
        <TermsDialog
          trigger={
            <button 
              type="button" 
              className="font-semibold text-primary underline-offset-4 transition-colors hover:underline"
            >
              {t("auth.terms", "Terms of Service")}
            </button>
          }
        />{" "}
        {t("auth.and", "and")}{" "}
        <PrivacyPolicyDialog
          trigger={
            <button 
              type="button" 
              className="font-semibold text-primary underline-offset-4 transition-colors hover:underline"
            >
              {t("auth.privacy", "Privacy Policy")}
            </button>
          }
        />
        .
      </FieldDescription>
    </div>
  );
}
