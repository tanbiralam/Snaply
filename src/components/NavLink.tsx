"use client";

import Link, { LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import { AnchorHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface NavLinkCompatProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "className">,
    Omit<LinkProps, "href"> {
  to: LinkProps["href"];
  className?: string;
  activeClassName?: string;
  pendingClassName?: string;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, pendingClassName: _pendingClassName, to, ...props }, ref) => {
    const pathname = usePathname();
    const href = typeof to === "string" ? to : to.pathname ?? "";
    const normalizedHref = href === "/" ? "/" : href.replace(/\/$/, "");
    const normalizedPathname =
      pathname === "/" ? "/" : pathname.replace(/\/$/, "");
    const isActive = normalizedPathname === normalizedHref;

    return (
      <Link
        ref={ref}
        href={to}
        className={cn(className, isActive && activeClassName)}
        {...props}
      />
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };
