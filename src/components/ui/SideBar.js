"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { FaUserCircle, FaHeadset, FaSignOutAlt, FaBars, FaTimes } from "react-icons/fa";
import { getSidebarItems } from "@/constants/modules";
import { useRouter } from "next/navigation";
import { removeAuthToken } from "@/services/auth";
import useApiMethods from "@/hooks/useApiMethods";

export default function SideBar({ user, onSupport }) {
    const [openDropdown, setOpenDropdown] = useState(null);
    const [expanded, setExpanded] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [storeConfig, setStoreConfig] = useState(null);

    // En el futuro, filtra sidebarItems según permisos del usuario
    const router = useRouter();
    const items = getSidebarItems(router);
    const { getMethod } = useApiMethods();

    const onLogout = () => {
        localStorage.clear();
        removeAuthToken();
        router.push("/login");
    };

    // Obtener configuración de la tienda
    useEffect(() => {
        const fetchStoreConfig = async () => {
            try {
                const response = await getMethod('/stores/');
                if (response && response.length > 0) {
                    setStoreConfig(response[0]);
                }
            } catch (error) {
                console.error('Error al obtener configuración de la tienda:', error);
            }
        };
        fetchStoreConfig();
    }, []);

    // Detectar si es móvil
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Cerrar menú móvil al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isMobile && mobileMenuOpen && !event.target.closest('.mobile-menu')) {
                setMobileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMobile, mobileMenuOpen]);

    if (isMobile) {
        return (
            <>
                {/* Mobile Navbar */}
                <nav className="fixed top-0 left-0 right-0 bg-white shadow-lg z-50 px-4 py-3 flex items-center justify-between md:hidden">
                    <div className="flex items-center gap-3">
                        {storeConfig?.logo && (
                            <img 
                                src={storeConfig.logo} 
                                alt={storeConfig.name || "Logo"} 
                                className="h-8 w-8 object-contain rounded-lg"
                            />
                        )}
                        <h1 className="text-xl font-bold text-[#223263]">{storeConfig?.name || "Upzet"}</h1>
                    </div>
                    
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-2 rounded-md text-[#223263] hover:bg-[#e6f7f3] transition"
                    >
                        {mobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
                    </button>
                </nav>

                {/* Mobile Menu Overlay */}
                {mobileMenuOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />
                )}

                {/* Mobile Menu Sidebar */}
                <aside className={`
                    mobile-menu fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 md:hidden
                    ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
                `}>
                    <div className="flex items-center justify-between p-4 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-[#223263]">Menú</h2>
                        <button
                            onClick={() => setMobileMenuOpen(false)}
                            className="p-2 rounded-md text-[#223263] hover:bg-[#e6f7f3] transition"
                        >
                            <FaTimes />
                        </button>
                    </div>

                    <nav className="flex-1 px-4 py-6">
                        <ul className="space-y-2">
                            {items.map((item, idx) => (
                                <li key={item.label}>
                                    {item.dropdown ? (
                                        <div>
                                            <button
                                                className={`
                                                    flex items-center w-full px-3 py-3 rounded-md font-medium text-[#223263]
                                                    hover:bg-[#e6f7f3] transition
                                                    ${openDropdown === idx ? "bg-[#e6f7f3]" : ""}
                                                `}
                                                onClick={() =>
                                                    setOpenDropdown(openDropdown === idx ? null : idx)
                                                }
                                            >
                                                <span className="text-xl mr-3">{item.icon}</span>
                                                <span className="flex-1 text-left">{item.label}</span>
                                                <svg
                                                    className={`w-4 h-4 transition-transform ${openDropdown === idx ? "rotate-90" : ""}`}
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M9 5l7 7-7 7"
                                                    />
                                                </svg>
                                            </button>
                                            {openDropdown === idx && (
                                                <ul className="ml-8 mt-1 space-y-1">
                                                    {item.dropdown.map((sub, subIdx) => (
                                                        <li key={sub.label}>
                                                            <button
                                                                className="flex items-center w-full px-3 py-2 rounded-md text-[#495057] hover:bg-[#d1f5ec] transition"
                                                                onClick={() => {
                                                                    sub.onClick();
                                                                    setMobileMenuOpen(false);
                                                                }}
                                                            >
                                                                <span className="mr-2 text-lg">{sub.icon}</span>
                                                                <span>{sub.label}</span>
                                                            </button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    ) : (
                                        <button
                                            className="flex items-center w-full px-3 py-3 rounded-md font-medium text-[#223263] hover:bg-[#e6f7f3] transition"
                                            onClick={() => {
                                                item.onClick();
                                                setMobileMenuOpen(false);
                                            }}
                                        >
                                            <span className="text-xl mr-3">{item.icon}</span>
                                            <span>{item.label}</span>
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <div className="px-4 py-6 border-t border-gray-100 space-y-2">
                        <Link href="/profile">
                            <button
                                className="flex items-center w-full px-3 py-3 rounded-md font-medium text-[#223263] hover:bg-[#e6f7f3] transition"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <span className="text-xl mr-3">
                                    <FaUserCircle />
                                </span>
                                <span>Perfil</span>
                            </button>
                        </Link>
                        <button
                            className="flex items-center w-full px-3 py-3 rounded-md font-medium text-[#223263] hover:bg-[#e6f7f3] transition"
                            onClick={() => {
                                onSupport();
                                setMobileMenuOpen(false);
                            }}
                        >
                            <span className="text-xl mr-3">
                                <FaHeadset />
                            </span>
                            <span>Contactar a soporte</span>
                        </button>
                        <button
                            className="flex items-center w-full px-3 py-3 rounded-md font-medium text-[#223263] hover:bg-[#e6f7f3] transition"
                            onClick={onLogout}
                        >
                            <span className="text-xl mr-3">
                                <FaSignOutAlt />
                            </span>
                            <span>Cerrar sesión</span>
                        </button>
                    </div>
                </aside>

                {/* Spacer for mobile navbar */}
                <div className="h-16 md:hidden" />
            </>
        );
    }

    return (
        <aside
            className={`
                h-screen
                bg-white
                shadow-xl
                flex flex-col justify-between
                transition-all duration-300
                ${expanded ? "w-64" : "w-16"}
                group
                z-30
                hidden md:flex
            `}
            onMouseEnter={() => setExpanded(true)}
            onMouseLeave={() => setExpanded(false)}
        >
            {/* Logo de la tienda */}
            <div className="px-2 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    {storeConfig?.logo && (
                        <img 
                            src={storeConfig.logo} 
                            alt={storeConfig.name || "Logo"} 
                            className="h-10 w-10 object-contain rounded-lg flex-shrink-0"
                        />
                    )}
                    <h1 
                        className={`text-lg font-bold text-[#223263] transition-all duration-300 ${
                            expanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
                        }`}
                    >
                        {storeConfig?.name || "Upzet"}
                    </h1>
                </div>
            </div>
            <nav className="flex-1 px-2 py-8">
                <ul className="space-y-2">
                    {items.map((item, idx) => (
                        <li key={item.label}>
                            {item.dropdown ? (
                                <div>
                                    <button
                                        style={{cursor: "pointer"}}
                                        className={`
                                            flex items-center w-full px-2 py-2 rounded-md font-medium text-[#223263]
                                            hover:bg-[#e6f7f3] transition group
                                            ${openDropdown === idx ? "bg-[#e6f7f3]" : ""}
                                        `}
                                        onClick={() =>
                                            setOpenDropdown(openDropdown === idx ? null : idx)
                                        }
                                    >
                                        <span className="text-xl flex-shrink-0">{item.icon}</span>
                                        <span
                                            className={`
                                                flex-1 text-left ml-3
                                                transition-all duration-300
                                                ${expanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}
                                            `}
                                        >
                                            {item.label}
                                        </span>
                                        <svg
                                            className={`
                                                w-4 h-4 ml-2 transition-transform
                                                ${openDropdown === idx ? "rotate-90" : ""}
                                                ${expanded ? "opacity-100" : "opacity-0"}
                                            `}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 5l7 7-7 7"
                                            />
                                        </svg>
                                    </button>
                                    {openDropdown === idx && expanded && (
                                        <ul className="ml-8 mt-1 space-y-1">
                                            {item.dropdown.map((sub, subIdx) => (
                                                <li key={sub.label}>
                                                    <button
                                                        className="flex items-center w-full px-2 py-2 rounded-md text-[#495057] hover:bg-[#d1f5ec] transition"
                                                        onClick={sub.onClick}
                                                    >
                                                        <span className="mr-2 text-lg">{sub.icon}</span>
                                                        <span>{sub.label}</span>
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ) : (
                                <button
                                    className="flex items-center w-full px-2 py-2 rounded-md font-medium text-[#223263] hover:bg-[#e6f7f3] transition"
                                    onClick={item.onClick}
                                    style={{cursor: "pointer"}}
                                >
                                    <span className="text-xl flex-shrink-0">{item.icon}</span>
                                    <span
                                        className={`
                                            ml-3 transition-all duration-300
                                            ${expanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}
                                        `}
                                    >
                                        {item.label}
                                    </span>
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="px-2 py-6 border-t border-gray-100 space-y-2">
                <Link href="/profile">
                    <button
                        className="flex items-center w-full px-2 py-2 rounded-md font-medium text-[#223263] hover:bg-[#e6f7f3] transition"
                        style={{cursor: "pointer"}}
                    >
                        <span className="text-xl flex-shrink-0">
                            <FaUserCircle />
                        </span>
                        <span
                            className={`
                                ml-3 transition-all duration-300
                                ${expanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}
                            `}
                        >
                            Perfil
                        </span>
                    </button>
                </Link>
                <button
                    className="flex items-center w-full px-2 py-2 rounded-md font-medium text-[#223263] hover:bg-[#e6f7f3] transition"
                    onClick={onSupport}
                    style={{cursor: "pointer"}}
                >
                    <span className="text-xl flex-shrink-0">
                        <FaHeadset />
                    </span>
                    <span
                        className={`
                            ml-3 transition-all duration-300
                            ${expanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}
                        `}
                    >
                        Contactar a soporte
                    </span>
                </button>
                <button
                    className="flex items-center w-full px-2 py-2 rounded-md font-medium text-[#223263] hover:bg-[#e6f7f3] transition"
                    onClick={onLogout}
                    style={{cursor: "pointer"}}
                >
                    <span className="text-xl flex-shrink-0">
                        <FaSignOutAlt />
                    </span>
                    <span
                        className={`
                            ml-3 transition-all duration-300
                            ${expanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}
                        `}
                    >
                        Cerrar sesión
                    </span>
                </button>
            </div>
        </aside>
    );
};