import { NextResponse } from 'next/server';

export function middleware(request) {
    const hostname = request.headers.get('host'); // ejemplo: "zapateriarocio.com"
    const url = request.nextUrl.clone();

    if (hostname === 'admin.mitienda.com') {
        url.pathname = `/admin${url.pathname}`;
        return NextResponse.rewrite(url);
    }

    const store = getStoreByDomain(hostname); // buscás en tu DB
    if (store) {
        url.pathname = `/store/${store.slug}${url.pathname}`;
        return NextResponse.rewrite(url);
    }

    return NextResponse.next();
}
