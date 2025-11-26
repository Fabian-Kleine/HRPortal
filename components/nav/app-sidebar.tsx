"use client"

import * as React from "react"
import {
  BookUser,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  House,
  Settings2,
  Users,
} from "lucide-react"

import { NavItems, type NavItemGroupT } from "@/components/nav/nav-items"
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

  const userData = {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  }

  const navItemGroups: NavItemGroupT[] = [
    {
      label: t('navigation'),
      items: [
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
      ]
    },
    {
      label: t('hrManagement'),
      items: [
        {
          title: t('employees'),
          url: "/hrmanager/employees",
          icon: BookUser,
          isActive: pathname === "/hrmanager/employees",
        },
        {
          title: t('employeeGroups'),
          url: "/hrmanager/employee-groups",
          icon: Users,
          isActive: pathname === "/hrmanager/employee-groups",
        },
        {
          title: t('requests'),
          url: "/hrmanager/requests",
          icon: CalendarCheck,
          isActive: pathname === "/hrmanager/requests",
        },
        {
          title: t('employeeSettings'),
          url: "/hrmanager/employee-settings",
          icon: Settings2,
          isActive: pathname === "/hrmanager/employee-settings",
        }
      ]
    }
  ];

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
        <NavItems groups={navItemGroups} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
