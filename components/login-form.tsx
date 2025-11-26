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
import PasswordInput from "./ui/inputs/password-input"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

export function LoginForm({
    className,
    ...props
}: React.ComponentProps<"form">) {
    const t = useTranslations("LoginForm");
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError(t('invalidCredentials'));
            } else {
                router.push("/hrportal/home");
                router.refresh();
            }
        } catch {
            setError(t('loginError'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit} {...props}>
            <FieldGroup>
                <div className="flex flex-col items-center gap-1 text-center">
                    <h1 className="text-2xl font-bold">{t('title')}</h1>
                    <p className="text-muted-foreground text-sm text-balance">
                        {t('subtitle')}
                    </p>
                </div>
                {error && (
                    <div className="text-sm text-destructive text-center p-2 bg-destructive/10 rounded-md">
                        {error}
                    </div>
                )}
                <Field>
                    <FieldLabel htmlFor="email">{t('emailLabel')}</FieldLabel>
                    <Input 
                        id="email" 
                        type="email" 
                        placeholder={t('emailPlaceholder')} 
                        required 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                    />
                </Field>
                <Field>
                    <FieldLabel htmlFor="password">{t('passwordLabel')}</FieldLabel>
                    <PasswordInput 
                        id="password" 
                        placeholder="******" 
                        required 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                    />
                </Field>
                <Field>
                    <Button type="submit" isLoading={isLoading}>
                        {isLoading ? t('loggingIn') : t('loginButton')}
                    </Button>
                </Field>
            </FieldGroup>
        </form>
    )
}
