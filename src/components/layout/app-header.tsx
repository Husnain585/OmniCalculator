"use client";

import Link from 'next/link';
import { CircleUser, Package2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { calculatorCategories } from '@/lib/calculators';

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center gap-4 border-b bg-background px-4 sm:px-6">
      <Link href="/" className="flex items-center gap-2 font-semibold text-lg mr-4">
        <Package2 className="h-6 w-6" />
        <span className="sr-only">OmniCalc</span>
      </Link>
      <nav className="hidden md:flex items-center gap-4 text-sm font-medium">
        {calculatorCategories.map((category) => (
          <Link
            href={`/calculators/${category.slug}`}
            key={category.slug}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            {category.name}
          </Link>
        ))}
      </nav>
      <div className="relative ml-auto flex-1 md:grow-0">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search calculators..."
          className="w-full rounded-lg bg-secondary pl-8 md:w-[200px] lg:w-[336px]"
        />
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon" className="rounded-full">
            <CircleUser className="h-5 w-5" />
            <span className="sr-only">Toggle user menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Sign In</DropdownMenuItem>
          <DropdownMenuItem>Sign Up</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Settings</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
