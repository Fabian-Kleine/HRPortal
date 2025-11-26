"use client"

import { type LucideIcon } from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { Route } from "next"

export interface NavItemGroupT {
  items: {
    title: string
    url: Route
    icon?: LucideIcon
    isActive?: boolean
  }[]
  label?: string
  isVisible?: boolean
}

interface NavItemsProps {
  groups: NavItemGroupT[]
}

export function NavItems({
  groups
}: NavItemsProps) {
  return (
    <>
      {groups.filter(group => group.isVisible !== false).map((group, index) => (
        <SidebarGroup key={index}>
          {group.label && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
          <SidebarMenu>
            {group.items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={item.isActive}>
                  <Link href={item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </>
  )
}