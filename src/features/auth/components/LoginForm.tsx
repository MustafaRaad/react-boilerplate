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
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/components/ui/tabs";
import { useAuthStore } from "@/store/auth.store";

type LoginType = "email" | "phone" | "username";

interface LoginFieldConfig {
  type: LoginType;
  name: keyof LoginFormValues;
  icon: React.ComponentType<{ className?: string }>;
  labelKey: string;
  placeholderKey: string;
  inputType: string;
  autoComplete: string;
  createValidator: (t: ReturnType<typeof useTranslation>["t"]) => (value: string) => string | undefined;
}

const createLoginFieldConfigs = (t: ReturnType<typeof useTranslation>["t"]): LoginFieldConfig[] => [
  {
    type: "phone",
    name: "phone",
    icon: RiPhoneLine,
    labelKey: "auth.phoneLabel",
    placeholderKey: "auth.phonePlaceholder",
    inputType: "tel",
    autoComplete: "tel",
    createValidator: () => (value: string) => {
      if (!value || value.trim().length === 0) {
        return t("validation.phoneRequired", "Phone number is required");
      }
      const phoneRegex = /^(\+964|0)?7[0-9]{9}$/;
      if (!phoneRegex.test(value.replace(/\s/g, ""))) {
        return t("validation.phone.invalid", "Invalid Iraqi phone number format");
      }
      return undefined;
    },
  },
  {
    type: "email",
    name: "email",
    icon: RiMailLine,
    labelKey: "auth.emailLabel",
    placeholderKey: "auth.emailPlaceholder",
    inputType: "email",
    autoComplete: "email",
    createValidator: () => (value: string) => {
      if (!value || value.trim().length === 0) {
        return t("validation.email.required", "Email is required");
      }
      const result = z.string().email().safeParse(value);
      if (!result.success) {
        return t("validation.email.invalid", "Invalid email address");
      }
      return undefined;
    },
  },
  {
    type: "username",
    name: "username",
    icon: RiUserLine,
    labelKey: "auth.usernameLabel",
    placeholderKey: "auth.usernamePlaceholder",
    inputType: "text",
    autoComplete: "username",
    createValidator: () => (value: string) => {
      if (!value || value.trim().length === 0) {
        return t("validation.usernameRequired", "Username is required");
      }
      if (value.trim().length < 3) {
        return t("validation.usernameMinLength", "Username must be at least 3 characters");
      }
      return undefined;
    },
  },
];

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { t } = useTranslation("common");
  const loginMutation = useLogin();
  const router = useRouter();
  const { user, isInitializing } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [loginType, setLoginType] = useState<LoginType>("phone");

  const loginFieldConfigs = createLoginFieldConfigs(t);

  useEffect(() => {
    if (!isInitializing && user) {
      router.navigate({ to: "/dashboard", replace: true });
    }
  }, [isInitializing, user, router]);

  const form = useForm({
    defaultValues: {
      loginType: "phone" as LoginType,
      email: "",
      phone: "",
      username: "",
      password: "",
    } satisfies LoginFormValues,
    validators: {
      onSubmit: ({ value }) => {
        // Ensure loginType is synced with state
        const formData = {
          ...value,
          loginType,
        };
        const result = loginSchema.safeParse(formData);
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
      // Ensure loginType is synced with state
      const formData = {
        ...value,
        loginType,
      };
      const parsed = loginSchema.safeParse(formData);
      if (!parsed.success) {
        console.error("Validation failed:", parsed.error.format());
        return;
      }

      await loginMutation.mutateAsync({
        ...parsed.data,
        loginType,
      });
      router.navigate({ to: "/dashboard", replace: true });
    },
  });

  // Sync form's loginType field when tab changes
  useEffect(() => {
    form.setFieldValue("loginType", loginType);
  }, [loginType, form]);

  return (
    <div className={cn("flex flex-col gap-4 sm:gap-6", className)} {...props}>
      <Card className="mx-auto w-full border-border/50 bg-card/80 backdrop-blur-sm shadow-lg dark:bg-card/90">
        <CardHeader className="flex flex-col items-center gap-2 sm:gap-3 px-4 sm:px-6 pt-4 sm:pt-6">
          <div className="flex flex-col items-center gap-1.5 sm:gap-2 text-center">
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
              {t("auth.welcomeTitle", "Welcome Back")}
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed text-balance max-w-md px-2">
              {t("auth.welcomeSubtitle", "Please provide your authentication credentials to securely access your account and continue to your dashboard")}
            </p>
          </div>
        </CardHeader>

        <CardContent className="pt-2 px-4 sm:px-6 pb-4 sm:pb-6">
          <form
            onSubmit={async (event) => {
              event.preventDefault();
              event.stopPropagation();
              await form.handleSubmit();
            }}
          >
            <FieldGroup className="gap-5">
              {/* Login Type Tabs */}
              <Tabs
                value={loginType}
                onValueChange={(value) => {
                  const newType = value as LoginType;
                  setLoginType(newType);
                }}
                className="w-full"
              >
                <p className="text-muted-foreground text-[10px] sm:text-xs leading-relaxed text-balance max-w-md mt-1 px-1">
                  {t("auth.loginInstructions", "Select your preferred authentication method and enter the corresponding credentials below")}
                </p>
                <TabsList className="grid w-full grid-cols-3 gap-1 sm:gap-2">
                  {loginFieldConfigs.map((config) => {
                    const Icon = config.icon;
                    const tabLabelKey = `auth.loginVia${config.type.charAt(0).toUpperCase() + config.type.slice(1)}` as const;
                    return (
                      <TabsTrigger
                        key={config.type}
                        value={config.type}
                        className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3"
                      >
                        <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">
                          {t(tabLabelKey, config.type.charAt(0).toUpperCase() + config.type.slice(1))}
                        </span>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>

                {loginFieldConfigs.map((config) => {
                  const Icon = config.icon;
                  const validator = config.createValidator(t);
                  return (
                    <TabsContent key={config.type} value={config.type} className="mt-4">
                      <form.Field
                        name={config.name}
                        validators={{
                          onChange: ({ value }) => validator(value as string),
                        }}
                      >
                        {(field) => {
                          const isInvalid =
                            field.state.meta.isTouched && !field.state.meta.isValid;
                          return (
                            <Field data-invalid={isInvalid}>
                              <FieldLabel htmlFor={field.name} className="text-sm font-semibold text-foreground">
                                {t(config.labelKey, config.type.charAt(0).toUpperCase() + config.type.slice(1))}
                              </FieldLabel>
                              <div className="relative">
                                <Icon className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                                <Input
                                  id={field.name}
                                  type={config.inputType}
                                  placeholder={t(config.placeholderKey, `Enter your ${config.type}`)}
                                  required
                                  value={field.state.value as string}
                                  onChange={(e) => field.handleChange(e.target.value)}
                                  onBlur={field.handleBlur}
                                  autoComplete={config.autoComplete}
                                  aria-invalid={isInvalid}
                                  dir="ltr"
                                  className={cn(
                                    "pl-9 transition-all duration-200",
                                    "text-left [direction:ltr]",
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
                  );
                })}
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
                        <div className="flex flex-col gap-0.5">
                          <FieldLabel htmlFor={field.name} className="text-sm font-semibold text-foreground">
                            {t("auth.passwordLabel", "Secure Password")}
                          </FieldLabel>
                        </div>
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
                          dir="ltr"
                          className={cn(
                            "pl-9 pr-9 transition-all duration-200",
                            "text-left [direction:ltr]",
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
                  className="w-full h-10 sm:h-11 text-sm sm:text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 relative overflow-hidden group"
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

      <div className="mt-2 px-3 sm:px-6 text-center text-[10px] sm:text-xs leading-relaxed text-white space-y-1">
        <p className="px-1">
          {t("auth.tosPrefix", "By proceeding with the authentication process, you hereby acknowledge, understand, and expressly agree to be bound by our")}{" "}
          <TermsDialog
            trigger={
              <button
                type="button"
                className="font-semibold text-secondary underline-offset-4 transition-colors hover:underline break-words"
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
                className="font-semibold text-secondary underline-offset-4 transition-colors hover:underline break-words"
              >
                {t("auth.privacy", "Privacy Policy")}
              </button>
            }
          />
          .
        </p>
        <p className="text-[9px] sm:text-[10px] opacity-75 px-1">
          {t("auth.tosSuffix", "Please review these documents carefully before continuing")}
        </p>
      </div>
    </div>
  );
}
