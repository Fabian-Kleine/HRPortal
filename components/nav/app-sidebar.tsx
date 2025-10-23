"use client"

import * as React from "react"
import {
  BookUser,
  CalendarClock,
  CalendarDays,
  House,
} from "lucide-react"

import { NavItems } from "@/components/nav/nav-items"
import { NavUser } from "@/components/nav/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const t = useTranslations("AppSidebar");
  const pathname = usePathname();

  const data = {
    user: {
      name: "shadcn",
      email: "m@example.com",
      avatar: "/avatars/shadcn.jpg",
    },
    navItems: [
      {
        title: t('home'),
        url: "/hrportal/home",
        icon: House,
        isActive: pathname === "/hrportal/home",
      },
      {
        title: t('calendar'),
        url: "/hrportal/calendar",
        icon: CalendarDays,
        isActive: pathname === "/hrportal/calendar",
      },
      {
        title: t('timeRecords'),
        url: "/hrportal/timerecords",
        icon: CalendarClock,
        isActive: pathname === "/hrportal/timerecords",
      },
    ],
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <BookUser className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">HR Portal</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavItems items={data.navItems} label="Navigation" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
