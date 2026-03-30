"use client";
import { CartProvider } from '@/hooks/useCart';
import { ThemeProvider } from '@/hooks/useTheme';
import { StoreProvider } from '@/hooks/useStore';

export default function StoreLayout({ children }) {
    return (
        <StoreProvider>
            <ThemeProvider>
                <CartProvider>
                    {children}
                </CartProvider>
            </ThemeProvider>
        </StoreProvider>
    );
}