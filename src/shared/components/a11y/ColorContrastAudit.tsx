import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  meetsContrastRequirement,
  getContrastRatio,
} from "@/shared/utils/a11y";

/**
 * Color palette for contrast audit
 * Based on Tailwind CSS default colors and common UI patterns
 */
const colorPalette = {
  // Background colors
  backgrounds: {
    white: "#ffffff",
    slate50: "#f8fafc",
    slate100: "#f1f5f9",
    slate900: "#0f172a",
    slate950: "#020617",
  },
  // Text colors
  text: {
    slate900: "#0f172a",
    slate700: "#334155",
    slate600: "#475569",
    slate400: "#94a3b8",
    white: "#ffffff",
  },
  // Primary/Accent colors
  primary: {
    blue500: "#3b82f6",
    blue600: "#2563eb",
    blue700: "#1d4ed8",
  },
  // Status colors
  status: {
    red500: "#ef4444",
    red600: "#dc2626",
    green500: "#22c55e",
    green600: "#16a34a",
    yellow500: "#eab308",
    yellow600: "#ca8a04",
  },
};

/**
 * Common color combinations used in the app
 */
const colorCombinations = [
  // Light mode - body text
  {
    fg: colorPalette.text.slate900,
    bg: colorPalette.backgrounds.white,
    name: "Body text (light)",
  },
  {
    fg: colorPalette.text.slate700,
    bg: colorPalette.backgrounds.white,
    name: "Secondary text (light)",
  },
  {
    fg: colorPalette.text.slate600,
    bg: colorPalette.backgrounds.slate50,
    name: "Card text (light)",
  },

  // Dark mode - body text
  {
    fg: colorPalette.text.white,
    bg: colorPalette.backgrounds.slate900,
    name: "Body text (dark)",
  },
  {
    fg: colorPalette.text.slate400,
    bg: colorPalette.backgrounds.slate900,
    name: "Secondary text (dark)",
  },

  // Primary buttons
  {
    fg: colorPalette.text.white,
    bg: colorPalette.primary.blue600,
    name: "Primary button",
  },
  {
    fg: colorPalette.text.white,
    bg: colorPalette.primary.blue700,
    name: "Primary button hover",
  },

  // Status indicators
  {
    fg: colorPalette.text.white,
    bg: colorPalette.status.red600,
    name: "Error/Destructive",
  },
  {
    fg: colorPalette.text.white,
    bg: colorPalette.status.green600,
    name: "Success",
  },
  {
    fg: colorPalette.backgrounds.slate900,
    bg: colorPalette.status.yellow500,
    name: "Warning",
  },

  // Links and interactive
  {
    fg: colorPalette.primary.blue600,
    bg: colorPalette.backgrounds.white,
    name: "Link (light)",
  },
  {
    fg: colorPalette.primary.blue500,
    bg: colorPalette.backgrounds.slate900,
    name: "Link (dark)",
  },
];

/**
 * Audit color contrast ratios for accessibility
 * Checks against WCAG AA and AAA standards
 */
const auditColorContrast = () => {
  const results = colorCombinations.map((combo) => {
    const ratio = getContrastRatio(combo.fg, combo.bg);
    const meetsAA_normal = meetsContrastRequirement(
      combo.fg,
      combo.bg,
      "AA",
      false
    );
    const meetsAA_large = meetsContrastRequirement(
      combo.fg,
      combo.bg,
      "AA",
      true
    );
    const meetsAAA_normal = meetsContrastRequirement(
      combo.fg,
      combo.bg,
      "AAA",
      false
    );
    const meetsAAA_large = meetsContrastRequirement(
      combo.fg,
      combo.bg,
      "AAA",
      true
    );

    return {
      name: combo.name,
      fg: combo.fg,
      bg: combo.bg,
      ratio: ratio.toFixed(2),
      meetsAA_normal,
      meetsAA_large,
      meetsAAA_normal,
      meetsAAA_large,
      status: meetsAAA_normal
        ? "✅ AAA"
        : meetsAA_normal
        ? "✅ AA"
        : meetsAA_large
        ? "⚠️ AA Large Only"
        : "❌ Fail",
    };
  });

  return results;
};

/**
 * Component to display contrast audit results
 * Only shown in development mode
 */
export const ColorContrastAudit = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useTranslation("common");

  // Use useMemo to compute results only once, avoiding effects
  const results = useMemo(() => {
    if (import.meta.env.DEV) {
      return auditColorContrast();
    }
    return [];
  }, []);

  if (!import.meta.env.DEV || results.length === 0) return null;

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 z-50 rounded-full bg-purple-600 px-4 py-2 text-xs text-white shadow-lg hover:bg-purple-700"
        aria-label={t("ui.toggleColorContrast")}
      >
        {isVisible ? "Hide" : "Show"} A11y Audit
      </button>

      {/* Audit results panel */}
      {isVisible && (
        <div className="fixed bottom-16 right-4 z-50 max-h-[80vh] w-[600px] overflow-auto rounded-lg bg-white p-4 shadow-2xl dark:bg-slate-900">
          <h3 className="mb-4 text-lg font-bold">Color Contrast Audit</h3>
          <div className="space-y-3">
            {results.map((result, idx) => (
              <div key={idx} className="rounded border p-3 text-sm">
                <div className="mb-2 flex items-center justify-between">
                  <strong>{result.name}</strong>
                  <span className="text-xs">{result.status}</span>
                </div>
                <div className="mb-2 flex gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-6 w-6 rounded border"
                      style={{ backgroundColor: result.fg }}
                      aria-label={`Foreground color: ${result.fg}`}
                    />
                    <code className="text-xs">{result.fg}</code>
                  </div>
                  <span>on</span>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-6 w-6 rounded border"
                      style={{ backgroundColor: result.bg }}
                      aria-label={`Background color: ${result.bg}`}
                    />
                    <code className="text-xs">{result.bg}</code>
                  </div>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  Contrast ratio: <strong>{result.ratio}:1</strong>
                  <div className="mt-1 grid grid-cols-2 gap-1">
                    <div>AA Normal: {result.meetsAA_normal ? "✅" : "❌"}</div>
                    <div>AA Large: {result.meetsAA_large ? "✅" : "❌"}</div>
                    <div>
                      AAA Normal: {result.meetsAAA_normal ? "✅" : "❌"}
                    </div>
                    <div>AAA Large: {result.meetsAAA_large ? "✅" : "❌"}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded bg-slate-100 p-3 text-xs dark:bg-slate-800">
            <strong>WCAG Standards:</strong>
            <ul className="mt-2 space-y-1">
              <li>• AA Normal text: 4.5:1 minimum</li>
              <li>• AA Large text (18pt+): 3:1 minimum</li>
              <li>• AAA Normal text: 7:1 minimum</li>
              <li>• AAA Large text: 4.5:1 minimum</li>
            </ul>
          </div>
        </div>
      )}
    </>
  );
};
