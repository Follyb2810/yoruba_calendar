"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export type LinkTab = {
  label: string;
  href: string;
};

type LinkTabsProps = {
  tabs: LinkTab[];
  className?: string;
};

export function LinkTabs({ tabs, className }: LinkTabsProps) {
  const pathname = usePathname();

  const baseHref = tabs.reduce(
    (base, tab) => (tab.href.length < base.length ? tab.href : base),
    tabs[0].href
  );

  return (
    <div
      className={cn(
        "flex w-full flex-wrap gap-1 rounded-md bg-muted p-1",
        "sm:inline-flex sm:w-auto sm:flex-nowrap",
        className
      )}
    >
      {tabs.map((tab) => {
        const isBase = tab.href === baseHref;

        const isActive = isBase
          ? pathname === tab.href
          : pathname === tab.href || pathname.startsWith(`${tab.href}/`);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex h-9 flex-1 items-center justify-center rounded-sm px-3 text-sm font-medium transition-all",
              "min-w-32 sm:min-w-0",
              isActive
                ? "bg-background text-foreground shadow"
                : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
