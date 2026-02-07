/**
 * @copyright Copyright (c) 2025 Mustafa Raad Mutashar
 * @license MIT
 * @contact mustf.raad@gmail.com
 */

import { Fragment } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { RiHomeLine } from "@remixicon/react";
import { useTranslation } from "react-i18next";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/components/ui/breadcrumb";

export function Breadcrumbs() {
  const { location } = useRouterState();
  const { t } = useTranslation("common");

  // Generate breadcrumb items from current path
  const pathSegments = location.pathname.split("/").filter(Boolean);

  const breadcrumbItems = pathSegments.map((segment, index) => {
    const href = "/" + pathSegments.slice(0, index + 1).join("/");
    const isLast = index === pathSegments.length - 1;

    // Check if segment is a numeric ID (e.g., "123" or UUID format)
    const isIdSegment = /^(\d+|[a-f0-9-]{36})$/.test(segment);

    let label: string;

    if (isIdSegment) {
      // For ID segments, use "Details" as the label
      label = t("common:details", { defaultValue: "Details" });
    } else {
      // Try to get translation key for the segment from navigation namespace
      const translationKey = `navigation.${segment}`;
      label = t(translationKey, {
        defaultValue: segment
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" "),
      });
    }

    return { href, label, isLast, isDashboard: segment === "dashboard" };
  });

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbItems.map((item) => (
          <Fragment key={item.href}>
            <BreadcrumbItem>
              {item.isLast ? (
                <BreadcrumbPage>
                  {item.isDashboard ? (
                    <>
                      <RiHomeLine className="h-4 w-4" aria-hidden="true" />
                      <span className="sr-only">{item.label}</span>
                    </>
                  ) : (
                    item.label
                  )}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link
                    to={item.href}
                    aria-label={item.isDashboard ? item.label : undefined}
                  >
                    {item.isDashboard ? (
                      <>
                        <RiHomeLine className="h-4 w-4" aria-hidden="true" />
                        <span className="sr-only">{item.label}</span>
                      </>
                    ) : (
                      item.label
                    )}
                  </Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {!item.isLast && <BreadcrumbSeparator />}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
