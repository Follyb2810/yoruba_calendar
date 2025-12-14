import Link from "next/link";
import React from "react";
import { cn } from "@/lib/utils";

type BaseProps = {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  danger?: boolean;
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
  const { icon, label, active, danger } = props;

  const className = cn(
    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition cursor-pointer",
    active ? "bg-orange-50 text-orange-600 font-medium" : "hover:bg-muted",
    danger && "text-red-500 hover:bg-red-50"
  );

  if ("href" in props) {
    return (
      <Link href={props.href!} className={className}>
        {icon}
        <span>{label}</span>
      </Link>
    );
  }

  return (
    <div onClick={props.onClick} className={className}>
      {icon}
      <span>{label}</span>
    </div>
  );
}
