
import React, { useState } from "react";
import { IoHome } from "react-icons/io5";
import { IoStatsChart } from "react-icons/io5";
import { IoHandLeftSharp } from "react-icons/io5";
import { IoPeopleSharp } from "react-icons/io5";
import { useAppContext } from "../context/appcontext";
import { useAuthContext } from "../context/authcontext";
import { IoTicket } from "react-icons/io5";

// Componente de botón estilo Google usando solo TailwindCSS
const GoogleStyleButton: React.FC<{
    onClick: () => void;
    isActive: boolean;
    icon: React.ReactNode;
    label: string;
}> = ({ onClick, isActive, icon, label }) => {
    const [isClicked, setIsClicked] = useState(false);

    const handleClick = () => {
        setIsClicked(true);
        setTimeout(() => setIsClicked(false), 300);
        onClick();
    };

    return (
        <button
            onClick={handleClick}
            className={`
                group relative flex items-center w-full gap-x-3 rounded-xl px-4 py-3 
                transition-all duration-300 ease-out overflow-hidden
                transform-gpu will-change-transform
                ${isActive 
                    ? 'bg-blue-50 text-blue-700 shadow-md border border-blue-200/60 scale-[1.02]' 
                    : 'text-gray-700 hover:bg-gray-50 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] hover:-translate-y-0.5'
                }
                ${isClicked ? 'animate-pulse scale-95' : ''}
            `}
        >
            {/* Efecto de ripple usando solo Tailwind */}
            {isClicked && (
                <div className="absolute inset-0 bg-blue-200/30 rounded-xl animate-ping" />
            )}
            
            {/* Icono con micro-animación */}
            <span className={`
                transition-all duration-300 ease-out
                ${isActive 
                    ? 'text-blue-600 scale-110 rotate-3' 
                    : 'group-hover:scale-110 group-hover:text-gray-900 group-hover:rotate-2'
                }
            `}>
                {icon}
            </span>
            
            {/* Texto con transición suave */}
            <span className={`
                text-sm font-medium transition-all duration-300 ease-out
                ${isActive 
                    ? 'text-blue-700 font-semibold' 
                    : 'group-hover:text-gray-900 group-hover:font-medium'
                }
            `}>
                {label}
            </span>

            {/* Indicador de estado activo */}
            {isActive && (
                <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
            )}

            {/* Borde sutil en hover */}
            <div className={`
                absolute inset-0 rounded-xl border-2 border-transparent
                transition-all duration-300 ease-out
                ${!isActive ? 'group-hover:border-gray-200/50' : 'border-blue-300/50'}
            `} />
        </button>
    );
};

export const Navbar: React.FC = () => {

    const {setMenu, menu} = useAppContext()
    const {logout, currentUser} = useAuthContext()

    return (
        <nav className="w-full flex-1 max-w-2xs bg-white p-6 flex flex-col justify-between rounded-md shadow-lg border border-gray-100 backdrop-blur-sm">
            {/* Navegación principal */}
            <ul className="flex flex-col gap-y-2">
                <li>
                    <GoogleStyleButton
                        onClick={() => setMenu(1)}
                        isActive={menu === 1}
                        icon={<IoHome className="w-5 h-5" />}
                        label="Inicio"
                    />
                </li>
                <li>
                    <GoogleStyleButton
                        onClick={() => setMenu(2)}
                        isActive={menu === 2}
                        icon={<IoPeopleSharp className="w-5 h-5" />}
                        label="Personal"
                    />
                </li>
                <li>
                    <GoogleStyleButton
                        onClick={() => setMenu(4)}
                        isActive={menu === 4}
                        icon={<IoStatsChart className="w-5 h-5" />}
                        label="Estadísticas"
                    />
                </li>
                <li>
                    <GoogleStyleButton
                        onClick={() => setMenu(5)}
                        isActive={menu === 5}
                        icon={<IoTicket className="w-5 h-5" />}
                        label="Nuevo Ticket"
                    />
                </li>
            </ul>

            {/* Sección inferior con información del usuario */}
            <div className="flex flex-col gap-y-3 pt-6 border-t border-gray-200/60">
                {/* Información del usuario con efectos */}
                <div className="group flex items-center gap-x-3 px-3 py-3 rounded-xl bg-gradient-to-r from-gray-50/80 to-blue-50/30 hover:from-blue-50/60 hover:to-indigo-50/40 transition-all duration-300 ease-out hover:shadow-md hover:scale-[1.02]">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 ease-out">
                        <span className="text-white text-sm font-bold">
                            {currentUser?.email?.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-900 transition-colors duration-300">
                            {currentUser?.email}
                        </p>
                        <div className="flex items-center gap-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <p className="text-xs text-gray-600 group-hover:text-blue-600 transition-colors duration-300">Usuario activo</p>
                        </div>
                    </div>
                </div>
                
                {/* Botón de cerrar sesión con efectos mejorados */}
                <button 
                    onClick={logout}
                    className="
                        group relative flex items-center justify-center gap-x-2 w-full px-4 py-3 
                        text-sm font-medium text-gray-700 
                        rounded-xl border-2 border-gray-200/60
                        hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 
                        hover:border-red-300/60 hover:text-red-700
                        hover:shadow-lg hover:scale-[1.02] hover:-translate-y-0.5
                        active:scale-[0.98] active:translate-y-0
                        transition-all duration-300 ease-out
                        focus:outline-none focus:ring-4 focus:ring-red-500/20 focus:border-red-400
                        transform-gpu will-change-transform
                    "
                >
                    {/* Efecto de fondo animado */}
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 to-pink-500/0 group-hover:from-red-500/5 group-hover:to-pink-500/5 rounded-xl transition-all duration-300"></div>
                    
                    {/* Icono con animación */}
                    <svg className="w-4 h-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    
                    {/* Texto con transición */}
                    <span className="relative z-10 group-hover:font-semibold transition-all duration-300">
                        Cerrar Sesión
                    </span>

                    {/* Indicador de hover */}
                    <div className="absolute right-2 w-1 h-1 bg-red-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-all duration-300"></div>
                </button>
                
                {/* Footer con efecto sutil */}
                <div className="pt-2 border-t border-gray-100/60">
                    <p className="text-xs text-gray-400 text-center group-hover:text-gray-500 transition-colors duration-300">
                        Todos los derechos reservados
                    </p>
                </div>
            </div>
        </nav>
    )
}