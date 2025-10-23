'use client'

import { useCallback, useEffect, useState } from "react"
import { useTheme } from 'next-themes'
import { ThemeToggleButton, useThemeTransition } from "@/components/ui/shadcn-io/theme-toggle-button"
import { Button } from "./ui/button";
import useCookie from "@/hooks/use-cookie";
import Image from "next/image";
import { useRouter } from "next/navigation";

export function FloatingButtons() {
    const router = useRouter();

    const { resolvedTheme, setTheme } = useTheme();
    const { startTransition } = useThemeTransition()
    const [mounted, setMounted] = useState(false);

    const [locale, setLocale] = useCookie<string>('locale', 'en', 365);

    useEffect(() => {
        setMounted(true)
    }, []);

    const handleThemeToggle = useCallback(() => {
        const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark'

        startTransition(() => {
            setTheme(newTheme)
        })
    }, [resolvedTheme, setTheme, startTransition]);

    if (!mounted) {
        return null;
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 flex items-center justify-center flex-col gap-2">
            <Button
                variant="outline"
                size="icon-lg"
                className="p-2"
                onClick={() => {
                    const newLocale = locale === 'en' ? 'de' : 'en';
                    setLocale(newLocale);
                    router.refresh();
                }}
            >
                <Image
                    src={locale === 'en' ? '/de.png' : '/gb.png'}
                    alt="Locale"
                    className="object-cover h-full w-full rounded-full"
                    width={36}
                    height={36}
                />
            </Button>
            <ThemeToggleButton
                theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
                onClick={handleThemeToggle}
                variant="circle"
                start="bottom-right"
            />
        </div>
    );
}