"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { calculatorCategories } from '@/lib/calculators';
import { Home, Package2, Settings } from 'lucide-react';

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader>
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-lg"
        >
          <Package2 className="h-6 w-6" />
          <span className="group-data-[collapsible=icon]:hidden">OmniCalc</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/" legacyBehavior passHref>
              <SidebarMenuButton isActive={pathname === '/'} tooltip="Home">
                <Home />
                <span>Home</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarGroup>
          <SidebarGroupLabel>Categories</SidebarGroupLabel>
          <SidebarMenu>
            {calculatorCategories.map((category) => (
              <SidebarMenuItem key={category.slug}>
                <Link
                  href={`/calculators/${category.slug}`}
                  legacyBehavior
                  passHref
                >
                  <SidebarMenuButton
                    isActive={pathname.startsWith(
                      `/calculators/${category.slug}`
                    )}
                    tooltip={category.name}
                  >
                    <category.icon />
                    <span>{category.name}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Settings">
              <Settings />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
