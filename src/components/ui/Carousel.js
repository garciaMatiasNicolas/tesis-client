"use client"
import React, { useRef, useEffect, useState } from 'react'
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

// Hook para detectar el ancho de la ventana y ajustar items por slide según breakpoints pedidos
function useItemsPerSlide() {
    const [items, setItems] = useState(2);

    useEffect(() => {
        function handleResize() {
            if (window.innerWidth < 600) setItems(1);         // Mobile: 1 card
            else if (window.innerWidth < 900) setItems(2);    // Tablet: 2 cards (desde 600px hasta 899px)
            else setItems(4);                                 // Desktop: grid, no carrusel
        }
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);
    return items;
}

const Carousel = ({ children, className = "" }) => {
    const containerRef = useRef(null);
    const itemsPerSlide = useItemsPerSlide();

    const scroll = (direction) => {
        const container = containerRef.current;
        if (!container) return;
        const card = container.querySelector("div[data-card]");
        if (!card) return;
        const cardWidth = card.offsetWidth + 16; // 16px gap
        container.scrollBy({
            left: direction * cardWidth * itemsPerSlide,
            behavior: "smooth"
        });
    };

    // Calcula el ancho de cada card dinámicamente
    const cardWidth = itemsPerSlide > 0 ? `calc((100% - ${(itemsPerSlide - 1) * 16}px) / ${itemsPerSlide})` : "100%";

    return (
        <div className={`relative w-full ${className}`}>
            <button
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-200 rounded-full p-2 shadow hover:bg-gray-100 transition cursor-pointer flex"
                onClick={() => scroll(-1)}
                aria-label="Anterior"
                type="button"
            >
                <FaChevronLeft />
            </button>
            <div
                ref={containerRef}
                className="flex overflow-x-auto no-scrollbar scroll-smooth gap-4 py-1 px-1"
                style={{ scrollSnapType: "x mandatory" }}
            >
                {React.Children.map(children, (child, idx) => (
                    <div
                        data-card
                        className="flex-shrink-0"
                        style={{
                            width: cardWidth,
                            minWidth: cardWidth,
                            maxWidth: cardWidth,
                            scrollSnapAlign: "start"
                        }}
                    >
                        {child}
                    </div>
                ))}
            </div>
            <button
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-200 rounded-full p-2 shadow hover:bg-gray-100 transition cursor-pointer flex"
                onClick={() => scroll(1)}
                aria-label="Siguiente"
                type="button"
            >
                <FaChevronRight />
            </button>
        </div>
    );
};

export default Carousel;