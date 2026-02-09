import { LoginForm } from "@/features/auth/components/LoginForm";
import { ThemeToggle } from "@/features/auth/components/ThemeToggle";
import { LanguageToggle } from "@/features/auth/components/LanguageToggle";
import { OptimizedImage } from "@/shared/components/ui/optimized-image";
import { useTranslation } from "react-i18next";
import Grainient from "@/shared/components/Grainient";
export function LoginPage() {
  const { t } = useTranslation("common");

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      {/* Grainient Background */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <Grainient
          color1="#00b4d9"
          color2="#4f0da0"
          color3="#994ee4"
          timeSpeed={0.25}
          colorBalance={0.13}
          warpStrength={0}
          warpFrequency={2.6}
          warpSpeed={2}
          warpAmplitude={27}
          blendAngle={-31}
          blendSoftness={0.05}
          rotationAmount={590}
          noiseScale={2.6}
          grainAmount={0.1}
          grainScale={5.5}
          grainAnimated={false}
          contrast={1.15}
          gamma={1}
          saturation={1}
          centerX={0}
          centerY={0}
          zoom={1}
        />
      </div>

      {/* First Row: Logo and ThemeToggle */}
      <div className="relative z-10 flex w-full items-start justify-between p-4">
        {/* Logo and Company Title */}
        <div className="flex items-center gap-4">
          <div className="relative flex h-22 w-22 items-center justify-center rounded-2xl bg-primary/10 p-3 ring-2 ring-primary/20 dark:bg-primary/20 dark:ring-primary/30 shadow-sm">
            <OptimizedImage
              src="/logo.svg"
              width={56}
              height={56}
              alt={t("app.title")}
              className="h-full w-full object-contain"
            />
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold tracking-tight text-white leading-tight">
              {t("app.title")}
            </h1>
            <p className="text-xs text-white/80 leading-tight mt-0.5">
              {t("app.description")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>

      {/* Second Row: LoginForm */}
      <div className="relative z-10 flex flex-1 items-center justify-center">
        <LoginForm className="w-full max-w-md" />
      </div>
    </div>
  );
}
