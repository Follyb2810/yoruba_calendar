import Link from "next/link";
import React from "react";
import { cn } from "@/lib/utils";

type BaseProps = {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  danger?: boolean;
  badge?: number;
};

type LinkProps = BaseProps & {
  href: string;
  onClick?: never;
};

type ButtonProps = BaseProps & {
  onClick: () => void;
  href?: never;
};

export type ISidebarItem = LinkProps | ButtonProps;

export default function SidebarItem(props: ISidebarItem) {
  const { icon, label, active, danger, badge } = props;

  const className = cn(
    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition cursor-pointer",
    active ? "bg-orange-50 text-orange-600 font-medium" : "hover:bg-muted",
    danger && "text-red-500 hover:bg-red-50"
  );

  const content = (
    <>
      {icon}
      <span className="flex-1">{label}</span>
      {badge != null && badge > 0 && (
        <span className="ml-auto min-w-[1.25rem] h-5 px-1.5 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </>
  );

  if ("href" in props) {
    return (
      <Link href={props.href!} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <div onClick={props.onClick} className={className}>
      {content}
    </div>
  );
}
