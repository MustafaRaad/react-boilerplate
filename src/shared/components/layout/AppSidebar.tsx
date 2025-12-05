import { Link, useRouterState } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { OptimizedImage } from "@/shared/components/ui/optimized-image";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
} from "@/shared/components/ui/sidebar";
import { mainNavItems } from "@/shared/config/navigation";
import { useDirection } from "@/shared/hooks/useDirection";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t } = useTranslation("common");
  const { location } = useRouterState();
  const { isRtl } = useDirection();

  return (
    <Sidebar
      variant="sidebar"
      collapsible="icon"
      side={isRtl ? "right" : "left"}
      {...props}
    >
      <SidebarHeader className="pt-4">
        <SidebarMenu>
          <SidebarMenuItem className="flex flex-col gap-4 m-auto justify-center items-center">
            <span className="font-extrabold group-data-[collapsible=icon]:hidden mx-auto text-center">
              {t("app.title")}
            </span>
            <OptimizedImage
              src="/logo.svg"
              width={600}
              height={600}
              alt={t("app.logo")}
              priority
              className="max-h-20 m-auto group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:m-0"
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="flex flex-col gap-2 group-data-[collapsible=icon]:mt-4">
            <SidebarMenu>
              {mainNavItems.map((item) => {
                const isActive =
                  item.href === "/dashboard"
                    ? location.pathname === "/dashboard"
                    : location.pathname.startsWith(item.href);

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      size="md"
                      tooltip={t(item.label)}
                      isActive={isActive}
                    >
                      <Link to={item.href}>
                        {item.icon && <item.icon />}
                        <span>{t(item.label)}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
