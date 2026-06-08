"use client";
import { CartProvider } from '@/hooks/useCart';
import { StoreThemeProvider } from '@/hooks/useStore';
import { ToastProvider } from '@/components/ui/Toast';

export default function StoreProviders({ children }) {
    return (
        <StoreThemeProvider>
            <CartProvider>
                <ToastProvider position="bottom-right">
                    {children}
                </ToastProvider>
            </CartProvider>
        </StoreThemeProvider>
    );
}
