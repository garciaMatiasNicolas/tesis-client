"use client";
import { CartProvider } from '@/hooks/useCart';
import { StoreThemeProvider } from '@/hooks/useStore';

export default function StoreLayout({ children }) {
    return (
        <StoreThemeProvider>
            <CartProvider>
                {children}
            </CartProvider>
        </StoreThemeProvider>
    );
}