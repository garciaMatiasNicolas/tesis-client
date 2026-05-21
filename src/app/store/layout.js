import { headers } from 'next/headers';
import StoreProviders from './StoreProviders';

async function fetchStoreConfig() {
    const headersList = await headers();
    const host = headersList.get('host') || '';
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const environment = process.env.NEXT_PUBLIC_ENVIRONMENT || 'development';
    const protocol = environment === 'development' ? 'http' : 'https';
    const hostname = host.split(':')[0].split('.')[0];

    let url;
    let fetchHeaders = {};

    url = `${protocol}://${hostname}.${apiUrl}/config/`;
    
    const res = await fetch(url, {
        headers: fetchHeaders,
        next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
}

export async function generateMetadata() {
    try {
        const config = await fetchStoreConfig();
        if (!config?.is_active) return { title: 'Tienda' };
        return {
            title: config.name,
            icons: config.logo ? { icon: config.logo } : undefined,
        };
    } catch {
        return { title: 'Tienda' };
    }
}

export default function StoreLayout({ children }) {
    return <StoreProviders>{children}</StoreProviders>;
}
