/**
 * @copyright Copyright (c) 2025 Mustafa Raad Mutashar
 * @license MIT
 * @contact mustf.raad@gmail.com
 */
import { useCallback } from "react";
import { RiGlobalLine } from "@remixicon/react";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function LanguageToggle({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { i18n, t } = useTranslation("common");
  const currentLanguage = i18n.language || "en";

  const changeLanguage = useCallback(
    (langCode: string) => {
      void i18n.changeLanguage(langCode);
    },
    [i18n]
  );

  const languages = [
    { code: "en", label: "English" },
    { code: "ar", label: "العربية" },
  ];

  const currentLangLabel = languages.find(
    (lang) => lang.code === currentLanguage
  )?.label || "English";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn("size-10", className)}
          aria-label={t("language.switch")}
          {...props}
        >
          <RiGlobalLine className="size-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={cn(
              "cursor-pointer",
              currentLanguage === lang.code && "bg-accent"
            )}
          >
            {lang.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
