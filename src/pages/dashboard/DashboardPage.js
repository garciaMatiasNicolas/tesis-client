"use client"
import React from 'react'
import SideBar from '../../components/ui/SideBar'
import { FaCheckCircle, FaTruck, FaCreditCard } from "react-icons/fa"
import Carousel from '@/components/ui/Carousel';

const quickActions = [
    {
        icon: <FaCheckCircle className="text-[#18c29c] text-3xl" />,
        title: "Layout",
        action: "Personalizar",
        onClick: () => alert("Personalizar layout"),
        completed: true,
    },
    {
        icon: <FaCheckCircle className="text-[#18c29c] text-3xl" />,
        title: "Productos",
        action: "Agregar",
        onClick: () => alert("Agregar productos"),
        completed: true,
    },
    {
        icon: <FaTruck className="text-[#18c29c] text-3xl" />,
        title: "Medios de envío",
        action: "Configurar",
        onClick: () => alert("Configurar envíos"),
        completed: false,
    },
    {
        icon: <FaCreditCard className="text-[#18c29c] text-3xl" />,
        title: "Medios de pago",
        action: "Configurar",
        onClick: () => alert("Configurar pagos"),
        completed: false,
    },
];

const freeContents = [
    {
        title: "Armé mi tienda online, ¿y ahora cómo genero ventas?",
        url: "#"
    },
    {
        title: "Paso a paso: ¿cómo hacer marketing digital?",
        url: "#"
    },
    {
        title: "Logística para e-commerce: lucí tu marca en envíos con Tiendanube",
        url: "#"
    }
];

const DashboardPage = () => {
    return (
        <div className="flex min-h-screen bg-[#f8fafc]">
            <SideBar />
            <main className="flex-1 p-8 h-screen overflow-y-auto">
                <h1 className="text-2xl font-bold mb-2">Inicio</h1>
                <h2 className="text-lg font-semibold mb-1">¡Hola, Happy Coffee!</h2>
                <p className="mb-6 text-gray-700">¿Qué tal seguir configurando tu tienda?</p>

                {/* Quick Actions Responsive */}
                <div className="mb-8">
                    {/* Desktop grid */}
                    <div className="hidden md:grid grid-cols-4 gap-4">
                        {quickActions.map((item, idx) => (
                            <div
                                key={item.title}
                                className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col items-start shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-1 hover:border-[#18c29c] cursor-pointer"
                                onClick={item.onClick}
                            >
                                <div className="mb-2">{item.icon}</div>
                                <div className="font-semibold text-gray-800 mb-1 w-full truncate" title={item.title}>
                                    {item.title}
                                </div>
                                <span
                                    className="text-[#18c29c] font-medium hover:underline text-sm cursor-pointer"
                                >
                                    {item.action}
                                </span>
                            </div>
                        ))}
                    </div>
                    {/* Carousel for < 900px */}
                    <div className="md:hidden">
                        <Carousel itemsPerSlide={window.innerWidth > 600 ? 2 : 1}>
                            {quickActions.map((item, idx) => (
                                <div
                                    key={item.title}
                                    className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col items-start shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-1 hover:border-[#18c29c] cursor-pointer"
                                    onClick={item.onClick}
                                >
                                    <div className="mb-2">{item.icon}</div>
                                    <div className="font-semibold text-gray-800 mb-1 w-full truncate" title={item.title}>
                                        {item.title}
                                    </div>
                                    <span
                                        className="text-[#18c29c] font-medium hover:underline text-sm cursor-pointer truncate w-full block"
                                    >
                                        {item.action}
                                    </span>
                                </div>
                            ))}
                        </Carousel>
                    </div>
                </div>

                <h3 className="font-semibold mb-3">Contenidos gratuitos</h3>
                {/* Free Contents Responsive */}
                <div className="mb-8">
                    {/* Desktop grid */}
                    <div className="hidden md:grid grid-cols-3 gap-4">
                        {freeContents.map((content, idx) => (
                            <a
                                key={content.title}
                                href={content.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg hover:-translate-y-1 hover:border-[#18c29c] transition-all duration-200 flex items-center gap-2 text-[#223263] font-medium cursor-pointer"
                            >
                                <span className="text-lg">📄</span>
                                <span className="truncate w-full block" title={content.title}>{content.title}</span>
                            </a>
                        ))}
                    </div>
                    {/* Carousel for < 900px */}
                    <div className="md:hidden">
                        <Carousel itemsPerSlide={window.innerWidth > 600 ? 2 : 1}>
                            {freeContents.map((content, idx) => (
                                <a
                                    key={content.title}
                                    href={content.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg hover:-translate-y-1 hover:border-[#18c29c] transition-all duration-200 flex items-center gap-2 text-[#223263] font-medium cursor-pointer"
                                >
                                    <span className="text-lg">📄</span>
                                    <span className="" title={content.title}>{content.title}</span>
                                </a>
                            ))}
                        </Carousel>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default DashboardPage;