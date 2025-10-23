"use client";

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import Link from "next/link";
import React from "react";

export default function NavBreadcrumb() {
    const t = useTranslations("NavBreadcrumb");
    const pathname = usePathname();

    const segments = pathname
        .replace(/^\/hrportal/, "")
        .split("/")
        .filter(Boolean);

    return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    HR Portal
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
                                    <Link href={href}>{t(`items.${segment}`)}</Link>
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