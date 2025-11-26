"use client";

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import Link from "next/link";
import React from "react";
import { Route } from "next";

export default function NavBreadcrumb() {
    const t = useTranslations("NavBreadcrumb");
    const pathname = usePathname();

    const subpath = pathname.includes("hrportal") ? "hrportal" : "hrmanager";

    const segments = pathname
        .replace(new RegExp(`^/${subpath}`), "")
        .split("/")
        .filter(Boolean);

    return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                   {pathname.includes("hrportal") ? "HR Portal" : "HR Managemer"}
                </BreadcrumbItem>

                {segments.length > 0 && (
                    <BreadcrumbSeparator />
                )}

                {segments.map((segment, index) => {
                    const href = `/hrportal/${segments.slice(0, index + 1).join("/")}`;

                    return (
                        <React.Fragment key={href}>
                            <BreadcrumbItem>
                                <BreadcrumbLink asChild>
                                    <Link href={href as Route}>{t(`items.${segment}`)}</Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            {index < segments.length - 1 && (
                                <BreadcrumbSeparator />
                            )}
                        </React.Fragment>
                    );
                })}
            </BreadcrumbList>
        </Breadcrumb>
    );
}