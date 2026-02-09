/**
 * @copyright Copyright (c) 2025 Mustafa Raad Mutashar
 * @license MIT
 * @contact mustf.raad@gmail.com
 */
import { useCallback } from "react";
import { RiMoonLine, RiSunLine } from "@remixicon/react";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/lib/utils";

export function ThemeToggle({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={cn("size-10", className)}
      aria-label={
        theme === "dark" ? t("theme.light") : t("theme.dark")
      }
      {...props}
    >
      {theme === "dark" ? (
        <RiSunLine className="size-5" />
      ) : (
        <RiMoonLine className="size-5" />
      )}
    </Button>
  );
}
