import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

const locales = ['en', 'de'];

export default getRequestConfig(async () => {
    // Get locale from cookie or fall back to 'en'
    const cookieStore = cookies();
    const rawLocale = (await cookieStore).get('locale')?.value || 'en';
    let locale = rawLocale.replace(/^"|"$/g, '');

    if (!locales.includes(locale)) {
        locale = "en";
    }

    return {
        locale,
        messages: (await import(`./messages/${locale}.json`)).default
    };
});