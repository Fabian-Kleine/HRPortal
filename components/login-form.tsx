"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Field,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useTranslations } from "next-intl"

export function LoginForm({
    className,
    ...props
}: React.ComponentProps<"form">) {
    const t = useTranslations("LoginForm");

    return (
        <form className={cn("flex flex-col gap-6", className)} {...props}>
            <FieldGroup>
                <div className="flex flex-col items-center gap-1 text-center">
                    <h1 className="text-2xl font-bold">{t('title')}</h1>
                    <p className="text-muted-foreground text-sm text-balance">
                        {t('subtitle')}
                    </p>
                </div>
                <Field>
                    <FieldLabel htmlFor="email">{t('emailLabel')}</FieldLabel>
                    <Input id="email" type="email" placeholder={t('emailPlaceholder')} required />
                </Field>
                <Field>
                    <FieldLabel htmlFor="password">{t('passwordLabel')}</FieldLabel>
                    <Input id="password" type="password" required />
                </Field>
                <Field>
                    <Button type="submit">{t('loginButton')}</Button>
                </Field>
            </FieldGroup>
        </form>
    )
}
