import React, { useState, useEffect } from 'react'
import { isAuthenticated, removeAuthToken } from '@/services/auth'
import useApiMethods from '@/hooks/useApiMethods'
import useEcommerceService from '@/services/ecommerceService'
import { useRouter } from 'next/navigation'
import UserLoginModal from './UserLoginModal'

const StoreHeader = ({isDarkMode, storeConfig, theme, setIsCartOpen, getTotalCartItems}) => {
    const router = useRouter();
    const [user, setUser] = useState(null)
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const { getMethod } = useApiMethods();
    const { loginUser } = useEcommerceService();

    // Verificar autenticación al cargar el componente
    useEffect(() => {
        checkAuthentication()
    }, [])

    const checkAuthentication = async () => {
        try {
            const auth = await isAuthenticated()
            
            if (auth) {
                // Verificar si es cliente y obtener datos del usuario
                const response = await getMethod('/auth/verify-client/', {}, true)
                
                if (response.is_client) {
                    // Es cliente, mantener sesión
                    setUser(response.user)
                } else {
                    // No es cliente, desautenticar
                    handleLogout()
                }
            } else {
                setUser(null)
            }
        } catch (error) {
            setUser(null)
        }
    }

    const handleLogout = () => {
        removeAuthToken()
        setUser(null)
        setShowProfileMenu(false)
        router.push('/store')
    }

    const handleLoginClick = () => {
        setShowProfileMenu(false);
        setShowLoginModal(true);
    }

    const handleLogin = async (loginData) => {
        try {
            // Usar el servicio de login
            const result = await loginUser(loginData.email, loginData.password);
            console.log('Login successful:', result);
            
            // Cerrar modal y verificar autenticación
            setShowLoginModal(false);
            await checkAuthentication();
        } catch (error) {
            console.error('Error en login:', error);
            throw error; // Re-lanzar el error para que el modal lo maneje
        }
    }

    const handleProfileClick = () => {
        setShowProfileMenu(false);
        router.push('/store/profile');
    }

    const getInitials = (user) => {
        if (!user) return 'U'
        const firstName = user.first_name || ''
        const lastName = user.last_name || ''
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U'
    }

    const toggleProfileMenu = () => {
        setShowProfileMenu(!showProfileMenu)
    }

    // Cerrar el menú si se hace clic fuera de él
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showProfileMenu && !event.target.closest('.profile-menu-container')) {
                setShowProfileMenu(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [showProfileMenu])

    return (
        <header className={`backdrop-blur-md shadow-lg sticky top-0 z-40  transition-colors duration-300 
            ${isDarkMode 
            ? 'bg-[#1e1e1e]/90 ' 
            : 'bg-white/90 '}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
                <div className="flex items-center gap-4">
                    {storeConfig?.logo && (
                        <img 
                            src={storeConfig.logo} 
                            alt={storeConfig.name || "Logo"} 
                            className={`h-10 w-10 object-cover rounded-lg border ${isDarkMode ? 'border-[#9a334d30]' : 'border-[#9a334d20]'}`}
                        />
                    )}
                    <h1 style={{ background: theme.primary.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} className="text-2xl font-bold">
                        {storeConfig?.name || 'Vinos Premium'}
                    </h1>
                </div>
                
                <div className="flex items-center gap-2">
                    {/* Botón del carrito - Solo mostrar si no es view_only */}
                    {!storeConfig?.view_only && (
                        <button
                        onClick={() => setIsCartOpen(true)}
                        style={{ backgroundColor: isDarkMode ? theme.text.dark.primary : theme.text.light.primary, color: isDarkMode ? theme.text.light.accent : theme.text.dark.accent, cursor: "pointer" }}
                        className={`relative p-3 transition-colors rounded-full`}
                        >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-4 4m4-4v6a1 1 0 001 1h1m0 0h8a1 1 0 001-1v-1a1 1 0 00-1-1h-8" />
                        </svg>
                        {getTotalCartItems() > 0 && (
                            <span style={{ background: theme.primary.gradient }} className="absolute -top-2 -right-2 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-md">
                            {getTotalCartItems()}
                            </span>
                        )}
                        </button>
                    )}

                    {/* Botón de perfil/login */}
                    <div className="profile-menu-container relative">
                        <button
                            onClick={toggleProfileMenu}
                            className={`relative p-3 transition-colors rounded-full ${user ? '' : 'hover:bg-gray-100'}`}
                            style={{ 
                                backgroundColor: user 
                                    ? 'transparent' 
                                    : (isDarkMode ? theme.text.dark.primary : theme.text.light.primary),
                                color: user 
                                    ? 'white' 
                                    : (isDarkMode ? theme.text.light.accent : theme.text.dark.accent),
                                cursor: "pointer" 
                            }}
                        >
                            {user ? (
                                // Usuario logueado - mostrar círculo con iniciales
                                <div 
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md"
                                    style={{ background: theme.primary.gradient }}
                                >
                                    {getInitials(user)}
                                </div>
                            ) : (
                                // Usuario no logueado - mostrar ícono
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            )}
                        </button>

                        {/* Menú desplegable */}
                        {showProfileMenu && (
                            <div className={`absolute right-0 mt-2 w-48 py-2 rounded-lg shadow-lg z-50 border transition-all duration-200 ${
                                isDarkMode 
                                    ? 'bg-[#2d2d2d] border-[#404040] text-white' 
                                    : 'bg-white border-gray-200 text-gray-800'
                            }`}>
                                {user ? (
                                    // Menú para usuario logueado
                                    <>
                                        <div className={`px-4 py-2 border-b ${isDarkMode ? 'border-[#404040]' : 'border-gray-200'}`}>
                                            <p className="text-sm font-medium">
                                                {user.first_name} {user.last_name}
                                            </p>
                                            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                {user.email}
                                            </p>
                                        </div>
                                        <button
                                            onClick={handleProfileClick}
                                            className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                                                isDarkMode 
                                                    ? 'hover:bg-[#404040] text-gray-200' 
                                                    : 'hover:bg-gray-100 text-gray-700'
                                            }`}
                                        >
                                            Ver perfil
                                        </button>
                                        <button
                                            onClick={handleLogout}
                                            className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                                                isDarkMode 
                                                    ? 'hover:bg-[#404040] text-red-400' 
                                                    : 'hover:bg-gray-100 text-red-600'
                                            }`}
                                        >
                                            Cerrar sesión
                                        </button>
                                    </>
                                ) : (
                                    // Menú para usuario no logueado
                                    <button
                                        onClick={handleLoginClick}
                                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                                            isDarkMode 
                                                ? 'hover:bg-[#404040] text-gray-200' 
                                                : 'hover:bg-gray-100 text-gray-700'
                                        }`}
                                    >
                                        Iniciar sesión
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                    
                    {/* Mensaje si es view_only */}
                    {storeConfig?.view_only && (
                        <div style={{ color: isDarkMode ? theme.text.dark.secondary : theme.text.light.secondary }} className={`text-sm font-medium`}>
                            Modo catálogo
                        </div>
                    )}

                </div>
            </div>
            </div>

            <UserLoginModal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                onLogin={handleLogin}
                isDarkMode={isDarkMode}
                theme={theme}
            />
        </header>
    )
}

export default StoreHeader