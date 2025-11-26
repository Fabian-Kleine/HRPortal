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
import { useSession } from "next-auth/react"
import { Route } from "next"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const t = useTranslations("AppSidebar");
  const pathname = usePathname();
  const { data: session } = useSession();

  const userData = {
    name: session?.user?.name || "User",
    email: session?.user?.email || "",
    avatar: session?.user?.image || "",
  }

  const hrManagementGroup: NavItemGroupT = {
    label: t('hrManagement'),
    items: [
      {
        title: t('employees'),
        url: "/hrmanager/employees" as Route,
        icon: BookUser,
        isActive: pathname === "/hrmanager/employees",
      },
      {
        title: t('employeeGroups'),
        url: "/hrmanager/employee-groups" as Route,
        icon: Users,
        isActive: pathname === "/hrmanager/employee-groups",
      },
      {
        title: t('requests'),
        url: "/hrmanager/requests" as Route,
        icon: CalendarCheck,
        isActive: pathname === "/hrmanager/requests",
      },
      {
        title: t('employeeSettings'),
        url: "/hrmanager/employee-settings" as Route,
        icon: Settings2,
        isActive: pathname === "/hrmanager/employee-settings",
      }
    ]
  };

  const navItemGroups: NavItemGroupT[] = [
    {
      label: t('navigation'),
      items: [
        {
          title: t('home'),
          url: "/hrportal/home" as Route,
          icon: House,
          isActive: pathname === "/hrportal/home",
        },
        {
          title: t('calendar'),
          url: "/hrportal/calendar" as Route,
          icon: CalendarDays,
          isActive: pathname === "/hrportal/calendar",
        },
        {
          title: t('timeRecords'),
          url: "/hrportal/timerecords" as Route,
          icon: CalendarClock,
          isActive: pathname === "/hrportal/timerecords",
        },
      ]
    },
    ...(session?.user?.isAdmin ? [hrManagementGroup] : [])
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
