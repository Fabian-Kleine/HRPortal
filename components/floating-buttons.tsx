'use client'

import { useCallback, useEffect, useState } from "react"
import { useTheme } from 'next-themes'
import { ThemeToggleButton, useThemeTransition } from "@/components/ui/shadcn-io/theme-toggle-button"
import { Button } from "./ui/button";
import useCookie from "@/hooks/use-cookie";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ButtonGroup } from "./ui/button-group";
import { Globe } from "lucide-react";
import { useTranslations } from "next-intl";

export function FloatingButtons() {
    const router = useRouter();
    const t = useTranslations("FloatingButtons");

    const { resolvedTheme, setTheme } = useTheme();
    const { startTransition } = useThemeTransition()
    const [mounted, setMounted] = useState(false);
    const [localeMenuOpen, setLocaleMenuOpen] = useState(false);

    const [_, setLocale] = useCookie<string>('locale', 'en', 365);

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

    function handleLocaleToggle(locale: string) {
        setLocale(locale);
        setLocaleMenuOpen(false);
        router.refresh();
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 flex items-center justify-center flex-col gap-2">
            <ButtonGroup orientation="vertical">
                {localeMenuOpen && (
                    <>
                        <Button
                            variant="outline"
                            size="icon-lg"
                            className="p-2"
                            onClick={() => handleLocaleToggle('en')}
                        >
                            <Image
                                src={'/gb.png'}
                                alt="English"
                                className="object-cover h-full w-full rounded-full"
                                width={36}
                                height={36}
                            />
                            <span className="sr-only">Change language to English</span>
                        </Button>
                        <Button
                            variant="outline"
                            size="icon-lg"
                            className="p-2"
                            onClick={() => handleLocaleToggle('de')}
                        >
                            <Image
                                src={'/de.png'}
                                alt="Deutsch"
                                className="object-cover h-full w-full rounded-full"
                                width={36}
                                height={36}
                            />
                            <span className="sr-only">Sprache auf Deutsch ändern</span>
                        </Button>
                    </>
                )}
                <Button
                    variant="outline"
                    size="icon-lg"
                    className="p-2"
                    onClick={() => setLocaleMenuOpen(!localeMenuOpen)}
                >
                    <Globe />
                    <span className="sr-only">{t('changeLanguage')}</span>
                </Button>
            </ButtonGroup>
            <ThemeToggleButton
                theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
                onClick={handleThemeToggle}
                variant="circle"
                start="bottom-right"
            />
        </div>
    );
}