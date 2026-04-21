"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import useEcommerceService from '@/services/ecommerceService';
import { useCart } from '@/hooks/useCart';
import { useStoreWithTheme } from '@/hooks/useStore';
import StoreHeader from '@/components/store/StoreHeader';
import { formatPrice } from '@/utils/formatData';
import Link from 'next/link';

export default function ProductDetailPage() {
    const router = useRouter();
    const params = useParams();
    const productId = params.id;

    const { getProductById } = useEcommerceService();
    const { addToCart, getTotalCartItems } = useCart();
    const { 
        isDarkMode, 
        theme, 
        storeConfig, 
        storeActive, 
        loading: storeLoading 
    } = useStoreWithTheme();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [mounted, setMounted] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [showLightbox, setShowLightbox] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (productId) {
            loadProduct();
        }
    }, [productId]);

    // Reset image loading cuando cambia la imagen seleccionada
    useEffect(() => {
        setImageLoading(true);
        console.log('Selected image changed to:', selectedImage);
        
        // Timeout de seguridad para evitar que la imagen se quede cargando eternamente
        const loadTimeout = setTimeout(() => {
            console.log('Image load timeout - forcing imageLoading to false');
            setImageLoading(false);
        }, 3000);
        
        return () => clearTimeout(loadTimeout);
    }, [selectedImage]);

    // Prevenir scroll cuando el lightbox está abierto
    useEffect(() => {
        if (showLightbox) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showLightbox]);

    // Cerrar lightbox con tecla Escape
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && showLightbox) {
                setShowLightbox(false);
            }
        };

        if (showLightbox) {
            window.addEventListener('keydown', handleEscape);
        }

        return () => {
            window.removeEventListener('keydown', handleEscape);
        };
    }, [showLightbox]);

    const loadProduct = async () => {
        try {
            setLoading(true);
            setImageLoading(true);
            setSelectedImage(0); // Reset a la primera imagen
            const data = await getProductById(productId);
            console.log('Product data loaded:', data);
            console.log('Images:', {
                images: data.images,
                image_1: data.image_1,
                image_2: data.image_2,
                image_3: data.image_3,
                image: data.image
            });
            setProduct(data);
            setImageError(false); // Reset error state
        } catch (error) {
            console.error('Error al cargar producto:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageError = () => {
        setImageError(true);
        setImageLoading(false);
    };

    const handleImageLoad = () => {
        setImageLoading(false);
    };

    const getOptimizedImageUrl = (url, isLightbox = false) => {
        if (!url || imageError) return null;
        
        // Convertir a string si no lo es
        const urlString = String(url);
        
        // Devolver la URL tal cual (ya es del servidor local)
        return urlString;
    };

    const handleAddToCart = () => {
        if (product && product.stock !== false) {
            for (let i = 0; i < quantity; i++) {
                addToCart(product);
            }
            // Mostrar feedback visual (opcional)
            alert(`${quantity} ${quantity === 1 ? 'unidad agregada' : 'unidades agregadas'} al carrito`);
        }
    };

    // Prevenir problemas de hidratación
    if (!mounted) {
        return null;
    }

    if (storeLoading || loading) {
        return (
            <div 
                className="min-h-screen"
                style={{
                    backgroundColor: isDarkMode ? theme?.background?.dark?.main : theme?.background?.light?.main
                }}
            >
                <StoreHeader 
                    isDarkMode={isDarkMode} 
                    theme={theme} 
                    storeConfig={storeConfig}
                    getTotalCartItems={getTotalCartItems}
                />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="animate-pulse">
                        <div className="h-8 w-64 rounded mb-8" style={{backgroundColor: theme?.background?.dark?.elevated}}></div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            <div className="h-96 rounded-xl" style={{backgroundColor: theme?.background?.dark?.elevated}}></div>
                            <div className="space-y-4">
                                <div className="h-12 rounded" style={{backgroundColor: theme?.background?.dark?.elevated}}></div>
                                <div className="h-8 rounded w-32" style={{backgroundColor: theme?.background?.dark?.elevated}}></div>
                                <div className="h-24 rounded" style={{backgroundColor: theme?.background?.dark?.elevated}}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div 
                className="min-h-screen"
                style={{
                    backgroundColor: isDarkMode ? theme.background.dark.main : theme.background.light.main
                }}
            >
                <StoreHeader 
                    isDarkMode={isDarkMode} 
                    theme={theme} 
                    storeConfig={storeConfig}
                    getTotalCartItems={getTotalCartItems}
                />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
                    <h1 className="text-2xl font-bold mb-4" style={{color: theme.text.dark.primary}}>
                        Producto no encontrado
                    </h1>
                    <Link href="/store">
                        <button 
                            className="px-6 py-3 rounded-lg text-white font-semibold"
                            style={{background: theme.primary.gradient}}
                        >
                            Volver a la tienda
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    const isOutOfStock = product.stock === false;
    const hasValidImage = product.image && !imageError;
    const optimizedImageUrl = getOptimizedImageUrl(product.image);
    
    // Construir array de imágenes desde el producto
    const productImages = [];
    if (product.images && Array.isArray(product.images)) {
        product.images.forEach(img => {
            if (img) productImages.push(getOptimizedImageUrl(img));
        });
    } else {
        // Fallback: construir desde image_1, image_2, image_3
        if (product.image_1) productImages.push(getOptimizedImageUrl(product.image_1));
        if (product.image_2) productImages.push(getOptimizedImageUrl(product.image_2));
        if (product.image_3) productImages.push(getOptimizedImageUrl(product.image_3));
        // Si no hay nada, usar image
        if (productImages.length === 0 && product.image) {
            productImages.push(getOptimizedImageUrl(product.image));
        }
    }
    
    console.log('Building productImages:', {
        hasImagesArray: product.images && Array.isArray(product.images),
        imagesArray: product.images,
        image_1: product.image_1,
        image_2: product.image_2,
        image_3: product.image_3,
        image: product.image,
        productImages: productImages
    });
    
    const images = productImages.filter(img => img && img !== null && img !== 'null' && img !== '');
    const hasImages = images.length > 0;
    
    console.log('Product images array:', { 
        productImages, 
        images, 
        hasImages, 
        selectedImage,
        currentImageUrl: images[selectedImage],
        allImageUrls: images
    });

    return (
        <div 
            className="min-h-screen transition-colors duration-300"
            style={{
                backgroundColor: isDarkMode ? theme.background.dark.main : theme.background.light.main
            }}
        >
            <StoreHeader 
                isDarkMode={isDarkMode} 
                theme={theme} 
                storeConfig={storeConfig}
                getTotalCartItems={getTotalCartItems}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 mb-8 text-sm">
                    <Link 
                        href="/store"
                        className="hover:underline"
                        style={{color: isDarkMode ? theme.text.dark.muted : theme.text.light.muted}}
                    >
                        Tienda
                    </Link>
                    <span style={{color: isDarkMode ? theme.text.dark.muted : theme.text.light.muted}}>/</span>
                    {product.category && (
                        <>
                            <span style={{color: isDarkMode ? theme.text.dark.muted : theme.text.light.muted}}>
                                {product.category.name}
                            </span>
                            <span style={{color: isDarkMode ? theme.text.dark.muted : theme.text.light.muted}}>/</span>
                        </>
                    )}
                    <span style={{color: isDarkMode ? theme.text.dark.primary : theme.text.light.primary}}>
                        {product.sku}
                    </span>
                </nav>

                {/* Grid Principal */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
                    {/* Columna Izquierda - Imágenes */}
                    <div className="space-y-4">
                        {/* Imagen Principal */}
                        <div 
                            className="relative rounded-xl overflow-hidden shadow-lg group cursor-pointer"
                            style={{
                                backgroundColor: isDarkMode ? theme.background.dark.elevated : theme.background.light.elevated,
                                aspectRatio: '1/1'
                            }}
                            onClick={() => hasImages && setShowLightbox(true)}
                        >
                            {hasImages ? (
                                <>
                                    {/* Skeleton/Loading mientras carga */}
                                    {imageLoading && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="animate-pulse w-full h-full flex items-center justify-center">
                                                <svg 
                                                    className="w-24 h-24 animate-spin"
                                                    style={{color: theme.primary.main}}
                                                    fill="none" 
                                                    stroke="currentColor" 
                                                    viewBox="0 0 24 24"
                                                >
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            </div>
                                        </div>
                                    )}
                                    {images[selectedImage] ? (
                                        <img
                                            src={images[selectedImage]}
                                            alt={product.description}
                                            className={`w-full h-full object-contain transition-all duration-500 ${imageLoading ? 'opacity-0' : 'opacity-100'} ${isOutOfStock ? 'grayscale opacity-60' : 'group-hover:scale-105'}`}
                                            onError={(e) => {
                                                console.error('Error loading main image:', selectedImage, images[selectedImage]);
                                                handleImageError();
                                            }}
                                            onLoad={() => {
                                                console.log('Image loaded successfully:', selectedImage, images[selectedImage]);
                                                handleImageLoad();
                                            }}
                                            loading="eager"
                                        />
                                    ) : (
                                        <div className={`w-full h-full flex items-center justify-center ${isOutOfStock ? 'grayscale opacity-60' : ''}`}>
                                            <svg
                                                className="w-32 h-32"
                                                style={{color: isDarkMode ? theme.text.dark.muted : theme.text.light.muted}}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    )}
                                    {/* Overlay de zoom al hover */}
                                    {!imageLoading && images[selectedImage] && (
                                        <div className="absolute inset-0 transition-all duration-300 flex items-center justify-center group-hover:bg-black group-hover:bg-opacity-10">
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white bg-opacity-90 rounded-full p-3">
                                                <svg className="w-8 h-8" style={{color: theme.primary.main}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                                </svg>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className={`w-full h-full flex items-center justify-center ${isOutOfStock ? 'grayscale opacity-60' : ''}`}>
                                    <svg
                                        className="w-32 h-32"
                                        style={{color: isDarkMode ? theme.text.dark.muted : theme.text.light.muted}}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            )}
                            
                            {/* Título y categoría del producto sobre la imagen */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6 pt-5">
                                {product.category && (
                                    <span 
                                        className="inline-block px-3 py-1 rounded-lg text-xs font-semibold text-white mb-2"
                                        style={{ background: theme.primary.gradient }}
                                    >
                                        {product.category.name}
                                    </span>
                                )}
                                <h1 className="text-white text-2xl font-bold drop-shadow-lg">
                                    {product.description}
                                </h1>
                                <p className="text-white/80 text-sm mt-1">SKU: {product.sku}</p>
                            </div>
                            
                            {/* Badge de Sin Stock */}
                            {isOutOfStock && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
                                    <div className="text-center">
                                        <div className="bg-red-600 text-white text-2xl font-bold px-10 py-5 rounded-xl shadow-2xl mb-3">
                                            SIN STOCK
                                        </div>
                                        <p className="text-white">Producto no disponible</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Miniaturas (si hay más imágenes) */}
                        {images.length > 1 && (
                            <div className="grid grid-cols-4 gap-3">
                                {images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            console.log('Clicking thumbnail', idx, 'Current:', selectedImage);
                                            setSelectedImage(idx);
                                        }}
                                        className="relative rounded-lg overflow-hidden aspect-square transition-all duration-200 hover:scale-105"
                                        style={{
                                            backgroundColor: isDarkMode ? theme.background.dark.elevated : theme.background.light.elevated,
                                            border: selectedImage === idx ? `3px solid ${theme.primary.main}` : `1px solid ${isDarkMode ? theme.border.dark.light : theme.border.light.light}`
                                        }}
                                    >
                                        <img 
                                            src={img} 
                                            alt={`Vista ${idx + 1}`} 
                                            className="w-full h-full object-contain"
                                            onError={(e) => {
                                                console.error('Error loading thumbnail', idx, img);
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    </button>
                                ))}
                            </div>
                        )}

                    </div>

                    {/* Columna Derecha - Información */}
                    <div className="space-y-6">
                        {/* Categorías */}
                        {product.subcategory && (
                            <div className="flex flex-wrap gap-2 mb-4">
                                <span 
                                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
                                    style={{
                                        backgroundColor: isDarkMode ? theme.background.dark.elevated : theme.background.light.elevated,
                                        color: isDarkMode ? theme.text.dark.primary : theme.text.light.primary,
                                        border: `1px solid ${isDarkMode ? theme.border.dark.main : theme.border.light.main}`
                                    }}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                    </svg>
                                    {product.subcategory.name}
                                </span>
                            </div>
                        )}

                        <div className="mb-4">
                            <h2 style={{color: isDarkMode ? theme.text.dark.primary : theme.text.light.primary}} className="text-lg font-semibold flex items-center">{product.description}</h2>
                        </div>

                        {/* Precio Simple */}
                        <div className="mb-4">
                            <p className="text-sm mb-2" style={{color: isDarkMode ? theme.text.dark.muted : theme.text.light.muted}}>
                                Precio
                            </p>
                            <div className="flex items-baseline gap-2">
                                <span 
                                    className="text-5xl font-bold"
                                    style={{ color: theme.primary.main }}
                                >
                                    {formatPrice(product.price)}
                                </span>
                            </div>
                        </div>

                        {/* Selector de cantidad */}
                        {!isOutOfStock && (
                            <div>
                                <label className="block text-sm font-semibold mb-3" style={{color: isDarkMode ? theme.text.dark.primary : theme.text.light.primary}}>
                                    Cantidad
                                </label>
                                <div className="flex items-center gap-4">
                                    <div 
                                        className="flex items-center rounded-lg overflow-hidden"
                                        style={{
                                            backgroundColor: isDarkMode ? theme.background.dark.elevated : theme.background.light.elevated,
                                            border: `1px solid ${isDarkMode ? theme.border.dark.main : theme.border.light.main}`
                                        }}
                                    >
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="px-5 py-3 font-bold text-xl hover:opacity-80 transition-opacity"
                                            style={{color: isDarkMode ? theme.text.dark.primary : theme.text.light.primary}}
                                        >
                                            −
                                        </button>
                                        <div 
                                            className="px-6 py-3 min-w-[60px] text-center font-bold text-lg"
                                            style={{
                                                borderLeft: `1px solid ${isDarkMode ? theme.border.dark.main : theme.border.light.main}`,
                                                borderRight: `1px solid ${isDarkMode ? theme.border.dark.main : theme.border.light.main}`,
                                                color: isDarkMode ? theme.text.dark.primary : theme.text.light.primary
                                            }}
                                        >
                                            {quantity}
                                        </div>
                                        <button
                                            onClick={() => setQuantity(quantity + 1)}
                                            className="px-5 py-3 font-bold text-xl hover:opacity-80 transition-opacity"
                                            style={{color: isDarkMode ? theme.text.dark.primary : theme.text.light.primary}}
                                        >
                                            +
                                        </button>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm" style={{color: isDarkMode ? theme.text.dark.muted : theme.text.light.muted}}>
                                            Total: <span className="font-bold text-xl" style={{color: theme.primary.main}}>{formatPrice(product.price * quantity)}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Botón Agregar al Carrito */}
                        <div className="pt-2">
                            {isOutOfStock ? (
                                <div 
                                    className="w-full py-5 px-6 rounded-xl font-bold text-center flex items-center justify-center gap-3 text-lg bg-red-50 border-2 border-red-500 text-red-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    Producto sin stock disponible
                                </div>
                            ) : (
                                <button
                                    onClick={handleAddToCart}
                                    className="w-full py-5 px-6 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center justify-center gap-3 text-white text-lg"
                                    style={{ 
                                        background: theme.primary.gradient,
                                        boxShadow: `0 10px 30px ${theme.primary.main}40`
                                    }}
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    Agregar +
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Botón volver */}
                <div className="mt-8 text-center">
                    <Link href="/store">
                        <button 
                            className="px-8 py-3 rounded-lg font-semibold transition-all hover:scale-105 flex items-center gap-2 mx-auto"
                            style={{
                                backgroundColor: isDarkMode ? theme.background.dark.elevated : theme.background.light.elevated,
                                color: isDarkMode ? theme.text.dark.primary : theme.text.light.primary,
                                border: `1px solid ${isDarkMode ? theme.border.dark.main : theme.border.light.main}`
                            }}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Volver a la tienda
                        </button>
                    </Link>
                </div>
            </div>

            {/* Lightbox Modal para ver imagen ampliada */}
            {showLightbox && hasValidImage && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 "
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.86)' }}
                    onClick={() => setShowLightbox(false)}
                >
                    {/* Botón cerrar */}
                    <button
                        className="absolute top-4 right-4 p-3 rounded-full bg-white bg-opacity-30 hover:bg-opacity-50 transition-all z-10 group shadow-lg"
                        onClick={() => setShowLightbox(false)}
                        aria-label="Cerrar"
                        style={{cursor: "pointer"}}
                    >
                        <svg 
                            className="w-8 h-8 text-black" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24" 
                            strokeWidth={3}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Contenedor de la imagen */}
                    <div 
                        className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={getOptimizedImageUrl(images[selectedImage], true)}
                            alt={product.description}
                            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                            style={{
                                filter: isOutOfStock ? 'grayscale(100%)' : 'none'
                            }}
                            onError={(e) => {
                                console.error('Error loading lightbox image:', images[selectedImage]);
                                e.target.style.display = 'none';
                            }}
                        />

                        {/* Info del producto en lightbox */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 rounded-b-lg">
                            <h3 className="text-white text-2xl font-bold mb-2">
                                {product.description}
                            </h3>
                            <div className="flex items-center gap-4">
                                <span className="text-white text-xl">
                                    SKU: {product.sku}
                                </span>
                                {product.category && (
                                    <span 
                                        className="px-3 py-1 rounded-full text-sm font-medium text-white"
                                        style={{background: theme.primary.gradient}}
                                    >
                                        {product.category.name}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Navegación si hay múltiples imágenes */}
                        {images.length > 1 && (
                            <>
                                <button
                                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all text-white"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
                                    }}
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <button
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all text-white"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
                                    }}
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </>
                        )}
                    </div>

                    {/* Indicador de imágenes */}
                    {images.length > 1 && (
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
                            {images.map((_, idx) => (
                                <button
                                    key={idx}
                                    className={`w-2 h-2 rounded-full transition-all ${selectedImage === idx ? 'w-8' : ''}`}
                                    style={{
                                        backgroundColor: selectedImage === idx ? theme.primary.main : '#ffffff80'
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedImage(idx);
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
